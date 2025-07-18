import { rootPath } from "./rootPath";

export const getServer = () => client.getObjectPath().then(rootPath);
