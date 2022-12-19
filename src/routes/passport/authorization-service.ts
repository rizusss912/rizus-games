import { Cookies } from '$lib/enums/cookie';
import { error, type RequestEvent } from '@sveltejs/kit';
import { sign, verify } from 'jsonwebtoken';
import type { Transaction } from 'objection';
import { AnonymousAuth } from './bd/models/anonymous-auth';
import { Token, TokenType } from './bd/models/token';
import type { User } from './bd/models/user';

type TokenPayload = { userId: number; passiveUserIds: number[]; jti: number };
export type CreateAndSetTokensData = {
	event: RequestEvent;
	user: User;
	passiveUserIds: number[];
	transaction: Transaction;
};

export class AuthorizationService {
	private static readonly ACCESS_TOKEN_LIFETIME_SEC = 15 * 60; // 15 min
	private static readonly REFRESH_TOKEN_LIFETIME_SEC = 90 * 24 * 60 * 60; // 90 days
	private static readonly ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
	private static readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

	static registration(event: RequestEvent) {
		AuthorizationService.createAndSetTokens(event, { userId: 1 });
	}

	static async registrationAnonimus(event: RequestEvent, login: string) {
		await AnonymousAuth.createUserWithAnonymousAuth(login);
		AuthorizationService.createAndSetTokens(event, { userId: 1 });
	}

	static login(event: RequestEvent) {
		AuthorizationService.createAndSetTokens(event, { userId: 1 });
	}

	static async auth(event: RequestEvent): Promise<TokenPayload> {
		const accessTokenPayload = await AuthorizationService.getPayloadFromValidAccessToken(event);

		if (accessTokenPayload) {
			return accessTokenPayload;
		}

		const refreshTokenPayload = await AuthorizationService.getPayloadFromValidRefreshToken(event);

		if (!refreshTokenPayload) {
			throw error(403, 'Не авторизован');
		}

		AuthorizationService.createAndSetTokens(event, refreshTokenPayload);
		return refreshTokenPayload;
	}

	private static async getPayloadFromValidAccessToken(
		event: RequestEvent
	): Promise<TokenPayload | null> {
		return await AuthorizationService.getPayloadFromValidToken(
			event,
			Cookies.ACCESS_TOKEN,
			AuthorizationService.ACCESS_TOKEN_SECRET
		);
	}

	private static async getPayloadFromValidRefreshToken(
		event: RequestEvent
	): Promise<TokenPayload | null> {
		return await AuthorizationService.getPayloadFromValidToken(
			event,
			Cookies.REFRESH_TOKEN,
			AuthorizationService.REFRESH_TOKEN_SECRET
		);
	}

	private static async getPayloadFromValidToken(
		event: RequestEvent,
		cookie: Cookies,
		secret: string
	): Promise<TokenPayload | null> {
		const jwtToken = event.cookies.get(cookie);

		if (!jwtToken) {
			return null;
		}

		try {
			return (await verify(jwtToken, secret)) as TokenPayload;
		} catch {
			return null;
		}
	}

	private static async createAndSetTokens({
		event,
		user,
		passiveUserIds,
		transaction
	}: CreateAndSetTokensData) {
		const createTokenData = { user, passiveUserIds, transaction };
		const [accessToken, refreshToken] = await Promise.all([
			Token.createToken({ ...createTokenData, type: TokenType.ACCESS }),
			Token.createToken({ ...createTokenData, type: TokenType.REFRESH })
		]);
		const jwtTokenData = { userId: user.id, passiveUserIds };
		const jwtAccessTocken = AuthorizationService.getJwtAccessToken({
			...jwtTokenData,
			jti: accessToken.id
		});
		const jwtRefreshTocken = AuthorizationService.getJwtRefreshToken({
			...jwtTokenData,
			jti: refreshToken.id
		});
		const cookiesOptions = { httpOnly: true, secure: true, path: '/' };

		event.cookies.set(Cookies.ACCESS_TOKEN, jwtAccessTocken, {
			...cookiesOptions,
			maxAge: AuthorizationService.ACCESS_TOKEN_LIFETIME_SEC
		});
		event.cookies.set(Cookies.REFRESH_TOKEN, jwtRefreshTocken, {
			...cookiesOptions,
			maxAge: AuthorizationService.REFRESH_TOKEN_LIFETIME_SEC
		});
	}

	private static getJwtAccessToken(payload: TokenPayload) {
		return sign(payload, AuthorizationService.ACCESS_TOKEN_SECRET, {
			expiresIn: AuthorizationService.ACCESS_TOKEN_LIFETIME_SEC
		});
	}

	private static getJwtRefreshToken(payload: TokenPayload) {
		return sign(payload, AuthorizationService.REFRESH_TOKEN_SECRET, {
			expiresIn: AuthorizationService.REFRESH_TOKEN_LIFETIME_SEC
		});
	}
}
