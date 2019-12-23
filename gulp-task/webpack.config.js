const path = require('path')
const webpackConfig= require('webpack')
let mainConfig = {
    mode: 'none',
    target: 'web',
    entry: {
        app: path.join(__dirname, './src/test.js')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, './dist/webpack')
    },
    resolve: {
        extensions: ['.js', '.json', '.node']
    },
    plugins: [
        new webpackConfig.optimize.ModuleConcatenationPlugin(),
        new webpackConfig.NamedModulesPlugin()
    ],
    //webpack 4.x 以上
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        splitChunks: {}
    }
}
webpackConfig(mainConfig, (err, stats) => {
    console.log(1111111111111111)
    console.log(err)
})
