'use strict';

const webpack = require("webpack");
const { resolve } = require('path');

module.exports = {
    mode: 'development',
    entry: './app/client/app.jsx',
    output: {
        filename: 'app.js',
        path: resolve(__dirname, 'app/public')
    },
    devServer: {
        hot: true,
        port: 9000,
        compress: true,
        contentBase: resolve(__dirname, 'app/public'),
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        rules: [{
            test: /\.j(s|sx)$/,
            exclude: /node_modules/,
            use: [ 'babel-loader' ]
        }, {
            test: /\.(sa|sc|c)ss$/, // 可以打包后缀为sass/scss/css的文件
            use:[ 'style-loader', 'css-loader', 'sass-loader' ]
            // use: [ MiniCssExtract.loader, 'css-loader', 'sass-loader' ]
        }]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', 'config.js', '.json'],
        alias: {
            '@app': resolve(__dirname, './app'),
            '@utils': resolve(__dirname, './utils'),
            '@root': resolve(__dirname, './app/client'),
            '@styles': resolve(__dirname, './app/client/styles'),
            '@stream': resolve(__dirname, './app/client/stream/index.js'),
            '@modules': resolve(__dirname, './app/client/modules/index.js'),
            '@componets': resolve(__dirname, './app/client/componets/index.js'),
        }
    }
}