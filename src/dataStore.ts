import { controllerIsOnline } from "./util/controllerIsOnline";
import { parse } from "./device-report";
import { createStore, Store } from "./store";
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

type TYPE_UPDATE_PROGRESS = 'update-progress'
const TYPE_UPDATE_PROGRESS = 'update-progress'

class UpdateProgressAction {
  type: TYPE_UPDATE_PROGRESS = TYPE_UPDATE_PROGRESS
  constructor(public value: number, public max: number) { }
}

function UpdateProgressReducer(state: State, action: UpdateProgressAction): State {

  if (action.type !== TYPE_UPDATE_PROGRESS) {
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

type TYPE_ADD_DEVICE_REPORT = 'add-device-report'
const TYPE_ADD_DEVICE_REPORT = 'add-device-report'

class AddDeviceReportAction {
  type: TYPE_ADD_DEVICE_REPORT = TYPE_ADD_DEVICE_REPORT
  constructor(public path: string, public report: DeviceReport) { }
}

function AddDeviceReportReducer(state: State, action: AddDeviceReportAction): State {

  if (action.type !== TYPE_ADD_DEVICE_REPORT) {
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
type TYPE_ADD_CONTROLLERS = 'add-controllers'
const TYPE_ADD_CONTROLLERS = 'add-controllers'

class AddControllersAction {
  type: TYPE_ADD_CONTROLLERS = TYPE_ADD_CONTROLLERS
  constructor(public controllers: Controller[]) { }
}

function AddControllerReducer(state: State, action: AddControllersAction): State {

  if (action.type !== TYPE_ADD_CONTROLLERS) {
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

const initialState: State = {
  Paths: [],
  Controllers: {},
  Reports: {},
  Progress: {
    Value: 0,
    Max: 1
  },
};

function reducer(state: State, action: Action): State {

  switch (action.type) {
    case TYPE_UPDATE_PROGRESS:
      return UpdateProgressReducer(state, action as UpdateProgressAction)
    case TYPE_ADD_DEVICE_REPORT:
      return AddDeviceReportReducer(state, action as AddDeviceReportAction)
    case TYPE_ADD_CONTROLLERS:
      return AddControllerReducer(state, action as AddControllersAction)
    default:
      return state
  }
}

class Progress {
  reportCount = 0
  deviceCount = 0
  constructor(private store: Store<State>) {
    this.reset()
  }

  reset() {
    this.reportCount = 0
    const s = this.store.getState()
    this.deviceCount = s.Paths.length
    this.dispatch()
  }

  update(inc: number = 1) {
    this.reportCount += inc
    this.dispatch()
  }

  dispatch() {
    this.store.dispatch(new UpdateProgressAction(this.reportCount, this.deviceCount))
  }
}

async function readReports(store: Store<State>) {

  const s = store.getState()

  const max_request = 3
  let counter = 0
  let pos = 0
  const progress = new Progress(store)


  const next = () => {
    while (pos < s.Paths.length && counter < max_request) {
      const path = s.Paths[pos]
      pos++
      if (s.Controllers[path].online) {
        makeRequest(path)
      } else {
        progress.update()
      }
    }
  }

  const done = () => {
    progress.update()
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
          store.dispatch(new AddDeviceReportAction(path, report))
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

async function load(store: Store<State>) {

  store.dispatch(new UpdateProgressAction(-1, 1))

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

  const interfacePath = await getBACnetInterfacePath(serverName).catch(
    e => {
      console.error(e)
      return ""
    }
  )
  if (!interfacePath) {
    console.log('no bacnet interface found')
    return
  }

  const pathSelector = (items: { path: string }[]) => items.map(item => item.path)

  getBACnetIPNetworks(interfacePath)
    .then(pathSelector)
    .then(getChildren)
    .then(pathSelector)
    .then(paths => client.getObjects(paths))
    .then(childMap => {
      let cs: Controller[] = Array.from(childMap.values())
        .filter(isBACnetVendorSE)
        .filter(isSmartXObject)
        .map(child => {
          const name = pathLast(child.path);
          const onLine = controllerIsOnline(child);

          return {
            name: name,
            path: child.path,
            online: onLine,
            properties: child.properties
          }
        });

      cs.sort((a, b) => a.path.localeCompare(b.path))

      store.dispatch(new AddControllersAction(cs))
    });
}

const reportReader =
  (store: Store<State>) =>
    (next: Dispatch) =>
      (action: Action) => {
        next(action)
        if (action.type === TYPE_ADD_CONTROLLERS) {
          readReports(store)
        }
      }


export default function CreateDataStore() {

  const store = createStore(reducer, initialState, reportReader);

  return {
    subscribe(observer: Observer<State>) {
      return store.subscribe(observer)
    },
    load() {
      load(store)
    },
  }
}
