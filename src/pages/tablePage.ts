import CreateDataStore from "../dataStore";
import { CreateButton } from "../components/button";
import { ProgressBar } from "../components/progressBar";
import { CreateTable } from "../components/table";

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

  const appElement =  document.getElementById("app")

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

  // table Updates
  const updateTable = (data: readonly ControllerInfo[]) => {
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