<script>
import HeaderBar from '@/components/nav/HeaderBar';
import SideNavColumn from '@/components/nav/SideNavColumn';
import SideNavColumnItems from '@/components/nav/SideNavColumn/Items';
import BrandImage from '@/components/BrandImage';

export default {

  components: {
    BrandImage, HeaderBar, SideNavColumn, SideNavColumnItems
  },

  data() {
    return {
      // Assume home pages have routes where the name is the key to use for string lookup
      name:     this.$route.name,
      navItems: [
        {
          label: this.t('opni.nav.logging'),
          route:        'logging',
          icon:         'globe'
        },
        {
          label: this.t('opni.nav.metrics'),
          route:        'metrics',
          icon:         'globe'
        }
      ]
    };
  },

};
</script>

<template>
  <div class="dashboard-root">
    <div class="dashboard-content">
      <HeaderBar :simple="true">
        <div class="simple-title">
          <BrandImage class="side-menu-logo-img" file-name="opni.png" />
        </div>
      </HeaderBar>
      <SideNavColumn>
        <SideNavColumnItems :items="navItems" />
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

  .side-menu-logo-img {
      object-fit: contain;
      height: 21px;
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
