export function pathsSelector(items: { path: string; }[]) {
  return items.map(item => item.path);
}


