import Vue from 'vue';
import Router from 'vue-router';

import { createRoutesFromNavigation } from '@/utils/navigation';
import Clusters from './pages/Clusters';
import Cluster from './pages/Cluster';
import Tokens from './pages/Tokens';
import RBAC from './pages/RBAC';
import Configuration from './pages/Configuration';

Vue.use(Router);

export const NAVIGATION = {
  routes: [
    {
      path:      '/',
      redirect: { name: 'clusters' },
      display:  false
    },
    {
      name:      'clusters',
      path:      '/clusters',
      labelKey:  'opni.nav.clusters',
      icon:      'globe',
      component: Clusters
    },
    {
      name:      'cluster',
      path:      '/cluster',
      labelKey:  'opni.nav.clusters',
      icon:      'globe',
      component: Cluster,
      display:   false
    },
    {
      name:      'cluster',
      path:      '/cluster/create',
      labelKey:  'opni.nav.clusters',
      icon:      'globe',
      component: Cluster,
      display:   false
    },
    {
      name:      'tokens',
      path:      '/tokens',
      labelKey:  'opni.nav.tokens',
      icon:      'globe',
      component: Tokens
    },
    {
      name:      'rbac',
      path:      '/rbac',
      labelKey:  'opni.nav.rbac',
      icon:      'globe',
      component: RBAC
    },
    {
      name:      'configuration',
      path:      '/configuration',
      labelKey:  'opni.nav.configuration',
      icon:      'globe',
      component: Configuration
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
