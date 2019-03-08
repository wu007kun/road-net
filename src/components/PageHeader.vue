<template>
  <div class="page-header">
    <router-link class="link" to="/app-list">项目列表</router-link>
    <router-link class="link" to="/adjust">图层校准</router-link>
    <router-link class="link" to="/road-net">路网设置</router-link>
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
  display: flex;
  align-items: center;
  .link {
    margin: 0 10px;
    height: 24px;
    line-height: 24px;
    color: #fcfcfc;
    text-decoration: none;
    font-size: 16px;
    border-bottom: 2px solid transparent;
  }
  .router-link-active {
    border-bottom: 2px solid #fff;
    color: #fff;
    font-weight: 600;
  }
}
</style>
