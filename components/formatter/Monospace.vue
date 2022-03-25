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

    condition: {
      type:     Function,
      default: () => true
    },
  },
};
</script>

<template>
  <span v-if="condition(value)" class="mono">
    {{ value }}
  </span>
  <span v-else>
    {{ value }}
  </span>
</template>

<style lang="scss" scoped>
.mono {
  font-family: $mono-font;
}
</style>
