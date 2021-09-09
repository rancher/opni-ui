<script>
export default {
  props: {
    value: {
      type:    String,
      default: null,
    },

    row: {
      type:    Object,
      default: null,
    },

    getClass: {
      type:    Function,
      default: null,
    }
  },
  computed: {
    computedClass() {
      return this.getClass(this.row, this.value);
    }
  }
};
</script>

<template>
  <span :class="computedClass">{{ value }}</span>
</template>
