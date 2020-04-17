<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
  //重置element-ui
  .el-pagination {
    text-align: center;
    margin-top: 20px;
  }
  /*fade-transform*/
  .fade-transform-leave-active,
  .fade-transform-enter-active {
    transition: all .5s;
  }
  .fade-transform-enter {
    opacity: 0;
    transform: translateX(-30px);
  }
  .fade-transform-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
</style>
