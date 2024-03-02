

declare type Controller = {
  name: string;
  path: string;
  online: boolean;
  properties: PropertyInfo;
};

declare type State = {
  Paths: string[];
  Controllers: { [path: string]: Controller };
  Reports: { [path: string]: string };
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
