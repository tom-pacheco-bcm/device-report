import { parse } from "./device-report";

const DEVICE_REPORT_PATH = "/Diagnostic Files/Device Report";

const k_ActiveFW = "ActiveFWRev";
const k_RSTP = "RSTP";
const k_rstpStatus = "RSTP Status";
const k_MACAddress = "MACAddress";
const k_ProductId = "Product Id";
const k_SerialNumber = "Serial Number";
const k_IPAddress = "IP Address";


class ReportRequest {
  constructor(
    readonly path: string,
    readonly resolve: (value: DeviceReport) => void,
    readonly reject: (value: any) => void,
  ) { }
}

class ReportLoader {
  max_request = 2;
  counter = 0;
  pos = 0;
  queue: ReportRequest[] = []

  load(rr: ReportRequest) {
    if (this.pos >= this.queue.length) {
      this.queue = []
      this.pos = 0
    }
    this.queue.push(rr)
    this.next()
  }

  next() {
    if (this.queue.length > 0 && this.pos >= this.queue.length) {
      this.queue = []
      this.pos = 0
      return
    }

    while (this.pos < this.queue.length && this.counter < this.max_request) {
      const rr = this.queue[this.pos];
      this.pos++;
      this.makeRequest(rr);
    }
  };

  done() {
    this.counter--;
    this.next();
  };

  makeRequest(rr: ReportRequest) {
    this.counter++;
    const objectPath = rr.path + DEVICE_REPORT_PATH;
    return client.readFile(objectPath)
      .then(txt => {
        if (!txt) {
          rr.reject("no file")
        }
        rr.resolve(new DeviceReport(rr.path, txt))
      })
      .catch(rr.reject)
      .finally(() => { this.done() })
  };
}

const loader = new ReportLoader()

export function getDeviceReport(devicePath: string) {
  return new Promise<DeviceReport>((resolve, reject) => {
    loader.load(new ReportRequest(devicePath, resolve, reject))
  })
}

export class DeviceReport implements DeviceReport {
  #text: string = $state("")
  props: Dictionary<string> = {}

  Firmware() { return this.props[k_ActiveFW]; }
  RSTP() { return this.props[k_RSTP]; }
  RSTPStatus() { return this.props[k_rstpStatus]; }
  MACAddress() { return this.props[k_MACAddress]; }
  ProductId() { return this.props[k_ProductId]; }
  SerialNumber() { return this.props[k_SerialNumber]; }
  IPAddress() { return this.props[k_IPAddress]; }

  constructor(readonly path: string, txt?: string) {
    if (txt) {
      this.#text = txt
      this.props = parse(txt)
    }
  }

  text() { return this.#text }

  isLoaded() {
    return this.#text !== ""
  }

  load() {
    this.readFile()
  }

  readFile() {
    const objectPath = this.path + DEVICE_REPORT_PATH;
    return client.readFile(objectPath)
      .then(txt => {
        if (!txt) { return }
        this.#text = txt
        this.props = parse(txt)
      })
  }
}
