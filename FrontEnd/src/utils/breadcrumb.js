import { NAV_GROUPS } from "../config/navigation";

// Every page's breadcrumb has always followed the same two shapes: "Home >
// <title>" when the page is a nav group's own index route, or
// "Home > <group label> > <title>" for anything nested under one - never
// anything more exotic. navigation.js already has the route -> group
// mapping the sidebar uses, so PageHeader can derive the trail from just
// the current path + the page's own title instead of every page hand
// writing an identical-shaped array.
function findGroup(pathname) {
  let best = null;
  for (const group of NAV_GROUPS) {
    if (group.path === "/") continue; // Overview/Dashboard - handled as a special case below
    if (pathname === group.path || pathname.startsWith(`${group.path}/`)) {
      if (!best || group.path.length > best.path.length) best = group;
    }
  }
  return best;
}

export function resolveBreadcrumb(pathname, title) {
  if (pathname === "/") return [{ label: "Home" }];

  const group = findGroup(pathname);
  if (!group || pathname === group.path) {
    return [{ label: "Home", path: "/" }, { label: title }];
  }
  return [{ label: "Home", path: "/" }, { label: group.label, path: group.path }, { label: title }];
}
