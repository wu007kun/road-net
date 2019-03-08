<template>
  <div id="app">
    <PageHeader/>
    <router-view class="page-content"/>
  </div>
</template>
<script>
import PageHeader from '@/components/PageHeader'
export default {
  name: 'app',
  components: {
    PageHeader
  }
}
</script>

<style lang="less">
@import url('~@/style/form.less');
* {
  margin: 0; padding: 0;
}
html, body {
  height: 100%;
}
li {
  list-style: none;
}
#app {
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 14px;
  .page-content {
    height: calc(100% - 50px);
  }
}
.icon {
  width: 1em; height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
