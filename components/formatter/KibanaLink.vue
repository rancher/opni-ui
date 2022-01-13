<script>
export default {
  props: {
    value: {
      type:     String,
      required: true
    },
    row: {
      type:     Object,
      required: true,
    },
  },

  computed: {
    url() {
      const hostname = window.location.hostname;

      return `http://${ hostname }:5601/app/opensearch-query-workbench`;
    }
  },

  methods: {
    toggle() {
      this.$set(this.row, this.key, !this.open);
    },
  }
};
</script>

<template>
  <a :href="url">{{ value }}</a>
</template>

<style lang="scss" scoped>
.icon {
    cursor: pointer;
}
</style>
