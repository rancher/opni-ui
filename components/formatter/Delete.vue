<script>
export default {
  props: {
    row: {
      type:     Object,
      required: true,
    },
  },
  methods: {
    remove(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this.row.remove();
    }
  }
};
</script>

<template>
  <button type="button" @click="remove">
    <i class="icon icon-delete icon-lg"></i>
  </button>
</template>

<style lang="scss" scoped>
  button {
    &, &:focus {
      border: none;
      background: none;
      outline: none;
      box-shadow: none;
      color: var(--primary);
      padding: 0;
    }
  }
</style>
