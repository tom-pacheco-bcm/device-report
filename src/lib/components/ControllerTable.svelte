<script lang="ts">
  const k_ActiveFW = "ActiveFWRev";
  const k_RSTP = "RSTP";
  const k_rstpStatus = "RSTP Status";
  const k_MACAddress = "MACAddress";
  const k_ProductId = "Product Id";
  const k_SerialNumber = "Serial Number";
  const k_IPAddress = "IP Address";
  const UNAVAILABLE = "Unavailable";

  let { appState }: { appState: State } = $props();

  const getTableData = function (appState: State): ControllerInfo[] {
    const _tableData = appState.Paths.map((path) => {
      const controller = appState.Controllers[path];
      const report = appState.Reports[path];

      const info: ControllerInfo = {
        Name: controller.name,
        Path: controller.path,
        IsOnline: controller.online,
        Firmware: UNAVAILABLE,
        RSTP: UNAVAILABLE,
        RSTPStatus: UNAVAILABLE,
        MACAddress: UNAVAILABLE,
        ProductId: UNAVAILABLE,
        SerialNumber: UNAVAILABLE,
        IPAddress: UNAVAILABLE,
      };

      if (report) {
        info.Firmware = report[k_ActiveFW];
        info.RSTP = report[k_RSTP];
        info.RSTPStatus = report[k_rstpStatus];
        info.MACAddress = report[k_MACAddress];
        info.ProductId = report[k_ProductId];
        info.SerialNumber = report[k_SerialNumber];
        info.IPAddress = report[k_IPAddress];
      }
      return info;
    });
    return _tableData;
  };

  let controller_infos: ControllerInfo[] = $derived(getTableData(appState));

  const columns: {
    title: string;
    value(ci: ControllerInfo): string;
    format?(ci: ControllerInfo): string;
  }[] = [
    {
      title: "Name",
      value: (ci) => ci.Name,
    },
    {
      title: "Path",
      value: (ci) => ci.Path,
      format: (ci) => "text-sm",
    },
    {
      title: "Status",
      value: (ci) => (ci.IsOnline ? "Online" : "Offline"),
      format: (ci) =>
        ci.IsOnline ? "text-green-700" : "text-red-700 font-semibold",
    },
    {
      title: "Product Id",
      value: (ci) => ci.ProductId,
    },
    {
      title: "Serial Number",
      value: (ci) => ci.SerialNumber,
    },
    {
      title: "Firmware",
      value: (ci) => ci.Firmware,
    },
    {
      title: "RSTP",
      value: (ci) => ci.RSTP,
      format: (ci) =>
        ci.RSTP === "Disabled" ? "text-yellow-700 font-semibold" : "",
    },
    {
      title: "RSTP Status",
      value: (ci) => ci.RSTPStatus,
      format: (ci) => {
        if (ci.RSTP === "Disabled") {
          return "text-bg-slate-700";
        }
        switch (ci.RSTPStatus) {
          case "Enabled":
          case "Operational":
            return "text-green-700";
          case "Disabled":
          case "Changes Pending":
            return "text-red-700 font-semibold";
          default:
            return "text-yellow-700";
        }
      },
    },
    {
      title: "MAC Address",
      value: (ci) => ci.MACAddress,
    },
    {
      title: "IP Address",
      value: (ci) => ci.IPAddress,
    },
  ];
</script>

<div class="m-2 p-2">
  <table
    class="table-auto w-full text-left border-collapse border border-blue-400 bg-gray-100 print:border-black print:bg-white"
  >
    <caption class="m-2 p-1 font-bold text-2xl text-indigo-800">
      Device Report
    </caption>
    <thead>
      <tr
        class="text-blue-800 border-b-2 border-blue-500 print:text-black print:border-black print:bg-white"
      >
        {#each columns as col}
          <th class="p-4 font-semibold"> {col.title} </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each controller_infos as ctr}
        <tr
          class="border-b border-blue-200 hover:bg-blue-50 print:text-black print:border-black print:bg-white"
        >
          {#each columns as col}
            <td class="px-2 py-1 {col.format ? col.format(ctr) : ''}">
              {col.value(ctr)}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
