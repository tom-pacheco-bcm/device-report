<script lang="ts">
  import { isSmartX } from "../util/isSmartX";
  import { isVendorSE } from "../util/isVendorSE";
  import Report from "./Report.svelte";

  const UNAVAILABLE = "Unavailable";

  let { appState }: { appState: State } = $props();

  type Filter = "RSTP" | "NETWORK" | "FULL";
  let filter: Filter = $state("RSTP");

  let showReport = $state(false);
  let reportText = $state("");

  function viewReport(path: string) {
    const report = appState.Reports[path];
    reportText = report.text();
    showReport = true;
  }

  function readReport(path: string) {
    const report = appState.Reports[path];
    report.load();
  }

  const getTableData = function (
    appState: State,
    filter: Filter,
  ): ControllerInfo[] {
    const _tableData = appState.Paths.filter((path) => {
      const controller = appState.Controllers[path];
      return isVendorSE(controller.vendorId) && isSmartX(controller.model);
    }).map((path) => {
      const controller = appState.Controllers[path];
      const report = appState.Reports[path];

      const info: ControllerInfo = {
        Name: controller.name,
        Interface: appState.Interface,
        Path: controller.path,
        Status: controller.status,
        Firmware: UNAVAILABLE,
        RSTP: UNAVAILABLE,
        RSTPStatus: UNAVAILABLE,
        MACAddress: UNAVAILABLE,
        ProductId: UNAVAILABLE,
        SerialNumber: UNAVAILABLE,
        IPAddress: UNAVAILABLE,
        loaded: false,
      };

      if (report && report.isLoaded()) {
        info.Firmware = report.Firmware();
        info.RSTP = report.RSTP();
        info.RSTPStatus = report.RSTPStatus();
        info.MACAddress = report.MACAddress();
        info.ProductId = report.ProductId();
        info.SerialNumber = report.SerialNumber();
        info.IPAddress = report.IPAddress();
        info.loaded = report.isLoaded();
      }
      return info;
    });
    return _tableData;
  };

  let controller_infos: ControllerInfo[] = $derived(
    getTableData(appState, filter),
  );

  const columns: {
    title: string;
    value(ci: ControllerInfo): string;
    hidden(): boolean;
    format?(ci: ControllerInfo): string;
  }[] = [
    {
      title: "Name",
      hidden: () => false,
      value: (ci) => ci.Name,
    },
    {
      title: "Path",
      hidden: () => false,
      value: (ci) =>
        ci.Path.substring(
          ci.Interface.length + 1,
          ci.Path.length - ci.Name.length,
        ), // strip path prefix of server name and the BACnet interface
      format: (ci) => "text-sm",
    },
    {
      title: "Status",
      hidden: () => false,
      value: (ci) => ci.Status,
      format: (ci) =>
        ci.Status === "Online"
          ? "text-green-700"
          : "text-red-700 font-semibold",
    },
    {
      title: "Product Id",
      hidden: () => false,
      value: (ci) => ci.ProductId,
    },
    {
      title: "Serial Number",
      hidden: () => false,
      value: (ci) => ci.SerialNumber,
    },
    {
      title: "Firmware",
      hidden: () => filter === "NETWORK",
      value: (ci) => ci.Firmware,
    },
    {
      title: "RSTP",
      hidden: () => filter === "NETWORK",
      value: (ci) => ci.RSTP,
      format: (ci) =>
        ci.RSTP === "Disabled" ? "text-yellow-700 font-semibold" : "",
    },
    {
      title: "RSTP Status",
      hidden: () => filter === "NETWORK",
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
      hidden: () => filter === "RSTP",
      value: (ci) => ci.MACAddress,
    },
    {
      title: "IP Address",
      hidden: () => filter === "RSTP",
      value: (ci) => ci.IPAddress,
    },
  ];
</script>

<div class="m-2 p-2">
  <div class="flex m-2 p-2 gap-2 print:hidden">
    <div class="p-1">Select Report</div>
    <button
      class="px-2 py-1 rounded-sm {filter == 'RSTP'
        ? 'bg-neutral-100 font-medium'
        : 'hover:bg-yellow-100 hover:cursor-pointer'}"
      onclick={() => (filter = "RSTP")}>RSTP</button
    >
    <button
      class="px-2 py-1 rounded-sm {filter == 'NETWORK'
        ? 'bg-neutral-100 font-medium'
        : 'hover:bg-yellow-100 hover:cursor-pointer'}"
      onclick={() => (filter = "NETWORK")}>Network</button
    >
    <button
      class="px-2 py-1 rounded-sm {filter == 'FULL'
        ? 'bg-neutral-100 font-medium'
        : 'hover:bg-yellow-100 hover:cursor-pointer'}"
      onclick={() => (filter = "FULL")}>Full</button
    >
  </div>
  <table
    class="table-auto w-full text-left border-collapse border border-blue-400 bg-gray-100 print:border-black print:bg-white"
  >
    <caption class="m-2 p-1 font-bold text-2xl text-indigo-800">
      Device {filter === "RSTP"
        ? "RSTP"
        : filter === "NETWORK"
          ? "Network"
          : ""} Report
    </caption>
    <thead>
      <tr
        class="text-blue-800 border-b border-blue-400 print:text-black print:border-black print:bg-white"
      >
        {#each columns as col}
          {#if !col.hidden()}
            <th class="p-4 px-2 font-semibold"> {col.title} </th>
          {/if}
        {/each}
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each controller_infos as ctr}
        <tr
          class="border-b border-blue-400 hover:bg-blue-50 print:text-black print:border-black print:bg-white"
        >
          {#each columns as col}
            {#if !col.hidden()}
              <td class="px-2 py-1 {col.format ? col.format(ctr) : ''}">
                {col.value(ctr)}
              </td>
            {/if}
          {/each}
          <td class="py-1 flex">
            <div class="group relative inline-block" hidden={!ctr.loaded}>
              <button
                class="text-md px-1 hover:bg-indigo-200 print:hidden cursor-pointer"
                onclick={() => {
                  readReport(ctr.Path);
                }}>↺</button
              >
              <span
                class="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-700 text-white p-2 rounded absolute bottom-full left-1/2 -translate-x-1/2"
              >
                Refresh
              </span>
            </div>
            <div class="group relative inline-block" hidden={!ctr.loaded}>
              <button
                class="text-md px-1 hover:bg-indigo-200 print:hidden cursor-pointer"
                onclick={() => {
                  viewReport(ctr.Path);
                }}>&#128463;</button
              >
              <span
                class="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-700 text-white p-2 rounded absolute bottom-full left-1/2 -translate-x-1/2"
              >
                View Report
              </span>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<Report bind:showModal={showReport}>
  {#snippet header()}
    <div class="font-semibold text-lg">
      <h2>Device Report</h2>
    </div>
  {/snippet}
  <pre class="h-full px-1 overflow-auto text-sm font-mono">
    {reportText}
  </pre>
</Report>
