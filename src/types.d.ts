

declare type Controller = {
  name: string;
  path: string;
  online: boolean;
  properties: PropertyInfo;
};

declare type DeviceReport = { [key: string]: string };

declare type State = {
  Server: string
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
