

const sections = [
  "Controller Memory Data",
  "Manufacturing data",
  "Network Configuration Data",
  "Firmware Update History",
  "Firmware and Uprev Info",
  "Reason for CPU Firmware Version Change",
  "Most recent FW Download Log",
  "Most recent uprev log",
  "Previous FW Download log",
  "Firmware Reset/Restart History",
  "Host Server Information",
  "Device Settings Data",
  "Files in Root Directory",
  "IO CEC",
  "R",
  "B",
  "A1",
  "A2",
  "A22",
  "RT",
  "EOS",
]

const skip_sections = [
  "Most recent FW Download Log",
  "Most recent uprev log",
  "Previous FW Download log",
  "Firmware Reset/Restart History",
  "Files in Root Directory",
  "IO CEC",
  "R",
  "B",
  "A1",
  "A2",
  "A22",
  "RT",
  "EOS",
]

declare type DeviceReport = {

  General?: {
    Name?: string
    BACnetID?: Number
    Generated?: Date
    Filesystem?: string
    HealthCheck?: string
    Initialized?: Date
    [name: string]: string | Date | Number | undefined
  }

  ControllerMemory?: {
    Free?: string
  }

  Manufacturing?: {
    SerialNumber?: string
    ModelNumber?: string
    ProductId?: string
    MACAddress?: string
    [name: string]: string | Date | Number | undefined
  }

  NetworkConfiguration?: {
    IPAddress?: string
    SubnetMask?: string
    DefaultRouter?: string
    DHCP?: string
    IPAssignment?: string
    [name: string]: string | Date | Number | undefined
  }

  FirmwareUpdateHistory?: string[]

  FirmwareInfo?: {
    Version?: string
    ActiveFWRev?: string
    InactiveFWRev?: string
    BootAppletVersion?: string
    LBASignature?: string
    MainBoardFirmwareVersion?: string
    RoomUnitApplicationFileVersion?: string
    RoomUnitBootloaderFileVersion?: string
    CPUFirmwareVersionChangeReason?: string
    [name: string]: string | Date | Number | undefined
  }
  // Most recent 
  FWDownloadLog?: string[]
  UpRevLog?: string[]
  PreviousFWDownloadLog?: string[]

  FirmwareReset_RestartHistory?: string[]

  HostServer?: {
    Name?: string
    ID?: number
    Location?: string
  }

  DeviceSettings?: {
    DisplayNetworkInformation?: string
    EthernetPort2?: string
    USBHostPort?: string
    USBDevicePort?: string
    WhiteList?: string
    RSTP?: string
    RSTPStatus?: string
    DisplayStatus?: string
    HandOverride?: string
    Bluetooth?: string
    RS485PortAFunction?: string
    RS485PortBFunction?: string
    [name: string]: string | Date | Number | undefined
  }

  FileSystem?: {
    Files?: string[]
    VolumeSize?: number
    UsedSpace?: number
    FreeSpace?: number
    BadSpace?: number
  }
}

function parseLines(lines: string[], pos: number) {
  const start = pos
  while (1) {
    let i = lines[pos].indexOf(':');
    if (i === -1) {
      pos++
      continue;
    }
    const k = lines[pos].substring(0, i)
    if (k in sections) {
      break
    }
  }
  return lines.slice(start, pos)
}

export function parse1(txt: string) {
  const data: Dictionary<string> = {}
  let sect = []
  let hive = "Header"
  if (!txt) {
    return data;
  }
  let skip = false
  const lines = txt.split('\n').filter(l => l !== "")
  for (let line of lines) {
    if (line === '') {
      continue;
    }
    let i = line.indexOf(':');
    if (i === -1) {
      i = line.indexOf('=');
      if (i === -1) {
        continue;
      }
    }
    const k = line.substring(0, i)
    if (k === "Files in Root Directory") {
      break;
    }
    if (k in sections) {
      skip = k in skip_sections
      continue;
    }
    if (skip) {
      continue;
    }
    data[k] = line.substring(i + 1).trim()
  }
  return data
}



export function parse(txt: string) {
  const data: Dictionary<string> = {}
  if (!txt) {
    return data;
  }
  let skip = false
  const lines = txt.split('\n').filter(l => l !== "")
  for (let line of lines) {
    let i = line.indexOf(':');
    if (i === -1) {
      i = line.indexOf('=');
      if (i === -1) {
        continue;
      }
    }
    const k = line.substring(0, i)
    if (k === "Files in Root Directory") {
      break;
    }
    if (k in sections) {
      skip = k in skip_sections
      continue;
    }
    if (skip) {
      continue;
    }
    data[k] = line.substring(i + 1).trim()
  }
  return data
}


type Cursor = {
  data: string
  start: number
  pos: number
  [_: number]: string
}


function accept(c: Cursor): boolean {
  return false
}

function acceptEmpty(c: Cursor): boolean {
  return true
}

function acceptor(ch: string) {
  return (c: Cursor): boolean => {
    if (c[c.pos] !== ch) {
      return false
    }
    c.pos++
    return true
  }
}

function acceptWhitespace(c: Cursor): boolean {
  let pos = c.pos
  while (c[pos] === ' ') { pos++ }
  if (pos === c.pos) {
    return false
  }
  return true
}

function acceptNewLine(c: Cursor): boolean {
  if (c.data[c.start] !== '\n') {
    return false
  }
  c.start++
  return true
}

function acceptLine(c: Cursor): boolean {
  while (c.data[c.pos] !== '\n') {
    c.pos++
  }
  return true
}


let re1 = /DEVICE REPORT: (.*) - BACnet ID: (\d+) Generated: (.*)/
let re2 = /Filesystem \((.*)\) Health Check Normal. Initialized: (.*)/

function parseHeader(txt: string[]) {

  for (let line of txt) {

  }



}
