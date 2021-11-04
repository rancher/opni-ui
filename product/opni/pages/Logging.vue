<script>
import Main from '../components/Main';
import Logging from '../components/Logging';

export default {
  components: { Logging, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Overview' };
  }
};
</script>
<template>
  <Main>
    <Logging />
  </Main>
</template>
