import Vue from 'vue';
import Router from 'vue-router';

import { createRoutesFromNavigation } from '@/utils/navigation';
import Logging from './pages/Logging';
import Metrics from './pages/Metrics';

Vue.use(Router);

export const NAVIGATION = {
  routes: [
    {
      path:      '/',
      redirect: { name: 'logging' },
      display:  false
    },
    {
      name:      'logging',
      path:      '/logging',
      labelKey:  'opni.nav.logging',
      icon:      'globe',
      component: Logging
    },
    {
      path:      '/metrics',
      labelKey:  'opni.nav.metrics',
      icon:      'globe',
      display:   false,
      component: Metrics
    }
  ]
};

export function createRouter() {
  return new Router({
    mode:   'history',
    routes: createRoutesFromNavigation(NAVIGATION)
  });
}
