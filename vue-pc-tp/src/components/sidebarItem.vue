<template>
  <div >
    <template v-for="(item) in menuList">
      <el-submenu v-if="item.children&&item.children.length" :key="item.path" :index="item.path">
        <template slot="title"><span>{{getTitle(item)}}</span></template>
        <sidebar-item :menu-list="item.children"></sidebar-item>
      </el-submenu>
      <template v-else>
        <el-menu-item :index="item.path" :key="item.path">{{getTitle(item)}}</el-menu-item>
      </template>
    </template>
  </div>
</template>

<script>
export default {
  name: 'sidebarItem',
  props: {
    menuList: {
      type: Array,
      required: true
    }
  },
  methods:{
    getTitle(item1){
      return item1.meta?item1.meta.title:''
    }
  }
}
</script>

<style scoped>

</style>
