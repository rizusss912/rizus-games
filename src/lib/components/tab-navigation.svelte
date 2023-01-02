<script lang="ts">
    const TAB_NAVIGATION_CLASS = 'tabnav';
    const TAB_KEY = 'Tab';
  
    function clickHandler() {
      document.body.classList.remove(TAB_NAVIGATION_CLASS);
    }

    function keyDownHandler({ key }: KeyboardEvent) {
      if (key !== TAB_KEY) {
        return;
      }

      document.body.classList.add(TAB_NAVIGATION_CLASS);
    }
</script>
  
<svelte:body on:mousedown={clickHandler} on:keydown={keyDownHandler} />

<style global>
    :global(body.tabnav) :global(*):focus {
        box-shadow: 0 0 0 2px rgba(var(--background-color)), 0 0 0 4px var(--primary-color);
    }

    :global(*):focus {
        outline: none;
    }

    :global(*)::-moz-focus-inner {
        border: 0;
    }
</style>