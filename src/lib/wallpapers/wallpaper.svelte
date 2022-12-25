<script lang="ts">
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
</script>

<img class="night" srcset="{desert_800w_5} 800w, {desert_1200w_5} 1200w, {desert_1600w_5} 1600w" alt="desert wallpaper" />
<img class="day" srcset="{desert_800w_3} 800w, {desert_1200w_3} 1200w, {desert_1600w_3} 1600w" alt="desert wallpaper" />

<style>
    img {
        display: block;
        position: fixed;

        width: 100vw;
        height: 100vh;
        left: 0;
        top: 0;

        z-index: -100;

        pointer-events: none;
        object-fit: cover;
    }

    .night {
        display: none;
    }

    @media (prefers-color-scheme: dark) {
        .night {
            display: block;
        }

        .day {
            display: none;
        }
	}
</style>