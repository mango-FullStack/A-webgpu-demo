/* eslint valid-jsdoc: "off" */

'use strict';

const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => ({
    myAppName: 'mangoui',
    keys: appInfo.name + '_1597803935102_2391',
    view: {
        defaultViewEngine: 'nunjucks',
        // 如果还有其他模板引擎，需要合并多个目录
        root: path.join(appInfo.baseDir, 'app/assets'),
    },
})