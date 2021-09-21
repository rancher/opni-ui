<script>
import SideNavColumnItem from '@/components/nav/SideNavColumn/Item';

export default {
  components: { SideNavColumnItem },
  props:      {
    items: {
      type:     Array,
      required: true
    }
  },
};
</script>

<template>
  <div class="items">
    <SideNavColumnItem v-for="(item, i) in items" :key="i" :item="item" />
  </div>
</template>
<style lang="scss" scoped>
</style>
