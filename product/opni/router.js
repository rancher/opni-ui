import Vue from 'vue';
import Router from 'vue-router';

import { createRoutesFromNavigation } from '@/utils/navigation';
import Monitoring from './pages/Monitoring';
import Clusters from './pages/Clusters';
import Cluster from './pages/Cluster';
import Tokens from './pages/Tokens';
import Roles from './pages/Roles';
import Role from './pages/Role';
import RoleBindings from './pages/RoleBindings';
import RoleBinding from './pages/RoleBinding';
import Configuration from './pages/Configuration';
import LoggingConfig from './pages/LoggingConfig';
import SLOs from './pages/SLOs';
import SLO from './pages/SLO';
import WorkloadModelConfig from './pages/WorkloadModelConfig';

Vue.use(Router);

export const NAVIGATION = {
  routes: [
    {
      path:      '/',
      redirect: { name: 'clusters' },
      display:  false
    },
    {
      name:     'management',
      path:     '/management',
      labelKey: 'opni.nav.management',
      redirect: { name: 'clusters' },
      display:   true,
      routes:   [
        {
          name:      'clusters',
          path:      '/clusters',
          labelKey:  'opni.nav.clusters',
          icon:      'cluster-management',
          component: Clusters,
          routes:    [
            {
              name:      'cluster-create',
              path:      '/create',
              labelKey:  'opni.nav.clusters',
              icon:      'globe',
              component: Cluster,
              display:   false
            },
          ]
        },
        {
          name:      'tokens',
          path:      '/tokens',
          labelKey:  'opni.nav.tokens',
          icon:      'unlock',
          component: Tokens,
          display:   false
        }
      ]
    },
    {
      name:     'backends',
      path:     '/backends',
      labelKey: 'opni.nav.backends',
      display:   true,
      redirect: { name: 'monitoring' },
      routes:   [
        {
          name:      'logging-config',
          path:      '/logging-config',
          labelKey:  'opni.nav.loggingConfig',
          icon:      'logging',
          component: LoggingConfig,
          display:   true
        },
        {
          name:      'monitoring',
          path:      '/monitoring',
          labelKey:  'opni.nav.monitoring',
          icon:      'monitoring',
          component: Monitoring,
          routes:    [
            {
              name:     'rbac',
              path:     '/rbac',
              labelKey: 'opni.nav.rbac',
              icon:     'folder',
              display:   true,
              redirect: { name: 'roles' },
              routes:   [
                {
                  name:      'roles',
                  path:      '/roles',
                  labelKey:  'opni.nav.roles',
                  icon:      'show',
                  component: Roles,
                  routes:    [
                    {
                      name:      'role-create',
                      path:      '/create',
                      labelKey:  'opni.nav.roles',
                      icon:      'globe',
                      component: Role,
                      display:   false
                    },
                  ]
                },
                {
                  name:      'role-bindings',
                  path:      '/role-bindings',
                  labelKey:  'opni.nav.roleBindings',
                  icon:      'user',
                  component: RoleBindings,
                  routes:    [
                    {
                      name:      'role-binding-create',
                      path:      '/create',
                      labelKey:  'opni.nav.roleBindings',
                      icon:      'globe',
                      component: RoleBinding,
                      display:   false
                    },
                  ]
                },
              ]
            },
          ]
        },
      ]
    },
    {
      name:     'alerting',
      path:     '/alerting',
      labelKey: 'opni.nav.alerting',
      display:   true,
      redirect: { name: 'slos' },
      routes:   [
        {
          name:      'slos',
          path:      '/slos',
          labelKey:  'opni.nav.slos',
          icon:      'alert',
          component: SLOs,
          display:   true,
          routes:    [
            {
              name:      'slo',
              path:      '/:id',
              labelKey:  'opni.nav.slos',
              icon:      'globe',
              component: SLO,
              display:   false
            },
            {
              name:      'slo-create',
              path:      '/create',
              labelKey:  'opni.nav.slos',
              icon:      'globe',
              component: SLO,
              display:   false
            },
          ]
        },
      ]
    },
    {
      name:      'workload-model-config',
      path:      '/workload-model-config',
      labelKey:  'opni.nav.workloadModel',
      icon:      'globe',
      component: WorkloadModelConfig,
      display:   true
    },
    {
      name:      'configuration',
      path:      '/configuration',
      labelKey:  'opni.nav.configuration',
      icon:      'gear',
      component: Configuration,
      display:   true
    },
  ]
};

export function createRouter() {
  return new Router({
    mode:   'history',
    routes: createRoutesFromNavigation(NAVIGATION)
  });
}
