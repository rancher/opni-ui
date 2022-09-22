<script>
import HeaderBar from '@/components/nav/HeaderBar';
import SideNavColumn from '@/components/nav/SideNavColumn';
import SideNavColumnItems from '@/components/nav/SideNavColumn/Items';
import { createNavItemsFromNavigation } from '@/utils/navigation';
import SideNavColumnItem from '@/components/nav/SideNavColumn/Item';
import { NAVIGATION } from '../router';

export default {

  components: {
    HeaderBar, SideNavColumn, SideNavColumnItems, SideNavColumnItem
  },

  data() {
    const allNavItems = createNavItemsFromNavigation(NAVIGATION, this.t.bind(this));
    const navItems = allNavItems.slice(0, -1);
    const configuration = allNavItems[allNavItems.length - 1];

    return {
      // Assume home pages have routes where the name is the key to use for string lookup
      name: this.$route.name,
      navItems,
      configuration
    };
  },

};
</script>

<template>
  <div class="dashboard-root">
    <div class="dashboard-content">
      <HeaderBar :simple="true">
        <div class="simple-title">
          <img :src="require('~/product/opni/assets/images/opni.svg')" />
        </div>
      </HeaderBar>
      <SideNavColumn>
        <SideNavColumnItems :items="navItems" />
        <SideNavColumnItem :item="configuration" />
      </SideNavColumn>
      <main>
        <slot />
      </main>
    </div>
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
