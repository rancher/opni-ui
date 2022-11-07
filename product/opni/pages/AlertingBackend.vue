<script>
import Main from '../components/Main';
import AlertingBackend from '../components/AlertingBackend';

export default {
  components: { AlertingBackend, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Alerting' };
  }
};
</script>
<template>
  <Main>
    <AlertingBackend />
  </Main>
</template>
