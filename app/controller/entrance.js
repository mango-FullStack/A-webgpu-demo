'use strict';

const { Controller } = require('egg')

class EntranceController extends Controller {
    async index() {
        const { ctx } = this;
        // ctx.body = 'hi, egg';
        await ctx.render('entrance.html');
    }
}

module.exports = EntranceController;