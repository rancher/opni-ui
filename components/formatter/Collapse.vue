<script>

export default {
  props: {
    row: {
      type:     Object,
      required: true,
    },
  },

  computed: {
    collapseClass() {
      return this.open ? 'icon-chevron-down' : 'icon-chevron-right';
    },

    key() {
      return 'open';
    },

    open() {
      return this.row[this.key];
    },
  },

  methods: {
    toggle() {
      this.$set(this.row, this.key, !this.open);
    },
  }
};
</script>

<template>
  <span class="icon" :class="collapseClass" @click="toggle"></span>
</template>

<style lang="scss" scoped>
.icon {
    cursor: pointer;
}
</style>
