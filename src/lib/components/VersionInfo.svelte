<script lang="ts">
    import pkg from "../../../package.json";

    const description = pkg.name + " - v" + pkg.version;
</script>

<div class="flex flex-col items-center gap-1 px-4 text-center print:text-sm">
    <div>{description}</div>
    <div>BCM Controls</div>
</div>
