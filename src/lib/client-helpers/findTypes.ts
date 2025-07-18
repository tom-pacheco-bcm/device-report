export const findTypes = (...typeNames: string[]) =>
  (children: ChildInfo[]) =>
    children.find(c => typeNames.includes(c.typeName));
