<script>
import Main from '../components/Main';
import Configuration from '../components/Configuration';

export default {
  components: { Configuration, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Configuration' };
  }
};
</script>
<template>
  <Main>
    <Configuration />
  </Main>
</template>
