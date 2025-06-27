// controllerIsOnline checks if the controller is online based on its properties.
// It returns true if the controller is online, false if it is offline or invalid.
export function controllerIsOnline(child: ObjectInfo) {

  if (!child.properties || !child.properties.Status) {
    return false;
  }

  switch (child.properties.Status.presentationValue) {
    case 'Online':
      return true;
    case 'Offline':
      return false;
    case 'Invalid':
      return false;
  }

  // this is no longer used starting in version 7.0 but kept for compatibility 
  // until confirmed not needed in older versions.
  return child.properties.Status.value.low === 1;
}
