
// isSmartXObject checks if the given ObjectInfo is a SmartX object.
export function isSmartXObject(oi: ObjectInfo) {

  if (!oi.properties || !oi.properties.ModelName || !oi.properties.ModelName.value) {
    return false;
  }

  const modelName = oi.properties.ModelName.value as string;

  switch (modelName.substring(0, 2)) {
    case "MP":
    case "RP":
    case "IP":
      return true
    default:
      return false
  }
}
