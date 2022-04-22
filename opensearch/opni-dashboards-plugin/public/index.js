import { OpniPlugin } from './plugin';

export function plugin(initializerContext) {
  return new OpniPlugin(initializerContext);
}
