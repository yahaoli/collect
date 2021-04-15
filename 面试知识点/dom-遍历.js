/* *
树结构遍历
 */
let tree = [
  {
    name: "1",
    child: [
      {
        name: "1-1",
        child: [{
          name: "1-1-1"
        }]
      },
      {
        name: "1-2",
        child: [{
          name: "1-2-1"
        }]
      }
    ]
  },
  {
    name: "2",
    child: [{
      name: "2-1",
      child: [{
        name: "2-1-1"
      }]
    }]
  }
];

// 广度遍历
function tree_1(treeData) {
  let name = [];
  let fn = (data) => {
    let child = [];
    data.forEach(item => {
      name.push(item.name);
      item.child && (child = child.concat(item.child));
    });
    child.length && fn(child);
  };
  fn(treeData);
  return name.join(",");
}

// 深度遍历
function tree_2(treeData) {
  let name = [];
  let fn = (data) => {
    data.forEach(item => {
      name.push(item.name);
      item.child && fn(item.child);
    });
  };
  fn(treeData);
  return name.join(",");
}

console.log(tree_1(tree));
console.log(tree_2(tree));