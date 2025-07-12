

export const getBACnetIPNetworks = async (ifPath: string) => {
  const ipNetworks = await client.getChildren(ifPath)
    .then(filterType("bacnet.IPDataLink"));

  // console.log("IP Networks:", ipNetworks);
  return ipNetworks
};


function filterType(typeName: string) {
  return (children: ChildInfo[]) => children.filter(c => c.typeName === typeName);
}
