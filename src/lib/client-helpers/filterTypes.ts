export const filterTypes = (...typeNames: string[]) =>
  (children: ChildInfo[]) =>
    children.filter(c => typeNames.includes(c.typeName));
