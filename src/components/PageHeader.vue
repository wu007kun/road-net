<template>
  <div class="page-header">
    <router-link to="/app-list">app list</router-link>
    <router-link to="/adjust">adjust</router-link>
    <router-link to="/road-net">road net</router-link>
  </div>
</template>
<script>
export default {
  name: 'pageHeader'
}
</script>
<style lang="less">
.page-header {
  height: 50px;
  background-color: #42C2C2;
}
</style>
