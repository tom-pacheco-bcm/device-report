import { getBACnetInterfacePath } from "../client-helpers/getBACnetInterfacePath";
import { getBACnetIPNetworks } from "../client-helpers/getBACnetIPNetworks";
import { getChildren } from "../client-helpers/getChildren";
import { getServer } from "../client-helpers/getServer";

import { isSmartX } from "../util/isSmartX";
import { isVendorSE } from "../util/isVendorSE";
import { pathName } from "../util/pathName";
import { pathsSelector } from "../util/pathsSelector";
import { DeviceReport, getDeviceReport } from "./DeviceReport.svelte";

const PROP_STATUS = "Status"
const PROP_MODEL = "ModelName"
const PROP_VENDOR = "VendorIdentifier"

export let appState: State = $state({
  Server: "",
  Interface: "",
  NetworkPaths: [],
  Nodes: [],
  Paths: [],
  Controllers: {},
  Values: {},
  Reports: {},
  Progress: {
    Value: 0,
    Max: 0,
  },
});

export function refreshTable() {
  getControllers(appState.NetworkPaths)
    .then(getControllers)
    .then(readReports);
}

export function load() {

  const server = getServer()

  server.then((name) => {
    appState.Server = name;
  });

  const ifPath = server.then(getBACnetInterfacePath)

  ifPath.then(path => {
    appState.Interface = path
  })

  const ipNetworkPaths = ifPath.then(getNetworkPaths)

  ipNetworkPaths.then((paths) => {
    appState.NetworkPaths = paths;
  });

  const cPaths = ipNetworkPaths.then(getControllers)
  return cPaths.then(readReports)
}

function updateValues(vm: Map<string, Value>, subId?: number) {
  vm.forEach((v, k) => {
    appState.Values[k] = v
    if (k.endsWith(PROP_MODEL)) {
      const path = k.substring(0, k.length - PROP_MODEL.length - 1)
      appState.Controllers[path].model = v.presentationValue
      return
    }
    if (k.endsWith(PROP_STATUS)) {
      const path = k.substring(0, k.length - PROP_STATUS.length - 1)
      appState.Controllers[path].status = v.presentationValue
      appState.Controllers[path].online = v.presentationValue === "Online"
      return
    }
    if (k.endsWith(PROP_VENDOR)) {
      const path = k.substring(0, k.length - PROP_VENDOR.length - 1)
      appState.Controllers[path].vendorId = v.presentationValue
      return
    }
  })
}

const controllerProperties = [PROP_STATUS, PROP_MODEL, PROP_VENDOR]

function addBACnetNode(c: ChildInfo) {
  appState.Nodes.push(c)
  const devPath = newController(c)
  subscribeStatus(devPath)
  return updateBACnetNode(devPath)
}

function updateBACnetNode(path: string) {
  const paths = controllerProperties.map(p => `${path}/${p}`)

  return client.readValues(paths, 2000)
    .then(updateValues)
    .then(() => path)
}

function subscribeStatus(path: string) {
  const paths = [`${path}/Status`]
  return client.subscribeValues(updateValues, paths)
}

async function addBACnetNodes(cs: ChildInfo[]) {
  const paths: string[] = []
  for (let ci of cs) {
    const n = await addBACnetNode(ci)
    paths.push(n)
  }
  return paths
}


function getBACnetNodes(path: string) {
  return getChildren(path)
    .then(addBACnetNodes)
}

function getNetworkPaths(interfacePath: string) {
  return getBACnetIPNetworks(interfacePath)
    .then(pathsSelector)
}

function progressReset(max: number) {
  appState.Progress.Value = 0;
  appState.Progress.Max = max;
}

function progressUpdate(count: number = 1) {
  appState.Progress.Value += count;
}

function progressAddTasks(count: number) {
  if (appState.Progress.Value == appState.Progress.Max) {
    progressReset(count)
    return
  }
  appState.Progress.Max += count;
}

async function getControllers(networkPaths: string[]) {
  progressAddTasks(networkPaths.length);
  const paths: string[] = []
  for (let p of networkPaths) {
    const newPaths = await getBACnetNodes(p)
    progressUpdate()
    paths.push(...newPaths)
  }
  return paths
}

function updatePaths() {
  const new_paths = Object.values(appState.Controllers).map((c) => c.path);
  new_paths.sort((a, b) => a.localeCompare(b));
  appState.Paths = new_paths;
}

function newController(ci: ChildInfo) {

  if (appState.Controllers.hasOwnProperty(ci.path)) {
    return ci.path
  }

  appState.Controllers[ci.path] = {
    name: pathName(ci.path),
    path: ci.path,
    model: "",
    status: "",
    vendorId: "",
    online: false,
  } as Controller;

  updatePaths()

  return ci.path
}

function addReport(r: DeviceReport) {
  appState.Reports[r.path] = r
  return r
}

async function readReports() {

  return Promise.allSettled(
    appState.Paths
      .filter(p => {
        const c = appState.Controllers[p]
        return isVendorSE(c.vendorId)
          && isSmartX(c.model)
          && c.online
      })
      .map(p => getDeviceReport(p).then(addReport))
  ).then(ps =>
    ps.filter(p => p.status == 'fulfilled')
      .map(p => p.value)
  );
}
