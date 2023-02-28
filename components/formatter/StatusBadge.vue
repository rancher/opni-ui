<script>
import BadgeState from '@/components/BadgeState';

export default {
  components: { BadgeState },
  props:      {
    value: {
      type:     Object,
      required: true
    },
  },

  computed: {
    color() {
      return `bg-${ this.value.state }`;
    }
  }
};
</script>

<template>
  <div>
    <BadgeState v-tooltip="value.longMessage" :color="color" :label="value.shortMessage || value.message" />
  </div>
</template>

<style lang="scss" scoped>
::v-deep .badge-state {
  cursor: default;
}
</style>
