<script lang="ts">
    import pkg from "../../package.json";

    let description =
        pkg.name +
        " - Version: " +
        pkg.version +
        " - Date: " +
        new Date().toDateString();
</script>

<div class="flex flex-col items-center gap-1 px-4 text-center print:text-sm">
    <div>{description}</div>
    <div>by BCM Controls</div>
</div>
