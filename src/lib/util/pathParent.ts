
// pathParent returns one path level higher
export const pathParent = (path: string) => {
  // get parent of string path
  const end = path.lastIndexOf("/");
  if (end === -1) {
    return path;
  }
  return path.substring(0, end)
}
