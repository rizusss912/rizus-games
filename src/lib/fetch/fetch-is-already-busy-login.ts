export async function fetchIsAlreadyBusyLogin(login: string): Promise<boolean> {
	const response = await fetch(`/passport/login/check/${login}`);
	const { isAlreadyBusy } = await response.json();

	return isAlreadyBusy;
}
