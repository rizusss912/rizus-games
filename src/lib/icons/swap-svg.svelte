<script lang="ts">
    export let id: string;
    export let size: number = 24;
</script>

<svg width={size} height={size} viewBox="0 0 18 14">
    <g class="swap" {id} stroke-width="1" fill="none" fill-rule="evenodd">
        <g transform="translate(-343.000000, -467.000000)">
            <g transform="translate(100.000000, 100.000000)">
                <g transform="translate(240.000000, 362.000000)">
                    <g>
                        <polygo points="0 0 24 0 24 24 0 24" />
                        <path d="M6.14,11.86 L3.36,14.65 C3.17,14.85 3.17,15.16 3.36,15.36 L6.14,18.15 C6.45,18.47 6.99,18.24 6.99,17.8 L6.99,16 L13,16 C13.55,16 14,15.55 14,15 C14,14.45 13.55,14 13,14 L6.99,14 L6.99,12.21 C6.99,11.76 6.45,11.54 6.14,11.86 Z M20.65,8.65 L17.87,5.86 C17.56,5.54 17.02,5.77 17.02,6.21 L17.02,8 L11,8 C10.45,8 10,8.45 10,9 C10,9.55 10.45,10 11,10 L17.01,10 L17.01,11.79 C17.01,12.24 17.55,12.46 17.86,12.14 L20.64,9.35 C20.84,9.16 20.84,8.84 20.65,8.65 Z" />
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>

<style>
    .swap {
        fill: var(--secondary-text-color);
    }
</style>