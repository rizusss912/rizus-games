import { Cookies } from '$lib/enums/cookie';
import { error, type RequestEvent } from '@sveltejs/kit';
import { sign, verify } from 'jsonwebtoken';
import type { Transaction } from 'objection';
import { Token, TokenType, type AuthResult, type TokenPayload } from './bd/models/token';
import { User, type UserData } from './bd/models/user';

const TOKEN_SECRET: Record<TokenType, string> = {
	[TokenType.ACCESS]: process.env.ACCESS_TOKEN_SECRET!,
	[TokenType.REFRESH]: process.env.REFRESH_TOKEN_SECRET!
};
const TOKEN_COOKIE: Record<TokenType, Cookies> = {
	[TokenType.ACCESS]: Cookies.ACCESS_TOKEN,
	[TokenType.REFRESH]: Cookies.REFRESH_TOKEN
};
const TOKEN_LIFETIME_SEC: Record<TokenType, number> = {
	[TokenType.ACCESS]: 15, // 15 sec
	[TokenType.REFRESH]: 90 * 24 * 60 * 60 // 90 days
};

type GetValidTokenData = { event: RequestEvent; type: TokenType };
export type CreateAndSetTokensData = {
	event: RequestEvent;
	userId: number;
	passiveUserIds: number[];
	transaction: Transaction;
};
export type RegistrationData = {
	login: string;
	password: string;
	event: RequestEvent;
	transaction: Transaction;
};

export type AddActiveUserForAuthData = {
	refreshToken: Token;
	event: RequestEvent;
	transaction: Transaction;
	userId: number;
};

export type LoginData = {
	login: string;
	password: string;
	event: RequestEvent;
	transaction: Transaction;
};
export type GetTokensAndMaybeRefreshData = {
	event: RequestEvent;
	transaction: Transaction;
};

export type RemoveAndCreateTokensData = {
	event: RequestEvent;
	transaction: Transaction;
	userId: number;
	passiveUserIds: number[];
};

export type Tokens = { accessToken: Token; refreshToken: Token };
export type DeleteTokensData = {
	accessToken: Token | null;
	refreshToken: Token | null;
	transaction: Transaction;
};
export type GetAuthResultData = {
	userId: number;
	passiveUserIds: number[];
};
export type RefreshTokensData = DeleteTokensData & CreateAndSetTokensData;
export type RemoveActiveTokensData = {
	event: RequestEvent;
	transaction: Transaction;
};

export class AuthorizationService {
	public static async getTokens(event: RequestEvent) {
		console.debug('[AuthorizationService] getTokens');
		const [accessToken, refreshToken] = await Promise.all([
			AuthorizationService.getValidToken({ event, type: TokenType.ACCESS }),
			AuthorizationService.getValidToken({ event, type: TokenType.REFRESH })
		]);
		return { accessToken, refreshToken };
	}

	public static async getAuthResult({
		userId,
		passiveUserIds
	}: GetAuthResultData): Promise<AuthResult> {
		console.debug('[AuthorizationService] getAuthResult');
		const users = await User.getUsersByUserIds([userId, ...passiveUserIds]);
		//TODO надо оптимизировать
		const usersDataPromises = users.map((user) => user.getData());

		const usersData = await Promise.all(usersDataPromises);

		let userData: UserData | undefined;
		const passiveUsersData: UserData[] = [];

		for (const data of usersData) {
			if (data.id === userId) {
				userData = data;
			} else {
				passiveUsersData.push(data);
			}
		}

		if (!userData) {
			throw error(500, `Не удалось найти данные пользователя по id ${userId}`);
		}

		if (passiveUsersData.length !== passiveUserIds.length) {
			throw error(500, 'Не удалось найти часть данных пользователей');
		}

		return {
			userData,
			passiveUsersData
		};
	}

