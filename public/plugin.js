import { PLUGIN_NAME } from '../utils/constants';

export class OpniPlugin {
  setup(core) {
    core.application.register({
      id: PLUGIN_NAME,
      title: 'Opni',
      description: 'Opni Plugin',
      category: {
        id: 'opensearch',
        label: 'OpenSearch Plugins',
        order: 2000,
      },
      order: 4000,
      mount: async (params) => {
        const { renderApp } = await import('./app');
        const [coreStart] = await core.getStartServices();
        return renderApp(coreStart, params);
      },
    });
    return {};
  }

  start(core) {
    return {};
  }
}
