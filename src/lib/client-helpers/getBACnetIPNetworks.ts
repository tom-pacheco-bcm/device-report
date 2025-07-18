import { filterTypes } from "./filterTypes";

export const getBACnetIPNetworks = (ifPath: string) =>
  client.getChildren(ifPath)
    .then(filterTypes("bacnet.IPDataLink", "bacnet.SCDataLink"));  //TODO: verify secure BACnet type
