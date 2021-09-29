import Vue from 'vue';
import Router from 'vue-router';

import Logging from './pages/Logging';
import Metrics from './pages/Metrics';

Vue.use(Router);

export function createRouter() {
  return new Router({
    mode:   'history',
    routes: [
      {
        path:      '/',
        redirect: { name: 'logging' }
      },
      {
        name:      'logging',
        path:      '/logging',
        component: Logging
      },
      {
        path:      '/metrics',
        component: Metrics
      }
    ]
  });
}
