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
  class="relative m-auto flex flex-col"
  hidden={!showModal}
>
  {@render header?.()}
  <hr />
  {@render children?.()}
  <hr />
  <div class="p-2 bg-neutral-100">
    <button class="px-2 border bg-blue-100" onclick={() => dialog.close()}>
      close
    </button>
  </div>
</dialog>
