const { override, fixBabelImports, addLessLoader, addWebpackAlias ,addWebpackExternals} = require('customize-cra');
const path = require('path');
module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: require('./less'),
  }),
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src'),
  }),
  addWebpackExternals({
    "axios": "axios",
    "qs": "Qs",
  })
);
