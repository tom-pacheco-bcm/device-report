export const filterType = (typeName: string) =>
  (children: ChildInfo[]) =>
    children.filter(c => c.typeName === typeName);
