<script>
import Main from '../components/Main';
import LoggingBackend from '../components/LoggingBackend';

export default {
  components: { LoggingBackend, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Logging' };
  }
};
</script>
<template>
  <Main>
    <LoggingBackend />
  </Main>
</template>
