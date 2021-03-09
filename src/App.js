import React, {useEffect, useState} from 'react';

import {getUsers} from './request';

function App() {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		getUsers().then(res => {
			setUsers(res.items);
		})
	}, []);

	return (
		<div>
			<h1>Users:</h1>

			{users.map(user => (
				<div key={user.id}>
					{user.givenName} {user.familyName}
				</div>
			))}
		</div>
	);
}

export default App;