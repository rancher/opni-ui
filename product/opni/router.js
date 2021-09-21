import Vue from 'vue';
import Router from 'vue-router';

import Test from './pages/test';
import Logging from './pages/Logging';
import Metrics from './pages/Metrics';

Vue.use(Router);

export function createRouter() {
  return new Router({
    mode:   'history',
    routes: [
      {
        path:      '/',
        component: Test
      },
      {
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
