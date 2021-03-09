# Liferay React Example

Developed with:
```
node: v10.16.3
npm: 6.9.0
yo: 3.1.1
liferay-js: 2.23.0
```

1. Install node & npm (https://nodejs.org/en/download/)
2. Install yo `npm install -g yo`
3. Install liferay-js `npm install -g generator-liferay-js`
4. Run the Liferay JS Generator: `yo liferay-js` and follow the prompts.

At this stage you already have a working Liferay JS widget. You can run `npm run deploy` to deploy it.

You can find the widget under the Widgets menu in the Sample category and add the widget to any page in your Liferay instance. 

Next we need to update our babel dependencies.

5. In the `package.json` replace:
```
"babel-cli": "6.26.0",
"babel-preset-env": "1.7.0",
"babel-preset-react": "6.24.1",
"babel-loader": "7.1.5"
```
with
```
"@babel/cli": "^7.7.5",
"@babel/core": "^7.7.5",
"@babel/preset-env": "^7.7.6",
"@babel/preset-react": "^7.7.4"
```

6. Then replace the contents of the `.babelrc` file with the following:
```
{
	"presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

This will allow use of additional React features such as [hooks](https://reactjs.org/docs/hooks-intro.html).

7. To make sure we have updated our dependencies, remove the `node_modules` directory `rm -fr node_modules` and run `npm install`. This will update our `package-lock.json` file.

We can now create our first React component.

8. In src create a new file: `App.js` with the following contents:
```
import React from 'react';

function App() {
	return (
		<h1>Hello World</h1>
	);
}

export default App;
```

We can include this component in our entry file `index.js`.

9. At the top of `index.js` add the following imports:
```
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
```

10. Then replace the export statement in `index.js` with the following:
```
export default function main({portletNamespace, contextPath, portletElementId, configuration}) {
	ReactDOM.render(
		<App />,
		document.getElementById(portletElementId)
	);
}
```

After saving your changes you can deploy the app to see a simple app that prints out "Hello World".

## React Hooks

Read about the React Hooks [here](https://reactjs.org/docs/hooks-overview.html#state-hook).

The first React Hook we will use is the `useState` hook. Be sure to read about it before you begin. `useState` returns a pair: the current state value and a function that lets you update it. The only argument to useState is the initial state. We will use this hook to create a counter to see the value provided by React's state managment.

11. To use the `useState` hook, we have to import it. Change the line importing React in App.js to the following:
```
import React, {useState} from 'react';
```

After adding this import we can make use of `useState` in our component.

12. Replace the body of our App function in `App.js` with the following:
```
const [count, setCount] = useState(0);

return (
	<div>
		<h1>Hello World</h1>

		<button className="btn btn-primary" onClick={() => setCount(count + 1)}>Increment: {count}</button>
	</div>
);
```

This block of code creates a `count` variable that will be updated when we call the function `useCount`. We are providing it an initial value of `0`. We've modified our return statement to include a button that when clicked will call `setCount` and whose label displays the count.

## Calling APIs

We can call APIs in Liferay using the function `Liferay.Util.fetch` which is a simple wrapper around the web `fetch` api that handles authentication within Liferay.

Let's create a call to Liferay's APIs to return a list of users.

13. Create a new file `src/request.js` with the following contents:
```
export function getUsers() {
	return Liferay.Util.fetch(
		'/o/headless-admin-user/v1.0/user-accounts',
		{method: 'GET'}
	).then(res => res.json());
}
```

14. Replace the content of `App.js` with the following:
```
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
```

We've added another hook, [`useEffect`](https://reactjs.org/docs/hooks-overview.html#effect-hook). This hook was created by React to properly handle side effects. It accepts a function and an array of dependencies. The function will only run when any of the dependencies change. By passing it an empty array we are telling it to only run once, which means our call to `getUsers` will only run once.

This function returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). When this promise is returned we then call the function `setUsers` with the items returned by our api call.

In our return statement we are iterating through our users using the [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) function and render the name of each user inside a div.

Go ahead and deploy this and see how it works.

We just saw how to get data from Liferay, but how do we get data from Liferay. Next let's create a component to add a user to Liferay.

For this we are also going to use a pre-built React component from [Clay](https://clayui.com/docs/components/input.html).

15. To use a Clay component we first have to install it's npm module by running `npm install @clayui/form`. 

After installing we can use it in our component by importing it like this: `import ClayForm, {ClayInput} from '@clayui/form';`.

To add a user we need to make another api call.

16. Add the following method to the `request.js` file:
```
export function addUser({emailAddress, familyName, givenName, userName}) {
	const data = {
		alternateName: userName,
		emailAddress,
		familyName,
		givenName
	};

	const headers = new Headers();

	headers.append('Content-Type', 'application/json');

	const request = {
		body: JSON.stringify(data),
		headers,
		method: 'POST'
	};

	return Liferay.Util.fetch(
		'/o/headless-admin-user/v1.0/user-accounts',
		request
	).then(res => res.json());
}
```

17. Create a new file `src/AddUserForm.js` with the following contents:
```
import React, {useCallback, useEffect, useState} from 'react';
import ClayForm, {ClayInput} from '@clayui/form';

import {addUser} from './request';

function AddUserForm() {
	const [emailAddress, setEmailAddress] = useState('');
	const [familyName, setFamilyName] = useState('');
	const [givenName, setGivenName] = useState('');
	const [userName, setUserName] = useState('');

	const onButtonSubmit = useCallback(() => {
		addUser({
			emailAddress,
			familyName,
			givenName,
			userName
		}).then(() => {
			setEmailAddress('');
			setFamilyName('');
			setGivenName('');
			setUserName('');
		});
	},
	[
		addUser,
		emailAddress,
		familyName,
		givenName,
		userName
	]);

	return (
		<div>
			<h1>Add User Form</h1>

			<ClayForm.Group>
				<label htmlFor="givenName">Given Name</label>

				<ClayInput
					id="givenName"
					onChange={event => setGivenName(event.target.value)}
					placeholder="Joe"
					type="text"
					value={givenName}
				/>
			</ClayForm.Group>
			<ClayForm.Group>
				<label htmlFor="familyName">Family Name</label>

				<ClayInput
					id="familyName"
					onChange={event => setFamilyName(event.target.value)}
					placeholder="Bloggs"
					type="text"
					value={familyName}
				/>
			</ClayForm.Group>
			<ClayForm.Group>
				<label htmlFor="emailAddress">Email Address</label>

				<ClayInput
					id="emailAddress"
					onChange={event => setEmailAddress(event.target.value)}
					placeholder="joe.bloggs@liferay.com"
					type="text"
					value={emailAddress}
				/>
			</ClayForm.Group>
			<ClayForm.Group>
				<label htmlFor="userName">User Name</label>

				<ClayInput
					id="userName"
					onChange={event => setUserName(event.target.value)}
					placeholder="jBloggs"
					type="text"
					value={userName}
				/>
			</ClayForm.Group>

			<button className="btn btn-primary" onClick={() => onButtonSubmit()}>Add User</button>
		</div>
	);
}

export default AddUserForm;
```

17. Finally, replace the contents of `App.js` with the following:
```
import React, {useEffect, useState} from 'react';

import AddUserForm from './AddUserForm';

import {getUsers} from './request';

function App() {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		getUsers().then(res => {
			setUsers(res.items);
		})
	}, []);

	return (
		<div className="row">
			<div className="col-4">
				<h1>Users:</h1>

				{users.map(user => (
					<div key={user.id}>
						{user.givenName} {user.familyName}
					</div>
				))}
			</div>
			<div className="col-8">
				<AddUserForm />
			</div>
		</div>
	);
}

export default App;
```

After deploying you will now have an app that can add users in addition to listing existing users. All the fields in the form are required, so if you don't add all of them you will end up with some javascript errors. We have not added the ability to automatically update the user list, so you will need to refresh the page after creating a user to see the new user in your list.

## Topics to Cover

* useCallback
* React Controlled Form Inputs
* Error Handling
* Etc.