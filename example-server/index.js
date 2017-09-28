import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';

// This script will run in the browser
// and will render our component using the
// value from APP_PROPS that we generate
// inline in the page's html on the server.
// If these props match what is used in the server render, React will see that
// it doesn't need to generate any DOM and the page will load faster

ReactDOM.render(
  <App items={[]} />,
  document.getElementById('content')
);
