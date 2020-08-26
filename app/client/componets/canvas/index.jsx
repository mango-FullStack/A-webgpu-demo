'use strict'

import React, { PureComponent } from 'react';

export default class CanvasHD extends PureComponent {
    state = {
        ratio: 1
    }

    constructor (props) {
        super(props)
        this.canvas = React.createRef()
    }

    componentDidMount () {
        this.init()
    }

    asyncSetState = state => new Promise(res => this.setState(state, res))

    init = async () => {
        const { current } = this.canvas
        const { devicePixelRatio = 1 } = window
        const { oninit, type = '2d' } = this.props
        // 获取屏幕高清倍数
        const ratio = devicePixelRatio / this.backingstore()
        await this.asyncSetState({ ratio })
        /** @type {GPUCanvasContext} */
        this.context = current.getContext(type)
        oninit instanceof Function && oninit(this.instance)
    }

    backingstore = () => {
        const { current } = this.canvas
        // navigator.userAgent.toLowerCase(); 获取浏览器内核
        const base = 'BackingStorePixelRatio'
        const compatible = [ 'webkit', 'moz', 'ms', 'o' ]
        const { backingStorePixelRatio } = current
        if (backingStorePixelRatio) return backingStorePixelRatio
        const edition = compatible.find(v => !!current[`${v}${base}`])
        return edition ? current[`${edition}${base}`] : 1
    }

    proccesssize = () => {
        const { size } = this.props
        if (typeof size === 'string') return [ size, size ]
        if (typeof size === 'number') return [ size, size ]
        if (!(size instanceof Array)) return [ 400, 400 ]
        if (!size.length) return [ 400, 400 ]
        if (size.length >= 2) return size
        const [ value ] = size
        return [ value, value ]
    }

    instance = () => {
        const { context } = this
        const { ratio } = this.state
        const [ width, height ] = this.proccesssize()
        const orgin = { x: width / 2, y: height / 2 }
        return { ratio, width, height, context, orgin }
    }

    render () {
        const { ratio } = this.state
        const { style = {}, className } = this.props
        const [ width, height ] = this.proccesssize()
        const props = { style: { ...style, width, height }, className }
        return <canvas {...props} ref={this.canvas} width={ratio * width} height={ratio * height}/>
    }
}