
export async function getAllChildren(paths: string[]): Promise<ChildInfo[]> {

  const children: ChildInfo[] = []

  for (let path of paths) {
    const c = await getChildren(path)
    children.push(...c)
  }
  return children;
}

export async function getChildren(path: string): Promise<ChildInfo[]> {

  const children: ChildInfo[] = [];

  const cs = await client.getChildren(path, false);

  for (let c of cs) {
    if (c.typeName === "system.base.Folder") {
      const x = await getChildren(c.path);
      children.push(...x);
    } else {
      children.push(c);
    }
  }
  return children;
}
