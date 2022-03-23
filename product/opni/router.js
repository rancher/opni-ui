import Vue from 'vue';
import Router from 'vue-router';

import { createRoutesFromNavigation } from '@/utils/navigation';
import Clusters from './pages/Clusters';
import Cluster from './pages/Cluster';
import Tokens from './pages/Tokens';
import RBAC from './pages/RBAC';
import Roles from './pages/Roles';
import Role from './pages/Role';
import RoleBindings from './pages/RoleBindings';
import RoleBinding from './pages/RoleBinding';
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
      icon:      'cluster-management',
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
      icon:      'unlock',
      component: Tokens
    },
    {
      name:      'rbac',
      path:      '/rbac',
      labelKey:  'opni.nav.rbac',
      icon:      'globe',
      component: RBAC,
      display:   false
    },
    {
      name:      'roles',
      path:      '/roles',
      labelKey:  'opni.nav.roles',
      icon:      'show',
      component: Roles
    },
    {
      name:      'role',
      path:      '/role/create',
      labelKey:  'opni.nav.roles',
      icon:      'globe',
      component: Role,
      display:   false
    },
    {
      name:      'roleBinding',
      path:      '/role-binding/create',
      labelKey:  'opni.nav.roleBindings',
      icon:      'globe',
      component: RoleBinding,
      display:   false
    },
    {
      name:      'roleBindings',
      path:      '/role-bindings',
      labelKey:  'opni.nav.roleBindings',
      icon:      'user',
      component: RoleBindings
    },
    {
      name:      'configuration',
      path:      '/configuration',
      labelKey:  'opni.nav.configuration',
      icon:      'globe',
      component: Configuration,
      display:   false
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
