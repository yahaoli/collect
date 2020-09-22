<script>
  export default {
    name: "sidebarItem",
    props: {
      menuList: {
        type: Array,
        required: true
      },
      baseUrl: {
        type: String,
        default: ""
      }
    },
    methods: {},
    render(createElement) {
      let menuList = this.menuList;
      let baseUrl = this.baseUrl;
      let getFullPath = (path) => {
        return baseUrl ? baseUrl + "/" + path : path;
      };
      let getTitle = (item) => {
        return (item.meta || {}).title;
      };
      return createElement("div", menuList.map((item) => {
        let onlyOneChild, moreChild;
        if (!item.children && !item.menuHidden) {
          onlyOneChild = {
            title: getTitle(item),
            path: item.path
          };
        } else if (!item.menuHidden && item.children && item.children.length) {
          let current = item.children.filter(route => route.menuHidden === void 0);
          if (current.length === 1) {
            let currentPath = current[0].path;
            let fullPath = currentPath ? item.path + "/" + currentPath : item.path;
            onlyOneChild = {
              title: getTitle(current[0]),
              path: fullPath
            };
          } else {
            moreChild = {
              title: getTitle(item),
              children: current,
              path: item.path
            };
          }
        }
        if (onlyOneChild) {
          return createElement("el-menu-item", {
            props: {
              index: getFullPath(onlyOneChild.path)
            },
            key: getFullPath(onlyOneChild.path)
          }, onlyOneChild.title);
        } else if (moreChild) {
          return createElement("el-submenu", {
            props: {
              index: getFullPath(moreChild.path)
            },
            key: getFullPath(moreChild.path)
          }, [
            createElement("span", {slot: "title"}, moreChild.title),
            createElement("sidebar-item", {
              props: {
                baseUrl: moreChild.path,
                menuList: moreChild.children
              }
            })
          ]);
        }
      }));
    }
  };
</script>

<style>

</style>
