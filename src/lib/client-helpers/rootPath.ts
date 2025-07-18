export function rootPath(path: string): string {
  const i = path.indexOf("/", 1);
  if (i === -1) { return path; }
  return path.substring(0, i);
}
