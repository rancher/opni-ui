import Vue from 'vue';
import Router from 'vue-router';

import { createRoutesFromNavigation } from '@/utils/navigation';
import Logging from './pages/Logging';
// import Metrics from './pages/Metrics';
// import Preempt from './pages/Preempt';

Vue.use(Router);

export const NAVIGATION = {
  routes: [
    {
      path:      '/',
      redirect: { name: 'respond' },
      display:  false
    },
    {
      name:      'respond',
      path:      '/respond',
      labelKey:  'opni.nav.respond',
      icon:      'globe',
      component: Logging
    },
    // {
    //   name:      'preempt',
    //   path:      '/preempt',
    //   labelKey:  'opni.nav.preempt',
    //   icon:      'globe',
    //   component: Preempt
    // },
    // {
    //   path:      '/metrics',
    //   labelKey:  'opni.nav.metrics',
    //   icon:      'globe',
    //   display:   false,
    //   component: Metrics
    // }
  ]
};

export function createRouter() {
  return new Router({
    mode:   'history',
    routes: createRoutesFromNavigation(NAVIGATION)
  });
}
