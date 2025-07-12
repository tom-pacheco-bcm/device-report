
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

export function parse(txt: string): Dictionary<string> {
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
    if (data.hasOwnProperty(k)) {
      // for duplicate entries. use the first item 
      // 
      // this is a issue with some reports:
      //    RS485-PortA Function: Sensor Bus
      //    RS485-PortA Function: Disabled
      continue;
    }
    data[k] = line.substring(i + 1).trim()
  }
  return data
}


