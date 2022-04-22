<script>
import Main from '../components/Main';
import Tokens from '../components/Tokens';

export default {
  components: { Tokens, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Tokens' };
  }
};
</script>
<template>
  <Main>
    <Tokens />
  </Main>
</template>
