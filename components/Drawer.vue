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
  },

  data() {
    return {
      drawerHeight: null,
      dragging:     false,
      maximized:    false,
    };
  },

  methods: {
    close() {
      this.$emit('close');
      this.$set(this, 'maximized', false);
    },

    onMouseMove(ev) {
      if (!this.dragging) {
        return;
      }

      const clientHeight = document.documentElement.clientHeight;
      const mouseY = ev.clientY;
      const drawerHeight = clientHeight - mouseY;
      const value = this.maximized ? null : `${ drawerHeight }px`;

      this.$set(this, 'drawerHeight', value);
    },

    onDrag() {
      this.$set(this, 'dragging', true);
    },

    onDragDone() {
      this.$set(this, 'dragging', false);
    },

    toggle() {
      console.log('toggle')
      this.$set(this, 'maximized', !this.maximized);
    }
  },

  computed: {
    style() {
      if (this.maximized) {
        return {};
      }

      return { height: this.drawerHeight };
    },

    toggleClass() {
      return this.maximized ? 'icon-chevron-down' : 'icon-chevron-up';
    }
  }
};
</script>

<template>
  <div class="catch-all" :class="{ open }" @click="close" @mousemove="onMouseMove" @mouseup="onDragDone">
    <div class="drawer p-10 pb-0" :class="{ dragging, maximized }" :style="style" @click.stop>
      <div v-if="!maximized" class="handle" @mousedown="onDrag"></div>
      <div class="title-bar">
        <slot name="title">
          <h1>{{ title }}</h1>
        </slot>
        <div class="actions">
          <div class="closer mr-10" @click="toggle">
            <i class="icon icon-2x toggle-icon" :class="toggleClass" />
          </div>
          <div class="closer icon-2x mr-10" @click="close">
            <i class="icon icon-close closer-icon" />
          </div>
        </div>
      </div>
      <div class="content">
        <slot />
      </div>
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
      bottom: -100%;
      pointer-events: none;
    }
  }

  .drawer {
    display: flex;
    flex-direction: column;

    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 450px;

    border-radius: var(--border-radius);
    box-shadow: 0 0 20px var(--shadow);
    background-color: #FFF;
    transition: height 0.2s;

    &.maximized {
      height: 100%;
    }

    .title-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        .actions {
          display: flex;
          flex-direction: row;
        }
    }

    .closer {
        color: var(--link);
        cursor: pointer;
    }

    .handle {
      position: absolute;

      top: -5px;
      left: 0;
      right: 0;
      height:15px;
      cursor: ns-resize;
    }

    &.dragging {
      user-select: none;
      transition: none;
    }

    .content {
      position: relative;
      height: 100%;
    }
  }
</style>
