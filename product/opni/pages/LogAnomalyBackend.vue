<script>
import Main from '../components/Main';
import LogAnomalyBackend from '../components/LogAnomalyBackend';

export default {
  components: { LogAnomalyBackend, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Log Anomaly' };
  }
};
</script>
<template>
  <Main>
    <LogAnomalyBackend />
  </Main>
</template>
