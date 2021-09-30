import { DSL } from '@/store/type-map';

import { traverseNavigation } from '@/utils/navigation';
import { NAVIGATION } from '@/product/opni/router';

export const NAME = 'opni';
export const CHART_NAME = 'opni';

export function init(store) {
  const { product, basicType, virtualType } = DSL(store, NAME);

  product({});

  traverseNavigation(NAVIGATION, (path, route) => {
    if (route.display === false) {
      return;
    }

    const name = `opni-${ route.name }`;
    const routeName = path.replace('/', '-');
    const fullRoute = `c-cluster-opni${ routeName }`;
    const type = {
      label:      store.getters['i18n/t'](route.labelKey),
      namespaced: false,
      name,
      route:      { name: fullRoute },
      exact:      true,
    };

    virtualType(type);
    basicType([name]);
  });
}
