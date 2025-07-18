// isSmartX checks if the given ObjectInfo is a SmartX object.



export function isSmartX(modelName: string) {
  switch (modelName.substring(0, 2)) {
    case "MP":
    case "RP":
    case "IP":
      return true;
    default:
      return false;
  }
}
