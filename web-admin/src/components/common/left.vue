<template>
  <div >
    <el-submenu  v-for="(item) in menuList" :index="item.index" :key="item.index">
      <template  slot="title"><span>{{item.name}}</span></template>
      <template  v-if="item.child&&item.child.length">
        <template v-for="(item1,index) in item.child">
          <template v-if="item1.child&&item1.child.length">
            <left :menu-list="[item1]" :key="index"></left>
          </template>
          <template v-else>
            <el-menu-item :index="item1.route" :key="item1.route">{{item1.name}}</el-menu-item>
          </template>
        </template>
      </template>
      <template v-else>
        <el-menu-item :index="item.route" :key="item.route">{{item.name}}</el-menu-item>
      </template>
    </el-submenu>
  </div>
</template>

<script>
export default {
  name: 'left',
  props: {
    menuList: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>

</style>
