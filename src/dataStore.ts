import { parse } from "./device-report";
import { isSmartXObject } from "./util/isSmartXObject";

const k_ActiveFW = "ActiveFWRev"
const k_RSTP = "RSTP"
const k_rstpStatus = "RSTP Status"

function isBACnetVendorSE(child: ObjectInfo): boolean {
  return child.properties.VendorIdentifier && child.properties.VendorIdentifier.presentationValue === "10";
}

function pathLast(path: string): string {
  return path.substring(path.lastIndexOf('/') + 1)
}


async function getChildren(path: string): Promise<ChildInfo[]> {

  let children: ChildInfo[] = []

  let c = await client.getChildren(path, false)

  c.forEach(async c => {
    if (c.typeName === "system.base.Folder") {
      const x = await getChildren(c.path)
      children = children.concat(x)
    } else {
      children.push(c)
    }
  })

  children.sort((a, b) => a.path.localeCompare(b.path))

  return children
}

function filterTypes(typeName: string) {
  return (children: ChildInfo[]) => children.filter(c => c.typeName === typeName)
}

function findTypes(typeName: string) {
  return (children: ChildInfo[]) => children.find(c => c.typeName === typeName)
}

async function getServerName(): Promise<string> {

  const currentPath = await client.getObjectPath();
  const i = currentPath.indexOf("/", 1)
  if (i === -1) { return currentPath }

  return currentPath.substring(0, i)
}

async function getServer(): Promise<ObjectInfo> {

  const serverName = await getServerName()

  return await client.getObject(serverName)
}

async function getBACnetInterface(serverName: string) {

  const ifList = await client.getChildren(serverName)
  const bni = ifList.find(c => c.typeName === "bacnet.Device")

  return bni ? bni.path : ''
}


const getBACnetIPNetworks = async (ifPath: string) => {
  return await client.getChildren(ifPath)
    .then(filterTypes("bacnet.IPDataLink"))
}


function readNetworks(ifPath: string, f: (cs: ChildInfo[]) => void) {

  if (ifPath === undefined || ifPath === "") {
    return
  }

  client.getChildren(ifPath)
    .then(cs => cs.filter(c => c.typeName === "bacnet.IPDataLink"))
    .then(f)

}

function relativePath(root: string, path: string) {
  if (path.startsWith(root)) {
    return path.substring(root.length + 1)
  }
  return path;
}

function readReports(s: State, emit: () => void) {

  const max_request = 3
  let counter = 0
  let pos = 0

  const next = () => {
    while (pos < s.Paths.length && counter < max_request) {
      const path = s.Paths[pos]
      pos++
      if (s.Controllers[path].online) {
        makeRequest(path)
      } else {
        emit()
      }
    }
  }

  const done = () => {
    counter--
    next()
  }

  const makeRequest = path => {
    counter++
    client.readFile(path + "/Diagnostic Files/Device Report")
      .then((result: string) => {
        done()
        s.Reports[path] = result;
        emit()
      }, done);
  }

  next()
}

function CreateStore() {

  let state: State = {
    Paths: [],
    Controllers: {},
    Reports: {}
  };

  let interfacePath: string


  let _callback: (recs: readonly ControllerInfo[]) => void;

  return {

    getNameFromPath(path: string) {
      return relativePath(path, path)
    }
    ,
    subscribe(callback: (_: readonly ControllerInfo[]) => void) {
      _callback = callback;
    }
    ,
    async load() {

      const serverName = await getServerName().catch(
        e => {
          console.log(e)
          return ""
        }
      )
      if (!serverName) { return }
      interfacePath = await getBACnetInterface(serverName).catch(
        e => {
          console.log(e)
          return ""
        }
      )
      if (!interfacePath) { return }
      const networks = await getBACnetIPNetworks(interfacePath)

      let children: ChildInfo[] = []

      for (let nw of networks) {
        const list = await getChildren(nw.path).catch(
          e => {
            console.log(e)
            return []
          }
        )
        children = children.concat(list)
      }

      const paths = children.map(item => item.path)
      const childMap = await client.getObjects(paths).catch(
        e => {
          console.log(e)
          return new Map() as Map<string, ObjectInfo>
        }
      )

      let cs: Controller[] = Array.from(childMap.values())
        .filter(isBACnetVendorSE)
        .filter(isSmartXObject)
        .map(child => {

          const name = pathLast(child.path);
          const onLine = child.properties.Status.value.low === 1;

          return {
            name: name,
            path: child.path,
            online: onLine,
            properties: child.properties
          }
        });

      cs.sort((a, b) => a.path.localeCompare(b.path))
      state.Paths = cs.map(cs => cs.path)

      state.Controllers = cs.reduce((m, c) => {
        m[c.path] = c;
        return m
      }, state.Controllers);

      this.emit();
      let _emit = this.emit.bind(this)

      readReports(state, _emit)
    }
    ,
    emit() {
      _callback(this.getTableData());
    }
    ,
    getTableData(): ControllerInfo[] {

      const paths = state.Paths;

      const _tableData = paths.map(path => {

        const c = state.Controllers[path]
        const report = state.Reports[path];
        const data = parse(report)

        return {
          Name: c.name,
          Path: c.path,
          IsOnline: c.online,
          Firmware: data[k_ActiveFW] || "Unavailable",
          RSTP: data[k_RSTP] || "Unavailable",
          RSTPStatus: data[k_rstpStatus] || "Unavailable",
          MACAddress: data['MACAddress'] || "Unavailable",
          ProductId: data['Product Id'] || "Unavailable",
          SerialNumber: data['Serial Number'] || "Unavailable",
          IPAddress: data['IP Address'] || "Unavailable",
        }
      });

      return _tableData;
    }
  }
}

export default function CreateDataStore() {

  const data = CreateStore()

  return {
    subscribe(callback: (_: readonly ControllerInfo[]) => void) {
      data.subscribe(callback)
    },

    load() {
      data.load()
    }
  }
}

