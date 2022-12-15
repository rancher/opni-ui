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

  data() {
    return { selectedIndex: this.items.findLastIndex(i => this.$router.history.current.path.includes(i.route)) };
  },

  watch: {
    $route() {
      this.$set(this, 'selectedIndex', this.items.findLastIndex(i => this.$router.history.current.path.includes(i.route)));
    },
  },
};
</script>

<template>
  <div class="items">
    <SideNavColumnItem v-for="(item, i) in items" :key="i" :item="item" :selected="selectedIndex === i" />
  </div>
</template>
<style lang="scss" scoped>
  .items {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
