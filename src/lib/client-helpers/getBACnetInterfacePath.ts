

export async function getBACnetInterfacePath(serverName: string) {

  const bni = await client.getChildren(serverName)
    .then(findTypes("bacnet.Device", "bacnet.ESDevice"));

  // console.log("BACnet Interface Path:", bni);
  return bni ? bni.path : '';
}


function findTypes(...typeNames: string[]) {
  return (children: ChildInfo[]) => children.find(c => typeNames.includes(c.typeName));
}
