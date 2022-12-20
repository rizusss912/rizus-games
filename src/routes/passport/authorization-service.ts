import { AuthType } from '$lib/enums/auth-type';
import { Cookies } from '$lib/enums/cookie';
import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { sign, verify } from 'jsonwebtoken';
import type { Transaction } from 'objection';
import { AnonymousAuth } from './bd/models/anonymous-auth';
import { PasswordAuth } from './bd/models/password-auth';
import { Token, TokenType, type AuthResult, type TokenPayload } from './bd/models/token';
import { User } from './bd/models/user';

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

type RegistrationAnonimusData = { event: RequestEvent; login: string; transaction: Transaction };
type AuthData = { event: RequestEvent; transaction: Transaction };
interface RefreshTokensData extends TokenPayload {
	event: RequestEvent;
	transaction: Transaction;
}
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

export class AuthorizationService {
	static async registrationByPassword({ event, login, transaction, password }: RegistrationData) {
		const refreshToken = await AuthorizationService.getValidToken({
			event,
			type: TokenType.REFRESH
		});

		if (!refreshToken) {
			const { user } = await PasswordAuth.createUserWithPasswordAuth({
				transaction,
				password,
				login
			});
			await AuthorizationService.createAndSetTokens({
				event,
				userId: user.id,
				transaction,
				passiveUserIds: []
			});
			return;
		}

		const { userId, passiveUserIds, jti } = await refreshToken.getPayload();
		const auhs = await User.getAuthsById(userId);

		if (auhs[AuthType.PASSWORD]) {
			const { user } = await PasswordAuth.createUserWithPasswordAuth({
				transaction,
				password,
				login
			});

			await AuthorizationService.refreshTokens({
				event,
				transaction,
				userId: user.id,
				passiveUserIds: [userId, ...passiveUserIds],
				jti
			});
		} else if (auhs[AuthType.ANONYMOUS]) {
			await PasswordAuth.createPasswordAuthForUser({
				userId,
				login,
				password,
				transaction
			});
			await AuthorizationService.refreshTokens({ event, transaction, userId, passiveUserIds, jti });
		}
	}

	static async registrationAnonimus({ event, login, transaction }: RegistrationAnonimusData) {
		const { user } = await AnonymousAuth.createUserWithAnonymousAuth({ login, transaction });
		await AuthorizationService.createAndSetTokens({
			event,
			userId: user.id,
			transaction,
			passiveUserIds: []
		});
	}

	static login(event: RequestEvent) {
		//AuthorizationService.createAndSetTokens(event, { userId: 1 });
	}

	static async auth({ event, transaction }: AuthData): Promise<AuthResult> {
		const { accessToken, refreshToken } = await AuthorizationService.getTokens(event);

		if (accessToken) {
			const payload = await accessToken.getPayload();
			return await AuthorizationService.getAuthResultByTokenPayload(payload);
		}

		if (!refreshToken) {
			throw error(403, 'Не авторизован');
		}

		const payload = await refreshToken.getPayload();
		await AuthorizationService.refreshTokens({
			event,
			transaction,
			...payload
		});

		return await AuthorizationService.getAuthResultByTokenPayload(payload);
	}

	private static async getTokens(event: RequestEvent) {
		const [accessToken, refreshToken] = await Promise.all([
			AuthorizationService.getValidToken({ event, type: TokenType.ACCESS }),
			AuthorizationService.getValidToken({ event, type: TokenType.REFRESH })
		]);
		return { accessToken, refreshToken };
	}

	private static async getAuthResultByTokenPayload({
		userId,
		passiveUserIds
	}: TokenPayload): Promise<AuthResult> {
		const users = await User.query().findByIds([userId, ...passiveUserIds]);
		const userDataPromices = users.map((user) => user.getData()).reverse();
		const [userData, ...passiveUsersData] = await Promise.all(userDataPromices);
		return {
			userData,
			passiveUsersData
		};
	}

	private static async getValidToken({ event, type }: GetValidTokenData): Promise<Token | null> {
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

	private static async refreshTokens({
		event,
		transaction,
		userId,
		passiveUserIds,
		jti
	}: RefreshTokensData) {
		const [newTokens] = await Promise.all([
			AuthorizationService.createAndSetTokens({ event, userId, passiveUserIds, transaction }),
			Token.deleteTokenById({ tokenId: jti, transaction })
		]);

		return newTokens;
	}

	private static async createAndSetTokens({
		event,
		userId,
		passiveUserIds,
		transaction
	}: CreateAndSetTokensData) {
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

	private static getJwtToken(payload: TokenPayload, type: TokenType) {
		return sign(payload, TOKEN_SECRET[type], {
			expiresIn: TOKEN_LIFETIME_SEC[type]
		});
	}
}
