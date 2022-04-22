import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';

import 'react-vis/dist/style.css';
import Main from './pages/Main';
import { CoreContext } from './utils/CoreContext';

export function renderApp(coreStart, params) {
  const isDarkMode = coreStart.uiSettings.get('theme:darkMode') || false;
  coreStart.chrome.setBreadcrumbs([{ text: 'Opni' }]);

  if (isDarkMode) {
    require('@elastic/charts/dist/theme_only_dark.css');
  } else {
    require('@elastic/charts/dist/theme_only_light.css');
  }

  ReactDOM.render(
    <Router>
      <CoreContext.Provider
        value={{ http: coreStart.http, isDarkMode, notifications: coreStart.notifications }}
      >
        <Route render={(props) => <Main title="Opni insights" {...props} />} />
      </CoreContext.Provider>
    </Router>,
    params.element
  );
  return () => ReactDOM.unmountComponentAtNode(params.element);
}
