

function findType(typeName: string) {
  return (children: ChildInfo[]) => children.find(c => c.typeName === typeName)
}
