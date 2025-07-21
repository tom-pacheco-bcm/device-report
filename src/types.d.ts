

declare type Controller = {
  name: string;
  path: string;
  status: string;
  model: string;
  vendorId: string;
  online: boolean;
  properties: PropertyInfo;
};

declare type DeviceReport = {
  path: string
  props: Dictionary<string>
  Firmware(): string
  RSTP(): string
  RSTPStatus(): string
  MACAddress(): string
  ProductId(): string
  SerialNumber(): string
  IPAddress(): string
  text(): string
  isLoaded(): boolean
  load(): void
  readFile(): Promise<void>
};

declare type State = {
  Nodes: ChildInfo[];
  Values: { [path: string]: Value };
  Server: string
  Interface: string;
  NetworkPaths: string[];
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
  Interface: string;
  Path: string;
  Status: string;
  ProductId: string;
  SerialNumber: string;
  Firmware: string;
  RSTP: string;
  RSTPStatus: string;
  MACAddress: string;
  IPAddress: string;
  loaded: boolean;
};


declare type Pathed = {
  path: string;
};

