<script>
import Main from '../components/Main';
import Role from '../components/Role';

export default {
  components: { Role, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Role' };
  }
};
</script>
<template>
  <Main>
    <Role />
  </Main>
</template>
