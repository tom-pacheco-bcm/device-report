

export async function getServerName(): Promise<string> {

  const currentPath = await client.getObjectPath();
  // console.log("Current path:", currentPath);
  const i = currentPath.indexOf("/", 1);
  if (i === -1) { return currentPath; }

  return currentPath.substring(0, i);
}
