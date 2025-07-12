
export async function getChildren(paths: string[]): Promise<ChildInfo[]> {

  let children: ChildInfo[] = [];

  for (let path of paths) {
    let cs = await client.getChildren(path, false);
    for (let c of cs) {
      if (c.typeName === "system.base.Folder") {
        const x = await getChildren([c.path]);
        children = children.concat(x);
      } else {
        children.push(c);
      }
    }
  }

  children.sort((a, b) => a.path.localeCompare(b.path));
  return children;
}
