<script lang="ts">
  export let id: string;
</script>

<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <g class="edit" {id}>
    <path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polygon points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
  </g>
</svg>

<style>
  .edit {
    stroke: var(--secondary-text-color);
  }
</style>