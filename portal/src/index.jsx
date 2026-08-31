import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import '@toast-ui/editor/dist/toastui-editor.css';
import './index.css';
import ReactDOM from 'react-dom/client';
import { KineticLib } from '@kineticdata/react';
import { App } from './App.jsx';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux.js';

// Asynchronously import the global dependencies that are used in the embedded
// forms. Note that we deliberately do this as a const so that it should start
// immediately without making the initial application load wait, but the
// CoreForm component will wait for this to be loaded.
const globals = import('./components/kinetic-form/globals.jsx');

ReactDOM.createRoot(document.getElementById('root')).render(
  // Kinetic connection layer
  <Provider store={store}>
    <KineticLib globals={globals} locale="en">
      {kineticProps => (
        <HashRouter>
          <App {...kineticProps} />
        </HashRouter>
      )}
    </KineticLib>
  </Provider>,
);
