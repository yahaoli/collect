<template>
  <div >
    <template v-for="(item) in menuList" :index="item.path">
      <el-submenu v-if="item.children&&item.children.length"  :key="item.path">
          <template  slot="title"><span>{{item.title}}</span></template>
          <template v-for="item1 in item.children">
            <template v-if="item1.children&&item1.children.length">
              <left :menu-list="[item1]" :key="item1.path"></left>
            </template>
            <template v-else>
              <el-menu-item :index="item1.path" :key="item1.path">{{item1.title}}</el-menu-item>
            </template>
          </template>
      </el-submenu>
      <template v-else>
        <el-menu-item :index="item.path" :key="item.path">{{item.title}}</el-menu-item>
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
  }
}
</script>

<style scoped>

</style>
