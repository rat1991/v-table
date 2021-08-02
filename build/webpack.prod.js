const merge = require('webpack-merge')
const common = require('./webpack.base')
const path = require('path')
// 清除dist文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
console.log('==>: VueLoaderPlugin', CleanWebpackPlugin)
// 处理、打包css文件 功能类似style-loader
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 用于压缩css文件
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
// 压缩js文件
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
module.exports = merge(common, {
    mode: 'none',
    entry: {
        'v-table': './src/index.js', // 项目的入口文件
        "v-table.min": './src/index.js'
    },
    output: {
        path: resolve('dist'),
        publicPath: '/dist/',
        filename: '[name].js',
        libraryExport: "default",
        library: "v-table",
        libraryTarget: "umd"
        //chunkFilename: path.posix.join(__dirname, '../js/[id].js')
    },
    externals: {
        vue: {
            root: 'Vue',
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue'
        }
    },
    optimization: {
        minimize: true,
        minimizer: [
            new UglifyJsPlugin({
                include: /\.min\.js$/,
            })
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        // new MiniCssExtractPlugin({
        //     filename: 'css/[name].[hash:5].css'
        // }),
        // new OptimizeCSSAssetsPlugin(),
        // new UglifyJsPlugin({
        //     uglifyOptions: {
        //         compress: {
        //             // 去除debugger和console
        //             drop_debugger: true,
        //             drop_console: true
        //         }
        //     },
        //     cache: true,
        //     parallel: true,
        //     sourceMap: false
        // })
    ]
});