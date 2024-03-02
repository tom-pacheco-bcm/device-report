import { create } from "../dom/create";
import { CreateTableRow, TableRow } from "./tableRow";

function getClass(status: string) {
  switch (String(status)) {
    case "Enabled":
      return "status-normal";
    case "Disabled":
      return "";
    case "Changes Pending":
      return "status-pending";
    case "Operational":
      return "status-normal";
    case "Unavailable":
      return "status-unknown";
    default:
      return "";
  }
};

function mapTableRow(controller: ControllerInfo): RowValue {
  return {
    rowName: controller.Name,
    columns: [
      { name: "Path", value: controller.Path },
      { name: "Status", value: controller.IsOnline },
      { name: 'Product Id', value: controller.ProductId },
      { name: 'Serial Number', value: controller.SerialNumber },
      { name: "Firmware", value: controller.Firmware },
      {
        name: "RSTP",
        value: controller.RSTP,
        style: { class: getClass(controller.RSTP), },
      },
      {
        name: "RSTP Status",
        value: controller.RSTPStatus,
        style: { class: getClass(controller.RSTPStatus), },
      },
      { name: "MAC Address", value: controller.MACAddress },
      { name: 'IP Address', value: controller.IPAddress },
    ] as TableColumn[],
  };
}


declare type TableProps = {
  parent: Element
  headers: string[]
}

declare interface Table {
  update: (data: readonly ControllerInfo[]) => void
}

function getHeaderRow(headers: string[]) {

  const columns = headers.map(column => ({
    value: column,
  }));

  return { rowName: columns[0].value, columns: columns.slice(1) } as RowValue
}

export const CreateTable = function (props: TableProps): Table {

  const report = create("div", {class:"report"});
  props.parent.appendChild(report);

  const table = create("table");
  report.appendChild(table);

  const caption = create("caption")
  caption.innerHTML = "Device Report"
  table.appendChild(caption);

  const thead = create("thead");
  table.appendChild(thead);

  const tbody = create("tbody");
  table.appendChild(tbody);

  // create Background

  const header = CreateTableRow({
    parent: thead
  });
  header.update(getHeaderRow(props.headers));

  let tableRows: TableRow[] = [];

  const update = (controllers: readonly ControllerInfo[]) => {

    // add data Rows
    tableRows = controllers
      .map(mapTableRow)
      .map((row, i) => {
        if (tableRows[i]) {
          tableRows[i].update(row);
          return tableRows[i]
        }
        let r = CreateTableRow({
          parent: tbody
        })
        r.update(row);
        return r;
      });
  };

  return {
    update: update,
  };
};
