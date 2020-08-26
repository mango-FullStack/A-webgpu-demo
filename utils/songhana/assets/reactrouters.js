'use strict';

import React, { PureComponent } from 'react';
import { Route, Redirect } from 'react-router-dom';

/**
 * @name Routers
 * @author mango
 * @version 0.0.1
 * @extends { PureComponent }
 * @description 路由配置迭代器
 */
export default class Routers extends PureComponent {
    constructor (props) {
        super(props)
    }

    renderwapper = ($props, { name, component: Wapper, children }) => {
        const { computedMatch } = this.props
        const props = { computedMatch, routes: children, routetitle: name }
        return <Wapper {...$props} {...props}/>
    }

    /**
     * @memberof router
     * @returns {ReactDOM} 
     * @param {string} option.key 
     * @param {string} option.name 路由名称
     * @param {string} option.path 路由相对路径
     * @param {boolean} option.exact 是否绝对匹配
     * @param {object} option.routes 子路由列表
     * @param {ReactDOM} option.component 子路由对应组件
     */
    routerconfig = current => {
        const { name, menu, component, routes: children, ...others } = current
        if (!others.key) return console.warn(`router ${name} need key`)
        const renderparam = { name, component, children }

        if (!component) return <Redirect to='/error/404'/>
        if (typeof component === 'string') return <Route {...others}>{component}</Route>
        return <Route {...others} render={props => this.renderwapper(props, renderparam)}/>
    }
    
    render () {
        const { routes } = this.props
        return routes.map(this.routerconfig)
    }
}