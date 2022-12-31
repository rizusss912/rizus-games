import { get, writable } from 'svelte/store';

export type LoginIsAlreadyBusyLoginPromiseMap = Record<string, Promise<boolean>>;
export type LoginIsAlreadyBusyLoginMap = Record<string, boolean>;

export const loginIsAlreadyBusyLoginMap = writable<LoginIsAlreadyBusyLoginMap>({});
export const loginIsAlreadyBusyLoginPromiseMap = writable<LoginIsAlreadyBusyLoginPromiseMap>({});

export async function fetchOrGetIsAlreadyBusyLogin(login: string): Promise<boolean> {
	if (get(loginIsAlreadyBusyLoginMap)[login]) {
		return get(loginIsAlreadyBusyLoginMap)[login];
	}

	if (!get(loginIsAlreadyBusyLoginPromiseMap)[login] && login) {
		const isAlreadyBusyPromise = fetch(`/passport/login/check/${login}`)
			.then((response) => response.json())
			.then(({ isAlreadyBusy }) => isAlreadyBusy);

		loginIsAlreadyBusyLoginPromiseMap.set({
			...get(loginIsAlreadyBusyLoginPromiseMap),
			[login]: isAlreadyBusyPromise
		});

		isAlreadyBusyPromise.then((isAlreadyBusy) =>
			loginIsAlreadyBusyLoginMap.set({ ...get(loginIsAlreadyBusyLoginMap), [login]: isAlreadyBusy })
		);

		return isAlreadyBusyPromise;
	}

	return get(loginIsAlreadyBusyLoginPromiseMap)[login];
}
