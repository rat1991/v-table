const webpack = require('webpack')
const path = require('path')
// 用于解析vue文件
const VueLoaderPlugin  = require('vue-loader/lib/plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
module.exports = {
    module: {
      rules:[
        {
          test: /\.js$/,
          exclude: /node_modules/,
          // include: [
          //   path.resolve(__dirname, 'src')
          // ],
          use: "babel-loader"
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            'vue-style-loader',
            'style-loader',
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test:/\.(png|svg|jpg|gif)$/, // 管理图片资源
          use:[
              {
                loader:'file-loader',
                options:{
                    name:'[path][name].[ext]?[hash]', // 处理结果将保持原文件名，文件路径后添加哈希值避免缓存
                }
              },
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.vue']
    },
    plugins: [
      new VueLoaderPlugin()
    ]
}
