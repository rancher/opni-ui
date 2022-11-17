import Vue from 'vue';
import Router from 'vue-router';

import { createRoutesFromNavigation } from '@/utils/navigation';
import Monitoring from './pages/Monitoring';
import Clusters from './pages/Clusters';
import Cluster from './pages/Cluster';
import Roles from './pages/Roles';
import Role from './pages/Role';
import RoleBindings from './pages/RoleBindings';
import RoleBinding from './pages/RoleBinding';
import Configuration from './pages/Configuration';
import LoggingBackend from './pages/LoggingBackend';
import SLOs from './pages/SLOs';
import SLO from './pages/SLO';
import WorkloadModelConfig from './pages/WorkloadModelConfig';

import Endpoints from './pages/Endpoints';
import Endpoint from './pages/Endpoint';
import Alarms from './pages/Alarms';
import Alarm from './pages/Alarm';
import AlertingOverview from './pages/AlertingOverview';
import AlertingBackend from './pages/AlertingBackend';

Vue.use(Router);

export const NAVIGATION = {
  routes: [
    {
      path:      '/',
      redirect: { name: 'agents' },
      display:  false
    },
    {
      name:      'agents',
      path:      '/agents',
      labelKey:  'opni.nav.agents',
      // icon:      'cluster-management',
      component: Clusters,
      routes:    [
        {
          name:      'agent-create',
          path:      '/create',
          labelKey:  'opni.nav.clusters',
          // icon:      'globe',
          component: Cluster,
          display:   false
        },
      ]
    },
    {
      name:      'logging-config',
      path:      '/logging-config',
      labelKey:  'opni.nav.loggingConfig',
      // icon:      'logging',
      component: LoggingBackend,
      display:   true
    },
    {
      name:      'monitoring',
      path:      '/monitoring',
      labelKey:  'opni.nav.monitoring',
      // icon:      'monitoring',
      component: Monitoring,
      routes:    [
        {
          name:     'rbac',
          path:     '/rbac',
          labelKey: 'opni.nav.rbac',
          // icon:     'folder',
          display:   true,
          redirect: { name: 'roles' },
          routes:   [
            {
              name:      'roles',
              path:      '/roles',
              labelKey:  'opni.nav.roles',
              // icon:      'show',
              component: Roles,
              routes:    [
                {
                  name:      'role-create',
                  path:      '/create',
                  labelKey:  'opni.nav.roles',
                  // icon:      'globe',
                  component: Role,
                  display:   false
                },
              ]
            },
            {
              name:      'role-bindings',
              path:      '/role-bindings',
              labelKey:  'opni.nav.roleBindings',
              // icon:      'user',
              component: RoleBindings,
              routes:    [
                {
                  name:      'role-binding-create',
                  path:      '/create',
                  labelKey:  'opni.nav.roleBindings',
                  // icon:      'globe',
                  component: RoleBinding,
                  display:   false
                },
              ]
            },
          ]
        },
      ]
    },
    {
      name:      'alerting',
      path:      '/alerting',
      labelKey:  'opni.nav.alerting',
      display:   true,
      component: AlertingBackend,
      // redirect:  { name: 'slos' },
      routes:    [
        {
          name:      'alerting-overview',
          path:      '/overview',
          labelKey:  'opni.nav.alertingOverview',
          // icon:      'alert',
          component: AlertingOverview,
          display:   true
        },
        {
          name:      'endpoints',
          path:      '/endpoints',
          labelKey:  'opni.nav.endpoints',
          // icon:      'alert',
          component: Endpoints,
          display:   true,
          routes:    [
            {
              name:      'endpoint',
              path:      '/:id',
              labelKey:  'opni.nav.endpoints',
              // icon:      'globe',
              component: Endpoint,
              display:   false
            },
            {
              name:      'endpoint-create',
              path:      '/create',
              labelKey:  'opni.nav.endpoints',
              // icon:      'globe',
              component: Endpoint,
              display:   false
            },
          ]
        },
        {
          name:      'alarms',
          path:      '/alarms',
          labelKey:  'opni.nav.alarms',
          // icon:      'alert',
          component: Alarms,
          display:   true,
          routes:    [
            {
              name:      'alarm',
              path:      '/:id',
              labelKey:  'opni.nav.alarms',
              // icon:      'globe',
              component: Alarm,
              display:   false
            },
            {
              name:      'alarm-create',
              path:      '/create',
              labelKey:  'opni.nav.alarms',
              // icon:      'globe',
              component: Alarm,
              display:   false
            },
          ]
        },
        {
          name:      'slos',
          path:      '/slos',
          labelKey:  'opni.nav.slos',
          // icon:      'alert',
          component: SLOs,
          display:   true,
          routes:    [
            {
              name:      'slo',
              path:      '/:id',
              labelKey:  'opni.nav.slos',
              // icon:      'globe',
              component: SLO,
              display:   false
            },
            {
              name:      'slo-create',
              path:      '/create',
              labelKey:  'opni.nav.slos',
              // icon:      'globe',
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
      // icon:      'globe',
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
