<script>
import Main from '../components/Main';
import Cluster from '../components/Cluster';

export default {
  components: { Cluster, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Cluster' };
  }
};
</script>
<template>
  <Main>
    <Cluster />
  </Main>
</template>
