'use strict'

import React, { PureComponent } from 'react';
import { CanvasHD } from '@componets';
import { PerspectiveCamera, Matrix4, Vector3 } from 'three';
import GPUinstance from '@utils/gpuinstance';
import fxCode from './shader/fragment.glsl.js';
import vxCode from './shader/vertex.glsl.js';
import metryattributes from './attributes/planegeometry.json';


export default class GPUDEMO extends PureComponent {
    state = {
    }

    constructor (props) {
        super(props)
    }

    init = async instance => {
        this.canvas = instance()
        const { ratio, width, height, context, orgin } = this.canvas
        this.camera = new PerspectiveCamera(45, width / height, 0.1, 100)
        
        if (!context) return console.error('Your browser seems not support WebGPU!')
        console.info(`Congratulations! You've got a WebGPU context!`) // 检查浏览器是否支持 WebGPU
        
        const { projectionMatrix: pMatrix } = this.camera
        const { triangleVertex, squareVertex } = metryattributes

        const triangleIndex = [ 0, 1, 2 ]
        const triangleMVMatrix = new Matrix4().makeTranslation(-1.5, 0.0, -7.0)
        const squareIndex = [ 0, 1, 2, 1, 2, 3 ]
        const squareMVMatrix = new Matrix4().makeTranslation(1.5, 0.0, -7.0)

        const backgroundColor = { r: 0.25, g: 0.5, b: 1, a: 1.0 }
        const triangleUniformBufferView = (pMatrix.toArray().concat(triangleMVMatrix.toArray()))
        const squareUniformBufferView = (pMatrix.toArray().concat(squareMVMatrix.toArray()))

        this.instance = new GPUinstance()
        await this.instance.init()
        await this.instance.initSwapChain(context)
        
        this.instance.createRenderPass('square', { color: backgroundColor })
        this.instance.createRenderPipeline('square', { width, height, fxCode, vxCode })

        const $triangle = { vxArray: triangleVertex, idxArray: triangleIndex, mxArray: triangleUniformBufferView }
        const $square = { vxArray: squareVertex, idxArray: squareIndex, mxArray: squareUniformBufferView  }

        /* 顶点着色器, 读取从 CPU 传入的顶点位置数组和顶点索引数组, 读取从 CPU 传入的透视矩阵和模型视图矩阵, 计算结果，得出三角形和方块的每个顶点的最终位置 */
        /* 片元着色器 按照绘制模式进行绘制，並填充白色  */
        await this.instance.createGPUBuffer('square', $triangle)
        await this.instance.drawNaturePresent('square', triangleIndex.length)
    }

    render () {
        return <CanvasHD type='gpupresent' oninit={this.init}/>
    }
}