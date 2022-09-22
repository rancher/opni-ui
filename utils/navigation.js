export function traverseNavigation(navigation, fn) {
  function impl(parentPath, route, depth) {
    const path = parentPath + (route.path || '');

    if (path) {
      fn(path, route, depth);
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

export function createNavItemsFromNavigation(navigation, t, customizeNavItem = navItem => navItem) {
  const navItems = [];

  traverseNavigation(navigation, (path, route, depth) => {
    if (route.display === false) {
      return;
    }

    const navItem = customizeNavItem({
      ...route,
      depth,
      route:    path,
      label:    t(route.labelKey),
      routes:   undefined,
      children: route.children ? traverseNavigation(route.children) : []
    });

    if (navItem) {
      navItems.push(navItem);
    }
  });

  return navItems;
}
