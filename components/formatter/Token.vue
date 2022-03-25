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
    isToken() {
      return /^[0-9a-f]{12}\.[0-9a-f]{52}$/i.test(this.value);
    },
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
  <span v-if="isToken" class="token">
    <span class="token-id">
      {{ tokenId }}
    </span>
    <span class="token-dot">
      .
    </span>
    <span class="token-secret">
      {{ tokenSecret }}
    </span>
    <i
      v-tooltip="'Copy Token'"
      class="icon icon-copy"
      @click="onClick"
    />
  </span>
  <span v-else>
    {{ value }}
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
  font-family: $mono-font;
}
.token-dot {
  font-family: $mono-font;
}
.token-secret {
  color: var(--app-other-accent);
  font-family: $mono-font;
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
