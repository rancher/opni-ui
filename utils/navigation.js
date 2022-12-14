import Vue from 'vue';

export function traverseNavigation(navigation, fn) {
  function impl(parentPath, route, depth) {
    const path = parentPath + (route.path || '');

    if (path) {
      const isParent = parentPath && (route.routes || []).length > 0 && route.routes.some(r => r.display);

      fn(path, route, depth, isParent);
    }

    (route.routes || []).forEach(subRoute => impl(path, subRoute, depth + 1));
  }

  return impl('', navigation, 0);
}

export function createRoutesFromNavigation(navigation) {
  const routes = [];

  traverseNavigation(navigation, (path, route) => {
    routes.push({
      ...route,
      path,
      routes: undefined
    });
  });

  return routes;
}

export async function createNavItemsFromNavigation(navigation, t, customizeNavItem = navItem => navItem) {
  const navItems = [];
  const promises = [];

  traverseNavigation(navigation, (path, route, depth, isParent) => {
    if (route.display === false) {
      return;
    }

    const navItem = customizeNavItem({
      ...route,
      depth,
      route:    path,
      label:    t(route.labelKey),
      routes:   undefined,
      parent:   isParent,
      children: route.children ? traverseNavigation(route.children) : []
    });

    if (navItem) {
      const showChildren = Promise.resolve(route.showChildren ? route.showChildren() : true);

      showChildren.then((show) => {
        navItem.showChildren = show;
      }, () => {
        navItem.showChildren = true;
      });
      promises.push(showChildren);
      navItems.push(navItem);
    }
  });

  try {
    await Promise.all(promises);
  } catch (ex) {}

  let depth = 0;
  let filtering = false;

  return navItems.filter((item) => {
    if (filtering && (depth < item.depth)) {
      return false;
    }

    depth = item.depth;
    filtering = !item.showChildren;

    return true;
  });
}

export const NavigationEmitter = new Vue();
