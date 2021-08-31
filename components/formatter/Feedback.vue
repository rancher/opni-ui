<script>
export default {
  components: { },
  props:      {
    row: {
      type:     Object,
      required: true,
    },
    options: {
      type:    [Object, String],
      default: null,
    },
  },
  data() {
    return { thumbsDown: require('~/assets/images/thumb_down.svg') };
  },
  methods: {
    remove() {
      this.row.remove();
    },
    undo() {
      this.row.undo();
    },
  }
};
</script>

<template>
  <span>
    <button v-if="!row.removed" :key="0" class="btn btn-sm role-link" @click="remove">
      <img :src="thumbsDown" @click="remove" />
    </button>
    <button v-else :key="1" class="btn btn-sm role-secondary" @click="undo">
      Undo
    </button>
  </span>
</template>

<style lang="scss" scoped>
.btn {
  margin-right: 10px;
  padding-top: 5px;
  width: 50px;
  height: 37px;
}

img {
  $size: 20px;
  width: $size;
  height: $size;
  position: relative;
  top: 4px;
}
</style>
