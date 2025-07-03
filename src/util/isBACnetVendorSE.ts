
export function isBACnetVendorSE(child: ObjectInfo): boolean {
  return child.properties! &&
    child.properties.VendorIdentifier! &&
    child.properties.VendorIdentifier.presentationValue === "10";
}
