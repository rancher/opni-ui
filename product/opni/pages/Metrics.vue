<script>
import Main from '../components/Main';
import Metrics from '../components/Metrics';

export default {
  components: { Metrics, Main },
  layout:     'standalone'
};
</script>
<template>
  <Main>
    <Metrics />
  </Main>
</template>
