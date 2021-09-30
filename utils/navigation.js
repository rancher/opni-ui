export function traverseNavigation(navigation, fn) {
  function impl(parentPath, route) {
    const path = parentPath + (route.path || '');

    (route.routes || []).forEach(subRoute => impl(path, subRoute));

    if (path) {
      fn(path, route);
    }
  }

  return impl('', navigation);
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

  traverseNavigation(navigation, (path, route) => {
    if (route.display === false) {
      return;
    }

    const navItem = customizeNavItem({
      ...route,
      route:  route.path,
      label:  t(route.labelKey),
      routes: undefined
    });

    if (navItem) {
      navItems.push(navItem);
    }
  });

  return navItems;
}
