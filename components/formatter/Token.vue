<script>
export default {
  props: {
    value: {
      type:     String,
      default: ''
    },

    prefix: {
      type:    String,
      default: ''
    },

    suffix: {
      type:    String,
      default: ''
    },
  },
  computed: {
    tokenId() {
      return this.value.split('.')[0];
    },
    tokenSecret() {
      return this.value.split('.')[1];
    },
  },
  methods: {
    onClick(ev) {
      ev.stopPropagation();
      this.$copyText(this.value);
    }
  }
};
</script>

<template>
  <span class="token">
    <span class="token-id">
      {{ tokenId }}
    </span>
    <span class="token-dot">
      .
    </span>
    <span class="token-secret">
      {{ tokenSecret }}
    </span>
    <span
      v-tooltip="'Copy Token'"
      class="icon icon-copy"
      @click="onClick"
    >
    </span>
  </span>
</template>

<style lang="scss" scoped>
.token {
  display: inline-flex;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
}
.token-id {
  color: var(--primary);
  font-family: monospace;
}
.token-dot {
  font-family: monospace;
}
.token-secret {
  color: var(--app-other-accent);
  font-family: monospace;
}
.icon-copy {
  cursor: pointer;
  color: var(--muted);
  display: flex;
  margin-left: 7px;
  align-items: center;
}
.icon-copy:hover {
  color: var(--darker);
}
</style>