	public static async removeAndCreateTokens(data: RemoveAndCreateTokensData): Promise<Tokens> {
		console.debug('[AuthorizationService] removeAndCreateTokens');
		await AuthorizationService.removeActiveTokens(data);
		return AuthorizationService.createAndSetTokens(data);
	}

	public static async removeActiveTokens({ event, transaction }: RemoveActiveTokensData) {
		console.debug('[AuthorizationService] removeActiveTokens');
		const tokens = await AuthorizationService.getTokens(event);
		await AuthorizationService.deleteTokens({ ...tokens, transaction });
	}

	public static async refreshTokens(data: RefreshTokensData): Promise<Tokens> {
		console.debug('[AuthorizationService] refreshTokens');
		const [newTokens] = await Promise.all([
			AuthorizationService.createAndSetTokens(data),
			AuthorizationService.deleteTokens(data)
		]);
		return newTokens;
	}

	public static async deleteTokens({ accessToken, refreshToken, transaction }: DeleteTokensData) {
		console.debug('deleteTokens');
		const deleteTokensPromises = [];
		if (accessToken) {
			deleteTokensPromises.push(Token.deleteTokenById({ tokenId: accessToken.id, transaction }));
		}
		if (refreshToken) {
			deleteTokensPromises.push(Token.deleteTokenById({ tokenId: refreshToken.id, transaction }));
		}

		await Promise.all(deleteTokensPromises);
	}

	public static async createAndSetTokens({
		event,
		userId,
		passiveUserIds,
		transaction
	}: CreateAndSetTokensData) {
		console.debug('[AuthorizationService] createAndSetTokens');
		const createTokenData = { userId, passiveUserIds, transaction };
		const [accessToken, refreshToken] = await Promise.all([
			Token.createToken({ ...createTokenData, type: TokenType.ACCESS }),
			Token.createToken({ ...createTokenData, type: TokenType.REFRESH })
		]);
		const jwtTokenData = { userId, passiveUserIds };
		const jwtAccessTocken = AuthorizationService.getJwtToken(
			{
				...jwtTokenData,
				jti: accessToken.id
			},
			TokenType.ACCESS
		);
		const jwtRefreshTocken = AuthorizationService.getJwtToken(
			{
				...jwtTokenData,
				jti: refreshToken.id
			},
			TokenType.REFRESH
		);
		const cookiesOptions = { httpOnly: true, secure: false, path: '/' };

		event.cookies.set(Cookies.ACCESS_TOKEN, jwtAccessTocken, {
			...cookiesOptions,
			maxAge: TOKEN_LIFETIME_SEC[TokenType.ACCESS]
		});
		event.cookies.set(Cookies.REFRESH_TOKEN, jwtRefreshTocken, {
			...cookiesOptions,
			maxAge: TOKEN_LIFETIME_SEC[TokenType.REFRESH]
		});

		return { accessToken, refreshToken };
	}

	private static async getValidToken({ event, type }: GetValidTokenData): Promise<Token | null> {
		console.debug(`[AuthorizationService] getValidToken. type: ${type}`);
		const payload = await AuthorizationService.getPayloadFromValidToken({ event, type });

		if (!payload) {
			return null;
		}

		return await Token.verifyTokenById(payload.jti);
	}

	private static async getPayloadFromValidToken({
		event,
		type
	}: GetValidTokenData): Promise<TokenPayload | null> {
		console.debug(`[AuthorizationService] getPayloadFromValidToken. type: ${type}`);
		const jwtToken = event.cookies.get(TOKEN_COOKIE[type]);

		if (!jwtToken) {
			return null;
		}

		try {
			return (await verify(jwtToken, TOKEN_SECRET[type])) as TokenPayload;
		} catch {
			return null;
		}
	}

	private static getJwtToken(payload: TokenPayload, type: TokenType) {
		return sign(payload, TOKEN_SECRET[type], {
			expiresIn: TOKEN_LIFETIME_SEC[type]
		});
	}
}
