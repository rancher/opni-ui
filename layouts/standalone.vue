<script>
import ActionMenu from '@/components/ActionMenu';
import PromptRemove from '@/components/PromptRemove';
import HeaderBar from '@/components/nav/HeaderBar';
import SideNavColumn from '@/components/nav/SideNavColumn';
import SideNavColumnItems from '@/components/nav/SideNavColumn/Items';
import { createNavItemsFromNavigation, NavigationEmitter } from '@/utils/navigation';
import SideNavColumnItem from '@/components/nav/SideNavColumn/Item';
import { NAVIGATION } from '@/product/opni/router';

export default {

  components: {
    HeaderBar, SideNavColumn, SideNavColumnItems, SideNavColumnItem, ActionMenu, PromptRemove,
  },

  async fetch() {
    await this.load();
  },

  created() {
    NavigationEmitter.$on('update', this.load);
  },

  beforeDestroy() {
    NavigationEmitter.$off('update');
  },

  data() {
    return {
      // Assume home pages have routes where the name is the key to use for string lookup
      name:          this.$route.name,
      allNavItems:   [],
    };
  },

  methods: {
    async load() {
      const allNavItems = await createNavItemsFromNavigation(NAVIGATION, this.t.bind(this));

      this.$set(this, 'allNavItems', allNavItems);
    }
  },

  computed: {
    configuration() {
      return this.allNavItems[this.allNavItems.length - 1];
    },

    navItems() {
      return this.allNavItems.slice(0, -1);
    },
  }

};
</script>

<template>
  <div class="dashboard-roots">
    <div class="dashboard-root">
      <div class="dashboard-content">
        <HeaderBar :simple="true">
          <div class="simple-title">
            <img :src="require('~/product/opni/assets/images/opni.svg')" />
          </div>
        </HeaderBar>
        <SideNavColumn>
          <SideNavColumnItems :items="navItems" />
          <SideNavColumnItem v-if="configuration" :item="configuration" />
        </SideNavColumn>
        <main>
          <nuxt />
        </main>
      </div>
    </div>
    <ActionMenu />
    <PromptRemove />
  </div>
</template>

<style lang="scss" scoped>
  .dashboard-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .dashboard-content {
    display: grid;
    flex: 1 1 auto;

    grid-template-areas:
      "header header"
      "nav main";

    grid-template-columns: var(--nav-width) auto;
    grid-template-rows: var(--header-height) auto var(--wm-height,0);

    > HEADER {
      grid-area: header;
    }
  }

  img {
      object-fit: contain;
      height: 35px;
      max-width: 200px;
  }

  MAIN {
    grid-area: main;
    overflow: auto;

    display: flex;
    flex-direction: column;
    padding: 20px;
    min-height: 100%;
  }
</style>
