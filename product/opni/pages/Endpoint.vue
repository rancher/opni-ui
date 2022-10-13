<script>
import Main from '../components/Main';
import Endpoint from '../components/Endpoint';

export default {
  components: { Endpoint, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Endpoint' };
  }
};
</script>
<template>
  <Main>
    <Endpoint />
  </Main>
</template>
