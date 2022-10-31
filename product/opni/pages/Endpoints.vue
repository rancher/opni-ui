<script>
import Main from '../components/Main';
import Endpoints from '../components/Endpoints';

export default {
  components: { Endpoints, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Endpoints' };
  }
};
</script>
<template>
  <Main>
    <Endpoints />
  </Main>
</template>
