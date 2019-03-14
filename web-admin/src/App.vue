<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
  .tree-list>div{
    float: left;
  }
  .span-right span{
    margin-right: 10px;
  }
  .el-upload-list--picture li{
    width: auto;
    display: inline-block;
  }
#app {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
  font-size: 16px;
  box-sizing: border-box ;
}
html,body,div,section,p,h1,h2,h3,h4,ul,li{margin: 0;padding: 0}
.admin-span>span{
  margin-left: 10px;
}
p{
  margin: 10px 0;
}
h4{
  font-size: 16px;
  color: black;
  padding: 10px 0;
}
.font-size12{
  font-size: 14px;
}
.admin-p{
  margin-top: 10px;
  color: #606266;
}
.imgList{
  max-height: 200px;
}
  .admin-align{
    vertical-align: middle;
  }
  .fontBlue{
    color: #169BD5;
  }
  .elePointer{
    cursor: pointer;
  }
  .input-init{
    width: 200px;
    display: inline-block;
    vertical-align: middle;
  }
  .admin-btn-set{
    font-size: 12px;
    color: #409EFF;
    cursor: pointer;
  }
  .clear:after {
    content: ".";
    clear: both;
    display: block;
    height: 0;
    overflow: hidden;
    visibility: hidden;
  }
  .list-head{
    border: 1px solid #c0c4cc;
    padding: 10px 10px;
  }
  .list-head:not(:first-child){
    border-top:none ;
  }
</style>
