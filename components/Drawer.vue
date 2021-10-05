<script>
export default {
  components: { },

  props: {
    open: {
      type:    Boolean,
      default: true
    },
    title: {
      type:    String,
      default: null
    }
  }
};
</script>

<template>
  <div class="catch-all" :class="{ open }" @click="$emit('close')">
    <div class="drawer p-10" @click.stop>
      <div class="title-bar">
        <slot name="title">
          <h1>{{ title }}</h1>
        </slot>
        <div class="closer mr-10" @click="$emit('close')">
          <i class="icon icon-3x icon-close closer-icon" />
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
  .catch-all {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;

    z-index: 1000;

    transition: bottom 0.2s;

    &:not(.open) {
      bottom: -450px;
      pointer-events: none;
    }
  }

  .drawer {
    position: absolute;
    left: 5px;
    right: 5px;
    bottom: 0;

    height: 450px;

    border-radius: var(--border-radius);
    box-shadow: 0 0 20px var(--shadow);
    background-color: #FFF;

    .title-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .closer {
        color: var(--link);
        cursor: pointer;
    }
  }
</style>
