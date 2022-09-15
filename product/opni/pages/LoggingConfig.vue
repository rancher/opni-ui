<script>
import Main from '../components/Main';
import LoggingConfig from '../components/LoggingConfig';

export default {
  components: { LoggingConfig, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Logging' };
  }
};
</script>
<template>
  <Main>
    <LoggingConfig />
  </Main>
</template>
