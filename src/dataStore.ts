import { parse } from "./device-report";
import { isSmartXObject } from "./util/isSmartXObject";

const REPORT_FILE = Symbol('report-file')

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

function findType(typeName: string) {
  return (children: ChildInfo[]) => children.find(c => c.typeName === typeName)
}

async function getServerName(): Promise<string> {

  const currentPath = await client.getObjectPath();
  const i = currentPath.indexOf("/", 1)
  if (i === -1) { return currentPath }

  return currentPath.substring(0, i)
}

async function getBACnetInterfacePath(serverName: string) {

  const bni = await client.getChildren(serverName)
    .then(findType("bacnet.Device"))

  return bni ? bni.path : ''
}

const getBACnetIPNetworks = async (ifPath: string) => {
  return await client.getChildren(ifPath)
    .then(filterTypes("bacnet.IPDataLink"))
}


function relativePath(root: string, path: string) {
  if (path.startsWith(root)) {
    return path.substring(root.length + 1)
  }
  return path;
}


function CreateStore() {

  let state: State = {
    Paths: [],
    Controllers: {},
    Reports: {},
    Progress: {
      Value: 0,
      Max: 1
    },
  };

  let interfacePath: string

  let _callback: (state: State) => void;

  function emit() {
    _callback(state);
  }

  let updateState = function (updater: (state: State) => State) {
    const newState = updater(state)
    if (state === newState) { return; }
    state = newState
    emit()
  }

  let addControllers = function (cs: Controller[]) {
    updateState(state => {
      return {
        ...state,
        Paths: cs.map(cs => cs.path),
        Controllers: cs.reduce((m, c) => {
          m[c.path] = c;
          return m
        }, { ...state.Controllers }),
      }
    })
  }

  let updateProgress = function (value: number, max: number) {
    updateState(state => {
      return {
        ...state,
        Progress: {
          Value: value,
          Max: max
        }
      }
    })
  }

  let addReport = function (path: string, report: DeviceReport) {
    updateState(state => {
      return {
        ...state,
        Reports: {
          ...state.Reports,
          [path]: report,
        },
      }
    })
  }

  function readReports(s: State) {

    const max_request = 3
    let counter = 0
    let pos = 0

    updateProgress(0, s.Paths.length)

    const next = () => {
      while (pos < s.Paths.length && counter < max_request) {
        const path = s.Paths[pos]
        pos++
        if (s.Controllers[path].online) {
          makeRequest(path)
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
        .then(
          result => {
            done()
            const report = parse(result)
            report[REPORT_FILE] = result
            addReport(path, report)
            updateProgress(pos, s.Paths.length)
          },
          done
        );
    }
    next()
  }


  return {

    getNameFromPath(path: string) {
      return relativePath(path, path)
    }
    ,
    subscribe(callback: (state: State) => void) {
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
      interfacePath = await getBACnetInterfacePath(serverName).catch(
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

      addControllers(cs)
      readReports(state)
    }
    ,
  }
}

export default function CreateDataStore() {

  const data = CreateStore()

  return {
    subscribe(callback: (state: State) => void) {
      data.subscribe(callback)
    },

    load() {
      data.load()
    }
  }
}
