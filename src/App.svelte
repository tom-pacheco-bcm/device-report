<script lang="ts">
  import "./app.css";

  import ProgressBar from "./lib/components/ProgressBar.svelte";
  import ControllerTable from "./lib/components/ControllerTable.svelte";
  import VersionInfo from "./lib/components/VersionInfo.svelte";
  import { load, appState } from "./lib/data/Data.svelte";

  load().then(() => {
    // Initial load complete
  });

  const print = () => {
    window.print();
  };
</script>

<div class="flex flex-col gap-5 print:text-sm">
  <div
    class="bg-emerald-800 p-2 text-2xl font-semibold text-neutral-100 print:hidden"
  >
    Device Report
  </div>

  <div class="m-2 p-2 flex content-center gap-10 print:hidden">
    <div class="flex-1 flex gap-4">
      <ProgressBar
        value={appState.Progress.Value}
        max={appState.Progress.Max}
      />
    </div>
    <div>
      <button
        class="px-4 py-2 bg-blue-500 text-white border border-blue-700 rounded-md hover:bg-blue-700 font-semibold text-md cursor-pointer"
        onclick={print}
      >
        Print pdf
      </button>
    </div>
  </div>

  <ControllerTable {appState} />

  <div class="mx-2 px-2 flex-rt">{new Date().toLocaleString("en-US")}</div>

  <VersionInfo />
</div>
