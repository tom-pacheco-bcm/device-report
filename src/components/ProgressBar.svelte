<script>
  let { value, max } = $props();
  let content = $derived(
    max > 0
      ? `Loading... ${(100 * (value / max)).toFixed(1)}%`
      : "Loading...",
  );
</script>

<div class="flex items-center gap-1" hidden={value >= max || max === 0}>
  <label for="status"> {content} </label>
  <progress class="blue-300" name="status" {max} {value}></progress>
</div>
