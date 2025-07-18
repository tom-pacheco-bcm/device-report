import { findTypes } from "./findTypes";

export const getBACnetInterfacePath = (serverName: string) =>
  client.getChildren(serverName)
    .then(findTypes("bacnet.Device", "bacnet.ESDevice"))
    .then(bni => bni ? bni.path : '');
