import { parse } from "./device-report";

import { getBACnetInterfacePath } from "../client-helpers/getBACnetInterfacePath";
import { getBACnetIPNetworks } from "../client-helpers/getBACnetIPNetworks";
import { getChildren } from "../client-helpers/getChildren";
import { getServerName } from "../client-helpers/getServerName";

import { controllerIsOnline } from "../util/controllerIsOnline";
import { isBACnetVendorSE } from "../util/isBACnetVendorSE";
import { isSmartXObject } from "../util/isSmartXObject";
import { pathsSelector } from "../util/pathsSelector";
import { pathLast } from "../util/pathLast";


const REPORT_FILE = Symbol("report-file");

export let appState: State = $state({
  Server: "",
  NetworkPaths: [],
  Paths: [],
  Controllers: {},
  Reports: {},
  Progress: {
    Value: 0,
    Max: 100,
  },
});

export function refreshTable() {
  getControllers(appState.NetworkPaths)
    .then(updateControllers)
    .then(readReports);
}

export async function load() {
  let serverName = getServerName()
  serverName.then((name) => {
    appState.Server = name;
  });
  let ipNetworkPaths = serverName.then(getNetworkPaths)

  ipNetworkPaths.then((paths) => {
    appState.NetworkPaths = paths;
    appState.Progress.Max = paths.length;
  });

  ipNetworkPaths
    .then(getControllers)
    .then(updateControllers)
    .then(readReports);
}

function getNetworkPaths(serverName: string) {
  return getBACnetInterfacePath(serverName)
    .then(getBACnetIPNetworks)
    .then(pathsSelector)
}


function resetProgress(max: number) {
  appState.Progress.Value = 0;
  appState.Progress.Max = max;
}

async function getControllers(networkPaths: string[]) {
  resetProgress(networkPaths.length);

  return getChildren(networkPaths)
    .then(pathsSelector)
    .then(client.getObjects)
    .then(getSmartLogicControllers);
}

function getSmartLogicControllers(childMap: Map<string, ObjectInfo>) {
  return childMap
    .values()
    .filter(isBACnetVendorSE)
    .filter(isSmartXObject)
    .map(asController)
    .toArray();
}

function asController(child: ObjectInfo): Controller {
  const name = pathLast(child.path);
  const onLine = controllerIsOnline(child);
  return {
    name: name,
    path: child.path,
    online: onLine,
    properties: child.properties,
  } as Controller;
}

function sortControllers(controllers: Controller[]): Controller[] {
  controllers.sort((a, b) => a.path.localeCompare(b.path));
  return controllers;
}

function updateControllers(controllerList: Controller[]) {
  controllerList.forEach((c) => {
    appState.Controllers[c.path] = c;
  });

  const new_paths = Object.values(appState.Controllers).map((c) => c.path);
  new_paths.sort((a, b) => a.localeCompare(b));
  appState.Paths = new_paths;
}

async function readReports() {
  const max_request = 2;
  let counter = 0;
  let pos = 0;

  resetProgress(appState.Paths.length);

  const next = () => {
    while (pos < appState.Paths.length && counter < max_request) {
      const path = appState.Paths[pos];
      pos++;
      if (appState.Controllers[path].online) {
        makeRequest(path);
      } else {
        appState.Progress.Value++;
      }
    }
  };

  const done = () => {
    appState.Progress.Value++;
    counter--;
    next();
  };

  const makeRequest = (path: string) => {
    counter++;
    getDeviceReport(path)
      .then(reportHandler)
      .finally(done);
  };
  next();
}

const DEVICE_REPORT_PATH = "/Diagnostic Files/Device Report";

function getDeviceReport(path: string) {
  const objectPath = path + DEVICE_REPORT_PATH;
  return client.readFile(objectPath).then((text) => ({ path, text }))
};

function reportHandler(result: { path: string, text: string }) {
  const report = parse(result.text);
  report[String(REPORT_FILE)] = result.text;
  appState.Reports[result.path] = report;
}


