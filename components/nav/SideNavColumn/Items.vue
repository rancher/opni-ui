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
  computed: {
    selectedIndex() {
      return this.items.findLastIndex(i => this.$router.history.current.path.includes(i.route));
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
  .items {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
