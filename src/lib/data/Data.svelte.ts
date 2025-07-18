import { parse } from "./device-report";

import { getBACnetInterfacePath } from "../client-helpers/getBACnetInterfacePath";
import { getBACnetIPNetworks } from "../client-helpers/getBACnetIPNetworks";
import { getChildren } from "../client-helpers/getChildren";
import { getServer } from "../client-helpers/getServer";

import { isSmartX } from "../util/isSmartX";
import { isVendorSE } from "../util/isVendorSE";
import { pathName } from "../util/pathName";
import { pathsSelector } from "../util/pathsSelector";

const REPORT_FILE = Symbol("report-file");
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
    Max: 100,
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

async function readReports() {
  const max_request = 2;
  let counter = 0;
  let pos = 0;

  progressReset(appState.Paths.length);

  const next = () => {
    while (pos < appState.Paths.length && counter < max_request) {
      const path = appState.Paths[pos];
      pos++;
      if (!isVendorSE(appState.Controllers[path].vendorId)) {
        appState.Progress.Value++;
        continue
      }
      if (!isSmartX(appState.Controllers[path].model)) {
        appState.Progress.Value++;
        continue
      }
      if (!appState.Controllers[path].online) {
        appState.Progress.Value++;
        continue
      }
      makeRequest(path);
    }
  };

  const done = () => {
    appState.Progress.Value++;
    counter--;
    next();
  };

  const makeRequest = (path: string) => {
    counter++;
    readDeviceReport(path)
      .then(reportHandler)
      .finally(done);
  };
  next();
}

export function readReport(path: string) {
  return readDeviceReport(path)
    .then(reportHandler)
}

const DEVICE_REPORT_PATH = "/Diagnostic Files/Device Report";

function readDeviceReport(path: string) {
  const objectPath = path + DEVICE_REPORT_PATH;
  return client.readFile(objectPath)
    .then((text) => ({ path, text }))
};

export function getDeviceReport(path: string) {
  const report = appState.Reports[path];
  if (!report) { return "" }
  return report[String(REPORT_FILE)]
};

function reportHandler(result: { path: string, text: string }) {
  if (!result.text) { return }
  const report = parse(result.text);
  report[String(REPORT_FILE)] = result.text;
  appState.Reports[result.path] = report;
}
