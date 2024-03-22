import { parse } from "./device-report";
import { isSmartXObject } from "./util/isSmartXObject";

const REPORT_FILE = Symbol('report-file')

function isBACnetVendorSE(child: ObjectInfo): boolean {
  return child.properties.VendorIdentifier && child.properties.VendorIdentifier.presentationValue === "10";
}

function pathLast(path: string): string {
  return path.substring(path.lastIndexOf('/') + 1)
}

async function getChildren(paths: string[]): Promise<ChildInfo[]> {

  let children: ChildInfo[] = []

  for (let path of paths) {
    let cs = await client.getChildren(path, false)
    for (let c of cs) {
      if (c.typeName === "system.base.Folder") {
        const x = await getChildren([c.path])
        children = children.concat(x)
      } else {
        children.push(c)
      }
    }
  }

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


interface Action {
  type: String
}

class UpdateProgressAction {
  type: 'update-progress' = 'update-progress'
  constructor(public value: number, public max: number) { }
}

function UpdateProgressReducer(state: State, action: UpdateProgressAction): State {

  if (action.type !== 'update-progress') {
    return state
  }

  return {
    ...state,
    Progress: {
      Value: action.value,
      Max: action.max
    }
  }
}

class AddDeviceReportAction {
  type: 'add-device-report' = 'add-device-report'
  constructor(public path: string, public report: DeviceReport) { }
}

function AddDeviceReportReducer(state: State, action: AddDeviceReportAction): State {

  if (action.type !== 'add-device-report') {
    return state
  }

  return {
    ...state,
    Reports: {
      ...state.Reports,
      [action.path]: action.report,
    },
  }
}

class AddControllerAction {
  type: 'add-controllers' = 'add-controllers'
  constructor(public controllers: Controller[]) { }
}

function AddControllerReducer(state: State, action: AddControllerAction): State {

  if (action.type !== "add-controllers") {
    return state
  }

  const controllers = action.controllers.reduce((m, c) => {
    m[c.path] = c;
    return m
  }, { ...state.Controllers })

  const paths = Object.values(controllers).map(c => c.path)

  paths.sort((a, b) => a.localeCompare(b))

  return {
    ...state,
    Paths: paths,
    Controllers: controllers,
  }
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

  let _callbacks: ((state: State) => void)[] = [];


  function subscribe(callback: (state: State) => void): () => void {
    _callbacks.push(callback);
    return () => {
      const i = _callbacks.indexOf(callback);
      if (i === -1) { return }
      _callbacks.splice(i, 1)
    }
  }

  function dispatch(action: Action) {
    const lastState = state
    switch (action.type) {
      case 'update-progress':
        state = UpdateProgressReducer(state, action as UpdateProgressAction)
        break;
      case 'add-device-report':
        state = AddDeviceReportReducer(state, action as AddDeviceReportAction)
      case 'add-controllers':
        state = AddControllerReducer(state, action as AddControllerAction)
      default:
        break;
    }

    if (lastState !== state) {
      _callbacks.forEach(c => c(state))
    }
  }

  function readReports(s: State) {

    const max_request = 3
    let counter = 0
    let pos = 0
    let deviceCount = s.Paths.length
    let reportCount = 0

    dispatch(new UpdateProgressAction(0, deviceCount))

    const updateProgress = () => {
      reportCount++
      if (reportCount >= deviceCount) {
        console.log(s)
      }
      dispatch(new UpdateProgressAction(reportCount, deviceCount))
    }

    const next = () => {
      while (pos < s.Paths.length && counter < max_request) {
        const path = s.Paths[pos]
        pos++
        if (s.Controllers[path].online) {
          makeRequest(path)
        } else {
          updateProgress()
        }
      }
    }

    const done = () => {
      updateProgress()
      counter--
      next()
    }

    const makeRequest = path => {
      counter++
      client.readFile(path + "/Diagnostic Files/Device Report")
        .then(
          result => {
            const report = parse(result)
            report[REPORT_FILE] = result
            dispatch(new AddDeviceReportAction(path, report))
            done()
          },
          _ => {
            console.log('could not read report for:', path)
            done()
          }
        );
    }
    next()
  }

  return {

    subscribe: subscribe
    ,
    async load() {

      dispatch(new UpdateProgressAction(-1, 1))

      const serverName = await getServerName().catch(
        e => {
          console.error(e)
          return ""
        }
      )
      if (!serverName) {
        console.log('could not get server name')
        return
      }
      interfacePath = await getBACnetInterfacePath(serverName).catch(
        e => {
          console.error(e)
          return ""
        }
      )
      if (!interfacePath) {
        console.log('no bacnet interface found')
        return
      }

      const networks = await getBACnetIPNetworks(interfacePath)

      if (networks.length === 0) {
        console.log('no SpaceLogic devices found')
      }

      getChildren(networks.map(nw => nw.path))
        .then(children => children.map(item => item.path))
        .then(paths => client.getObjects(paths))
        .then(childMap => {
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

          dispatch(new AddControllerAction(cs))
          readReports(state)
        });
    }
    ,
  }
}

export default function CreateDataStore() {

  const data = CreateStore()

  return {
    subscribe: data.subscribe,
    load() {
      data.load()
    }
  }
}
