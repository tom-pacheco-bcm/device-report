
export function pathLast(path: string): string {
  return path.substring(path.lastIndexOf('/') + 1);
}
