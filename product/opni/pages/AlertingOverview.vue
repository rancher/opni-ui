<script>
import Main from '../components/Main';
import AlertingOverview from '../components/AlertingOverview';

export default {
  components: { AlertingOverview, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Alerting Overview' };
  }
};
</script>
<template>
  <Main>
    <AlertingOverview />
  </Main>
</template>
