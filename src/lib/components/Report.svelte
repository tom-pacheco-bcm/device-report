<script>
  let { showModal = $bindable(), header, children } = $props();

  let dialog = $state(); // HTMLDialogElement

  $effect(() => {
    if (showModal) dialog.showModal();
  });
</script>

<dialog
  bind:this={dialog}
  onclose={() => (showModal = false)}
  onclick={(e) => {
    if (e.target === dialog) dialog.close();
  }}
  class="m-auto h-full rounded-xl border"
>
  <div class="flex flex-col h-full">
    <header class="p-3 bg-stone-300 border-b">
      {@render header?.()}
    </header>
    {@render children?.()}
    <footer class="p-3 bg-stone-300 border-t">
      <button
        class="px-3 border bg-sky-300 rounded font-semibold cursor-pointer"
        onclick={() => dialog.close()}
      >
        close
      </button>
    </footer>
  </div>
</dialog>
