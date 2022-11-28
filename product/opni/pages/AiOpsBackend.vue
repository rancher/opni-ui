<script>
import Main from '../components/Main';
import AiOpsBackend from '../components/AiOpsBackend';

export default {
  components: { AiOpsBackend, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - AI Ops' };
  }
};
</script>
<template>
  <Main>
    <AiOpsBackend />
  </Main>
</template>
