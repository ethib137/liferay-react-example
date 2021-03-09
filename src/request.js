export function getUsers() {
	return Liferay.Util.fetch(
		'/o/headless-admin-user/v1.0/user-accounts',
		{method: 'GET'}
	).then(res => res.json());
}