import { DSL } from '@/store/type-map';

export const NAME = 'opni';
export const CHART_NAME = 'opni';

export function init(store) {
  const { product, basicType, virtualType } = DSL(store, NAME);

  product({});

  virtualType({
    label:      'Logging',
    namespaced: false,
    name:       'opni-logging',
    weight:     2,
    route:      { name: 'c-cluster-opni-logging' },
    exact:      true,
  });

  basicType(['opni-logging']);
}
