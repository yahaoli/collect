<template>
    <div class="admin-con">
        <div class='admin-head'>
            <el-dropdown class="admin-dropdown" trigger="click">
                <div class="el-dropdown-link">
                    用户<i class="el-icon-arrow-down el-icon--right"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item>退出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <div class='admin-aside'>
            <el-menu background-color="#304156"
                     text-color="#bfcbd9"
                     active-text-color="#409EFF"
                     :default-active="$route.path"
                     router>
                <sidebar-item :menuList="menuList"></sidebar-item>
            </el-menu>
        </div>
        <div class='admin-main'>
            <div class="title">{{$route.meta?$route.meta.title:""}}</div>
            <transition name="fade-transform" mode="out-in">
                <router-view/>
            </transition>

        </div>

    </div>
</template>

<script>
    import sidebarItem from "@/components/sidebarItem.vue";

    export default {
        name: "admin",
        components: {
            sidebarItem
        },
        data() {
            let routes = this.$router.options.routes, menuList = [];
            for (let i = 0; i < routes.length; i++) {
                if (routes[i].path === "/admin") {
                    menuList = routes[i].children;
                    break;
                }
            }
            return {
                menuList: menuList,
                show: true
            };
        }
    };
</script>

<style lang="scss">
    @import "index";
</style>