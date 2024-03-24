

declare type Controller = {
  name: string;
  path: string;
  online: boolean;
  properties: PropertyInfo;
};

declare type DeviceReport = { [key: string]: string };

declare type State = {
  Paths: string[];
  Controllers: { [path: string]: Controller };
  Reports: { [path: string]: DeviceReport };
  Progress: {
    Value: number
    Max: number
  };
};

declare type ControllerInfo = {
  Name: string;
  Path: string;
  IsOnline: boolean;
  ProductId: string;
  SerialNumber: string;
  Firmware: string;
  RSTP: string;
  RSTPStatus: string;
  MACAddress: string;
  IPAddress: string;
};

declare type TableColumn = {
  name: string;
  value: string;
  style?: {
    Stroke?: string;
    FontWeight?: string;
    class?: string;
  };
};

declare type RowValue = {
  rowName: string;
  columns: TableColumn[];
};

declare interface Page {
  show: (visible: Boolean) => void
}


type Observer<T> = (s: T) => void

declare interface Action {
  type: String
}

type Dispatch = (a: Action) => void

type DispatchProcessor = (next: Dispatch) => Dispatch

type Reducer<S> = (s: S, a: Action) => S

type Middleware<S> = (s: StoreLike<S>) => (next: Dispatch) => (a: Action) => void

type StoreLike<S> = {
  dispatch: Dispatch
  getState: () => S
}

type StoreKind<S> = StoreLike<S> & {
  subscribe: (s: S) => () => void
}

type CreateStore<S> = (reducer: Reducer<S>, initialState: S) => StoreKind<S>
