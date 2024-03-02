import { create } from "../dom/create";
import { setAttributes } from "../dom/setAttributes";

declare type TableRowProps = {
  parent: Element
}

export declare interface TableRow {
  update: (rowData: RowValue) => void
}

function createRow(element: Element, props: TableRowProps, rowData: RowValue) {

  const columns: Element[] = [];

  // add header row
  const columnEl = create("th");
  element.appendChild(columnEl);

  columns.push(columnEl);

  // set point values
  rowData.columns.forEach((col, i) => {
    const columnEl = create("td");
    element.appendChild(columnEl);
    columns.push(columnEl);
  });

  return columns;
};


export function CreateTableRow(props: TableRowProps): TableRow {

  const rowElement = create("tr");

  props.parent.appendChild(rowElement);

  let columns: Element[] = [];

  // presentation
  const update = (rowData: RowValue) => {
    if (columns.length < rowData.columns.length + 1) {
      columns = createRow(rowElement, props, rowData)
    }

    // set first column
    columns[0].innerHTML = rowData.rowName;

    // set values
    rowData.columns.forEach((col, i) => {
      columns[i + 1].innerHTML = col.value;
      if (col.style) {
        setAttributes(columns[i + 1], col.style);
      }
    });
  };

  return {
    update: update,
  };
};

