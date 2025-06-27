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

  // Set the current date and time in the header
  const dateTimeElement = document.getElementById("datetime");
  if (dateTimeElement) {
    const now = new Date();
    dateTimeElement.textContent = now.toLocaleString("en-US");
  }

  // Create RefreshButton
  const progressBar = ProgressBar({
    el: document.getElementById("progress"),
  });

  const refreshTable = () => {
    progressBar.reset();
    dataStore.load();
  };

  // Create RefreshButton
  CreateButton({
    el: document.getElementById("refresh"),
    clickHandler: refreshTable,
  });

  // Create PrintButton
  CreateButton({
    el: document.getElementById("print-button"),
    clickHandler: () => {
      window.print();
    }
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
        Firmware: (report && report[k_ActiveFW]) || "Unavailable",
        RSTP: (report && report[k_RSTP]) || "Unavailable",
        RSTPStatus: (report && report[k_rstpStatus]) || "Unavailable",
        MACAddress: (report && report['MACAddress']) || "Unavailable",
        ProductId: (report && report['Product Id']) || "Unavailable",
        SerialNumber: (report && report['Serial Number']) || "Unavailable",
        IPAddress: (report && report['IP Address']) || "Unavailable",
      }
    });

    return _tableData;
  }

  // table Updates
  const updateTable = (state: State) => {
    dataTable.update(getTableData(state));
    progressBar.update(state.Progress.Value, state.Progress.Max);
  };

  dataStore.subscribe(updateTable);

  refreshTable()

  return {
    show(visible) { },
  };
};