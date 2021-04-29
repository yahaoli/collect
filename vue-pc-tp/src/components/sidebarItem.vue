<script>
export default {
  name: "sidebarItem",
  props: {
    menuList: {
      type: Array,
      required: true,
    },
    collapse: {
      type: Boolean,
      default: false,
      required: true,
    },
    baseUrl: {
      type: String,
      default: "",
    },
  },
  methods: {},
  render(createElement) {
    let getFullPath = (baseUrl, path) => {
      return baseUrl ? baseUrl + "/" + path : path;
    };
    let getTitle = (item) => {
      return (item.meta || {}).title;
    };
    let createMenu = (menuList, baseUrl) => {
      return menuList.map((item) => {
        let onlyOneChild, moreChild;
        if (!item.children && !item.menuHidden) {
          onlyOneChild = {
            title: getTitle(item),
            path: item.path,
            icon: item.icon,
          };
        } else if (!item.menuHidden && item.children && item.children.length) {
          let current = item.children.filter(
            (route) => route.menuHidden === void 0
          );
          if (current.length === 1) {
            let currentPath = current[0].path;
            let fullPath = currentPath
              ? item.path + "/" + currentPath
              : item.path;
            onlyOneChild = {
              title: getTitle(current[0]),
              path: fullPath,
              icon: item.icon,
            };
          } else {
            moreChild = {
              title: getTitle(item),
              children: current,
              path: item.path,
              icon: item.icon,
            };
          }
        }
        if (onlyOneChild) {
          return createElement(
            "el-menu-item",
            {
              props: {
                index: getFullPath(baseUrl, onlyOneChild.path),
              },
              key: getFullPath(baseUrl, onlyOneChild.path),
            },
            [
              onlyOneChild.icon &&
                createElement("i", { class: onlyOneChild.icon }),
              createElement("span", { slot: "title" }, onlyOneChild.title),
            ]
          );
        } else if (moreChild) {
          return createElement(
            "el-submenu",
            {
              props: {
                index: getFullPath(baseUrl, moreChild.path),
              },
              key: getFullPath(baseUrl, moreChild.path),
            },
            [
              createElement("template", { slot: "title" }, [
                moreChild.icon && createElement("i", { class: moreChild.icon }),
                createElement("span", { slot: "title" }, moreChild.title),
              ]),
              createMenu(moreChild.children, moreChild.path),
            ]
          );
        }
      });
    };
    return createElement(
      "el-menu",
      {
        props: {
          collapse: this.collapse,
          backgroundColor: "rgb(48, 65, 86)",
          textColor: "#ffffff",
          activeTextColor: "rgb(64, 158, 255)",
          defaultActive: this.$route.path,
          router: true,
        },
      },
      createMenu(this.menuList, this.baseUrl)
    );
  },
};
</script>

<style></style>
