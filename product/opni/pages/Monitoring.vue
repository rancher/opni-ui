<script>
import Main from '../components/Main';
import Monitoring from '../components/Monitoring';

export default {
  components: { Monitoring, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Monitoring' };
  }
};
</script>
<template>
  <Main>
    <Monitoring />
  </Main>
</template>
