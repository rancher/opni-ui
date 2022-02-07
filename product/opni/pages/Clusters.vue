<script>
import Main from '../components/Main';
import Clusters from '../components/Clusters';

export default {
  components: { Clusters, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Clusters' };
  }
};
</script>
<template>
  <Main>
    <Clusters />
  </Main>
</template>
