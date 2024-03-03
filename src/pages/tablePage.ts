import CreateDataStore from "../dataStore";
import { CreateButton } from "../components/button";
import { ProgressBar } from "../components/progressBar";
import { CreateTable } from "../components/table";

const k_ActiveFW = "ActiveFWRev"
const k_RSTP = "RSTP"
const k_rstpStatus = "RSTP Status"

//component
export const TablePage = function (): Page {

  const dataStore = CreateDataStore()

  let refreshCount = 0;

  // Create RefreshButton
  const progressBar = ProgressBar({
    el: document.getElementById("progress"),
  });

  const refreshTable = () => {
    refreshCount = 0;
    progressBar.reset();
    dataStore.load();
  };

  // Create RefreshButton
  CreateButton({
    el: document.getElementById("refresh"),
    clickHandler: refreshTable,
  });

  const appElement = document.getElementById("app")

  // Create Table
  const dataTable = CreateTable({
    parent: appElement,
    headers: [
      "Controller",
      "Path",
      "Status",
      'Product Id',
      'Serial Number',
      "Firmware",
      "RSTP",
      "RSTP Status",
      "MAC Address",
      'IP Address',
    ]
  });

  const getTableData = function (state: State): ControllerInfo[] {

    const paths = state.Paths;

    const _tableData = paths.map(path => {

      const c = state.Controllers[path]
      const report = state.Reports[path];

      return {
        Name: c.name,
        Path: c.path,
        IsOnline: c.online,
        Firmware: report[k_ActiveFW] || "Unavailable",
        RSTP: report[k_RSTP] || "Unavailable",
        RSTPStatus: report[k_rstpStatus] || "Unavailable",
        MACAddress: report['MACAddress'] || "Unavailable",
        ProductId: report['Product Id'] || "Unavailable",
        SerialNumber: report['Serial Number'] || "Unavailable",
        IPAddress: report['IP Address'] || "Unavailable",
      }
    });

    return _tableData;
  }

  // table Updates
  const updateTable = (state: State) => {
    const data = getTableData(state)
    dataTable.update(data);
    refreshCount++;
    progressBar.update((refreshCount / (data.length + 1)) * 100);
  };

  dataStore.subscribe(updateTable);

  refreshTable()

  return {
    show(visible) { },
  };
};