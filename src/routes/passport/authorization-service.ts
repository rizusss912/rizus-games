import { Cookies } from '$lib/enums/cookie';
import { error, type RequestEvent } from '@sveltejs/kit';
import { sign, verify } from 'jsonwebtoken';

type TokenPayload = { userId: number };

export class AuthorizationService {
	private static readonly ACCESS_TOKEN_LIFETIME_SEC = 15 * 60; // 15 min
	private static readonly REFRESH_TOKEN_LIFETIME_SEC = 90 * 24 * 60 * 60; // 90 days
	private static readonly ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
	private static readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

	static registration(event: RequestEvent) {
		AuthorizationService.createAndSetTokens(event, { userId: 1 });
	}

	static registrationAnonimus(event: RequestEvent) {
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
		token: string
	): Promise<TokenPayload | null> {
		const refreshTocken = event.cookies.get(cookie);

		if (!refreshTocken) {
			return null;
		}

		try {
			return (await verify(refreshTocken, token)) as TokenPayload;
		} catch {
			return null;
		}
	}

	private static createAndSetTokens(event: RequestEvent, payload: TokenPayload) {
		const accessTocken = AuthorizationService.createAccessToken(payload);
		const refreshTocken = AuthorizationService.createRefreshToken(payload);

		event.cookies.set(Cookies.ACCESS_TOKEN, accessTocken, {
			httpOnly: true,
			secure: true,
			maxAge: AuthorizationService.ACCESS_TOKEN_LIFETIME_SEC,
			path: '/'
		});
		event.cookies.set(Cookies.REFRESH_TOKEN, refreshTocken, {
			httpOnly: true,
			secure: true,
			maxAge: AuthorizationService.REFRESH_TOKEN_LIFETIME_SEC,
			path: '/'
		});
	}

	private static createAccessToken(payload: TokenPayload) {
		return sign(payload, AuthorizationService.ACCESS_TOKEN_SECRET, {
			expiresIn: AuthorizationService.ACCESS_TOKEN_LIFETIME_SEC
		});
	}

	private static createRefreshToken(payload: TokenPayload) {
		return sign(payload, AuthorizationService.REFRESH_TOKEN_SECRET, {
			expiresIn: AuthorizationService.REFRESH_TOKEN_LIFETIME_SEC
		});
	}
}
