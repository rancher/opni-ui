export function traverseNavigation(navigation, fn) {
  function impl(parentPath, route, depth, parentResult) {
    const path = parentPath + (route.path || '');
    let result;

    if (path) {
      const isParent = parentPath && (route.routes || []).length > 0 && route.routes.some(r => r.display);

      result = fn(path, route, depth, isParent, parentResult);
    }

    (route.routes || []).forEach(subRoute => impl(path, subRoute, depth + 1, result));
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

  traverseNavigation(navigation, (path, route, depth, isParent, parent) => {
    if (route.display === false) {
      return;
    }

    const navItem = customizeNavItem({
      ...route,
      depth,
      route:    path,
      label:    t(route.labelKey),
      routes:   undefined,
      parent,
      children: []
    });

    if (navItem) {
      navItems.push(navItem);

      if (parent) {
        parent.children.push(navItem);
      }
    }

    return navItem;
  });

  return navItems;
}
