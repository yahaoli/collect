'use strict'

process.env.BABEL_ENV = 'web'

const path = require('path')
const webpack = require('webpack')

const BabiliWebpackPlugin = require('babili-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

let webConfig = {
	devtool: '#cheap-module-eval-source-map',
	entry: {
		web: path.join(__dirname, '../src/renderer/main.js')
	},
	module: {
		rules: [
			{
				test: /\.html|tpl|xtpl$/,
				loader: "html-loader",
				query: {
					minimize: true
				}
			},
			{
				test : /\.sass|scss$/,
				loader : ExtractTextPlugin.extract({
					fallback: "style-loader",
					use : ["css-loader","sass-loader"]
				})
			},
			{
				test : /\.less$/,
				loader : ExtractTextPlugin.extract({
					fallback: "style-loader",
					use : ["css-loader","less-loader"]
				})
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: 'css-loader'
				})
			},
			{
				test: /\.html$/,
				use: 'vue-html-loader'
			},
			{
				test: /\.js$/,
				use: 'babel-loader',
				include: [path.resolve(__dirname, '../src/renderer')],
				exclude: /node_modules/
			},
			{
				test: /\.vue$/,
				use: {
					loader: 'vue-loader',
					options: {
						extractCSS: true,
						loaders: {
							sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
							scss: 'vue-style-loader!css-loader!sass-loader'
						}
					}
				}
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				use: {
					loader: 'url-loader',
					query: {
						limit: 1,   //强制url-loader不把图片转成DataUrl base64
						name: 'imgs/[name].[ext]'
					}
				}
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				use: {
					loader: 'url-loader',
					query: {
						limit: 10000,
						name: 'fonts/[name].[ext]'
					}
				}
			}
		]
	},
	plugins: [
		new ExtractTextPlugin('styles.css'),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: path.resolve(__dirname, '../src/index.ejs'),
			minify: {
				collapseWhitespace: true,
				removeAttributeQuotes: true,
				removeComments: true
			},
			nodeModules: false
		}),
		new webpack.DefinePlugin({
			'process.env.IS_WEB': 'true'
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin()
	],
	output: {
		filename: '[name].js',
		path: path.join(__dirname, '../dist/web')
	},
	resolve: {
		alias: {
			'@': path.join(__dirname, '../src/renderer'),
			'vue$': 'vue/dist/vue.esm.js'
		},
		extensions: ['.js', '.vue', '.json', '.css']
	},
	target: 'web'
}

/**
 * Adjust webConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
	webConfig.devtool = ''

	webConfig.plugins.push(
		new BabiliWebpackPlugin(),
		new CopyWebpackPlugin([
			{
				from: path.join(__dirname, '../static'),
				to: path.join(__dirname, '../dist/web/static'),
				ignore: ['.*']
			}
		]),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		})
	)
}

webConfig.plugins.push(
	new webpack.DefinePlugin({
		'process.env.ORIGIN' : "'" + process.env.ORIGIN +"'"
	})
)
webConfig.plugins.push(
	new webpack.DefinePlugin({
		'process.env.DEPLOY_ENV' : "'" + process.env.DEPLOY_ENV +"'"
	})
)

module.exports = webConfig
