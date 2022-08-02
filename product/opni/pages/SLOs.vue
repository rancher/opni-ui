<script>
import Main from '../components/Main';
import SLOs from '../components/SLOs';

export default {
  components: { SLOs, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - SLOs' };
  }
};
</script>
<template>
  <Main>
    <SLOs />
  </Main>
</template>
