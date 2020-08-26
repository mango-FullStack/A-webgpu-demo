'use strict'

/* eslint-disable */
module.exports = {
    'presets': ['@babel/preset-env', '@babel/preset-react'],
    'plugins': [
        ['@babel/plugin-proposal-decorators', { 'legacy': true }], // 装饰器语法
        ['@babel/plugin-proposal-class-properties', { 'loose': true }], // async 语法
        '@babel/plugin-transform-runtime', // 
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-object-rest-spread'
    ]
}
/* eslint-disable */