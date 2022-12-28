<script lang="ts" context="module">
    import desert_800w_1 from './desert/800w/1.jpg';
    import desert_800w_2 from './desert/800w/2.jpg';
    import desert_800w_3 from './desert/800w/3.jpg';
    import desert_800w_4 from './desert/800w/4.jpg';
    import desert_800w_5 from './desert/800w/5.jpg';

    import desert_1200w_1 from './desert/1200w/1.jpg';
    import desert_1200w_2 from './desert/1200w/2.jpg';
    import desert_1200w_3 from './desert/1200w/3.jpg';
    import desert_1200w_4 from './desert/1200w/4.jpg';
    import desert_1200w_5 from './desert/1200w/5.jpg';

    import desert_1600w_1 from './desert/1600w/1.jpg';
    import desert_1600w_2 from './desert/1600w/2.jpg';
    import desert_1600w_3 from './desert/1600w/3.jpg';
    import desert_1600w_4 from './desert/1600w/4.jpg';
    import desert_1600w_5 from './desert/1600w/5.jpg';

	import { ColorScheme, colorScheme } from '$lib/components/browser-theme.svelte';

    type Index = 1 | 2 | 3 | 4 | 5;

    const TARGET_INDEX_MAP: Record<ColorScheme, Index> = {
        [ColorScheme.DARK]: 5,
        [ColorScheme.LIGHT]: 3,
    }

    enum Class {
        DAY = 'day',
        NIGHT = 'night',
    }
</script>

<script lang="ts">
    let lastIndex: Index | null = null;
    let index: Index = TARGET_INDEX_MAP[$colorScheme];

    $: updateIndex($colorScheme);

    function updateIndexWithDelay() {
        setTimeout(() => updateIndex($colorScheme), 1300);
    };

    function updateIndex(colorScheme: ColorScheme): void {
        const targetIndex = TARGET_INDEX_MAP[colorScheme];

        if (index === targetIndex) {
            return;
        }

        lastIndex = index;

        if (index + 1 > 5) {
            console.log(0);
            index = 1;
        } else {
            console.log(index + 1);
            index += 1;
        }

        updateIndexWithDelay();
    }

    function getZIndexByIndex(index: Index, activeIndex: Index): number {
        if (index === activeIndex) {
            return -100;
        }

        if (lastIndex === null) {
            return - 101;
        }
    
        if (index === lastIndex) {
            return -99;
        }

        return -98;
    }

    function getClassByIndex(index: Index, lastIndex: Index | null): Class | null {
        if (lastIndex !== null) {
            return null;
        }

        if (index === TARGET_INDEX_MAP[ColorScheme.DARK]) {
            return Class.NIGHT;
        }

        if (index === TARGET_INDEX_MAP[ColorScheme.LIGHT]) {
            return Class.DAY;
        }

        return null;
    }
</script>

<img loading="lazy" class:not-active={index !== 1} class={getClassByIndex(1, lastIndex)} style="z-index: {getZIndexByIndex(1, index)};" srcset="{desert_800w_1} 800w, {desert_1200w_1} 1200w, {desert_1600w_1} 1600w" alt="desert wallpaper" />
<img loading="lazy" class:not-active={index !== 2} class={getClassByIndex(2, lastIndex)} style="z-index: {getZIndexByIndex(2, index)};" srcset="{desert_800w_2} 800w, {desert_1200w_2} 1200w, {desert_1600w_2} 1600w" alt="desert wallpaper" />
<img loading="eager" class:not-active={index !== 3} class={getClassByIndex(3, lastIndex)} style="z-index: {getZIndexByIndex(3, index)};" srcset="{desert_800w_3} 800w, {desert_1200w_3} 1200w, {desert_1600w_3} 1600w" alt="desert wallpaper" />
<img loading="lazy" class:not-active={index !== 4} class={getClassByIndex(4, lastIndex)} style="z-index: {getZIndexByIndex(4, index)};" srcset="{desert_800w_4} 800w, {desert_1200w_4} 1200w, {desert_1600w_4} 1600w" alt="desert wallpaper" />
<img loading="eager" class:not-active={index !== 5} class={getClassByIndex(5, lastIndex)} style="z-index: {getZIndexByIndex(5, index)};" srcset="{desert_800w_5} 800w, {desert_1200w_5} 1200w, {desert_1600w_5} 1600w" alt="desert wallpaper" />

<style>
    img {
        display: block;
        position: fixed;

        width: 100vw;
        height: 100vh;
        left: 0;
        top: 0;

        pointer-events: none;
        object-fit: cover;
    }

    .not-active {
        animation: last 3s forwards ease-in-out;
    }

    .night,
    .transition {
        opacity: 0;
    }

    @media (prefers-color-scheme: dark) {
        .night {
            opacity: 1;
        }

        .day {
            opacity: 0;
        }
	}

    @keyframes last {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
</style>