<script>
import Main from '../components/Main';
import Roles from '../components/Roles';

export default {
  components: { Roles, Main },
  layout:     'standalone',
  head() {
    return { title: 'Opni - Roles' };
  }
};
</script>
<template>
  <Main>
    <Roles />
  </Main>
</template>
