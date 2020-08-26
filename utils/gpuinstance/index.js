'use strict'

import GLSLANGModule from '@webgpu/glslang/dist/web-devel/glslang.onefile'

/**
 * @class
 * @access public
 */
export default class WebGPU {
    constructor () {
        if (!window.navigator.gpu) return Promise.reject('not support webgpu')
        const { OUTPUT_ATTACHMENT, COPY_SRC } = window.GPUTextureUsage
        this.usage = OUTPUT_ATTACHMENT || COPY_SRC // 获取图像用途
        this.encoders = {} // 编码器命名空间
        this.format = 'bgra8unorm'
    }

    /**
     * @description 初始化GPU实例  √
     * @param {object} adapterOptions GPURequestAdapterOptions
     * @param {string} adapterOptions.powerPreference powerPreference 为枚举值 low-power high-performance
     * @param {object} deviceOptions GPUObjectDescriptorBase
     * @param {string} deviceOptions.extensions extensions 只有一个值  用于指定当前绘制的扩展
     * @param {string} deviceOptions.limits limits 则有一堆选项 规定了获取到的设备的能力上限
     */
    init = async (adapterOptions = {}, deviceOptions = {}) => {
        /* 获取GPU */
        const { gpu } = window.navigator
        const { powerPreference = 'high-performance' } = adapterOptions
        // const { extensions = 'anisotropic-filtering' } = deviceOptions

        this.GLSLANG = await GLSLANGModule();
        /* 获取 Adapter(适配器物理实例) 和 Device(适配器逻辑实例) 以初始化 WebGPU */
        this.adapter = await gpu.requestAdapter({ powerPreference })
        this.device = await this.adapter.requestDevice() // { extensions }
    }

    /**
     * @description 获取 SwapChain 交换链  √
     * @description用于后续向 canvas 输送绘制完毕的图像
     */
    initSwapChain = async context => {
        const { device, usage } = this
        this.format = await context.getSwapChainPreferredFormat(device) // 获取设备支持的图像渲染格式
        this.swapChain = context.configureSwapChain({ device, usage, format: this.format }) // 获取交换链
    }

    /**
     * @description 创建编码区 √
     * @param {string} name 编码区名称
     * @param {object} params  
     */
    createRenderPass = (name, { color }) => {
        if (this.encoders[name]) Promise.reject('编码区已存在')
        /* 创建指令编码器 用来编码向gpu发送的command */
        const commandEncoder = this.device.createCommandEncoder()
        
        /* 创建渲染通道 */
        // const storeOp = {} // 决定渲染后怎样处理attachment中的数据
        const loadValue = color || { r: 0.0, g: 0.0, b: 0.0, a: 1.0 } // 决定渲染前怎样处理attachment中的数据
        const attachment = this.swapChain.getCurrentTexture().createView() // 开辟当前通道渲染的图像数据的存储空间
        const colorAttachments = [{ attachment, loadValue }] // 当前渲染通道的数组，用于储存（或者临时储存）图像信息
        // const depthStencilAttachment = {} // 附加在当前渲染通道用于储存渲染通道的深度信息和模板信息的附件
        const renderPassEncoder = commandEncoder.beginRenderPass({ colorAttachments }) // 开启一个新的渲染通道

        this.encoders[name] = { renderPassEncoder, commandEncoder }
    }

    createRenderPipeline = (name, { width, height, fxCode, vxCode }) => {
        const { VERTEX } = window.GPUShaderStage
        const { renderPassEncoder } = this.encoders[name]
        
        const fxModule = this.device.createShaderModule({ code: this.GLSLANG.compileGLSL(fxCode, 'fragment'), source: fxCode })
        const vxModule = this.device.createShaderModule({ code: this.GLSLANG.compileGLSL(vxCode, 'vertex'), source: vxCode })
        
        // 设置顶点位置数组和顶点索引数组的信息，以便 GPU 顶点着色器可以正确识别它们
        const vertexBuffers = [{ arrayStride: 4 * 3, attributes: [{ shaderLocation: 0, offset: 0, format: 'float3' }] }]
        // 设置透视矩阵和模型视图矩阵的数组信息，以便 GPU 顶点着色器可以正确识别它们 
        // 把资源从 CPU 端向 GPU 端输送(就是从 JavaScript 向 GLSL 4.5 输送) 
        const uniformGroupLayout = this.device.createBindGroupLayout({ entries: [{ binding: 0, visibility: VERTEX, type: 'uniform-buffer' }] })
        this.encoders[name].uniformGroupLayout = uniformGroupLayout

        /* 创建渲染管线 */
        const primitiveTopology = 'triangle-list' // 指定绘制模式
        const colorStates = [ { format: this.format } ]// 指定输出图像的处理格式
        const vertexStage = { module: vxModule, entryPoint: 'main' } // 编译顶点着色器代码
        const fragmentStage = { module: fxModule, entryPoint: 'main' } // 编译片元着色器代码 || 像素着色器
        const vertexState = { indexFormat: 'uint32', vertexBuffers } // 设定用于顶点缓存的一些描述信息，例如格式、长度、位移
        const layout = this.device.createPipelineLayout({ bindGroupLayouts: [ uniformGroupLayout ] }) // 将 CPU(JavaScript) 端的资源，绑定到 GPU 端
        
        const renderPipeline = this.device.createRenderPipeline({ colorStates, vertexStage, fragmentStage, primitiveTopology, vertexState, layout })

        /* 为创建好的渲染通道设置渲染管线 */
        renderPassEncoder.setPipeline(renderPipeline)
        /* 设置这个渲染通道的视口 */
        renderPassEncoder.setViewport(0, 0, width, height, 0, 1) // x, y, width, height, minDepth, maxDepth 深度值
    }

    /**
     * 
     * @param {string} name 编码器名称
     * @param {object} ArrayList 编码数据
     */
    createGPUBuffer = async (name, ArrayList) => {
        const { VERTEX, INDEX, UNIFORM } = window.GPUBufferUsage
        const { renderPassEncoder, uniformGroupLayout } = this.encoders[name]

        const { vxArray, idxArray, mxArray } = ArrayList

        // 得到映射完毕的 GPUBuffer 之后，再将它设定到当前的渲染通道中
        const vertexBuffer = this.createDeviceBuffer(vxArray, VERTEX)
        renderPassEncoder.setVertexBuffer(0, vertexBuffer)

        const indexBuffer = this.createDeviceBuffer(idxArray, INDEX, true)
        renderPassEncoder.setIndexBuffer(indexBuffer)

        // 将透视矩阵和模型视图矩阵的数组设置到 GPU 缓存中
        const uniformBuffer = this.createDeviceBuffer(mxArray, UNIFORM)
        const entries = [{ binding: 0, resource: { buffer: uniformBuffer } }]
        const uniformBindGroup = this.device.createBindGroup({ layout: uniformGroupLayout, entries })

        renderPassEncoder.setBindGroup(0, uniformBindGroup)
    }

    /**
     * 绘制并呈现当前画面
     * @param {*} name 
     * @param {*} count 
     */
    drawNaturePresent = async (name, count) => {
        const { renderPassEncoder, commandEncoder } = this.encoders[name]
        // 使用渲染通道 drawIndexed() 接口来绘制图形
        renderPassEncoder.drawIndexed(count, 1, 0, 0, 0);
        renderPassEncoder.endPass();
        // 呈现绘制的内容
        this.device.defaultQueue.submit([ commandEncoder.finish() ])
    }

    /**
     * 创建GPUBuffer
     * @param {*} $array 坐标数组
     * @param {*} $usage 
     * @param {*} $uint32 是否使用unit32构建 
     */
    createDeviceBuffer = ($array, $usage, $uint32) => {
        if (!($array instanceof Array)) return Promise.reject('TypedArray have to be array')
        const datasource = $array.reduce((response, current) => {
            if (!(current instanceof Array)) return [ ...response, current ]
            else return [ ...response, ...current ]
        }, [])
        
        const $source = $uint32 ? new Uint32Array(datasource) : new Float32Array(datasource)
        const { byteLength: size } = $source
        const usage = $usage || this.usage
        
        /* 使用 GPU 设备创建了一个GPU缓存用于储存顶点坐标位置 */
        const $buffer = this.device.createBuffer({ size, usage, mappedAtCreation: true })
        // this.device.defaultQueue.writeBuffer($buffer, 0, $source)
        /* 使用类型化数组和 ArrayBuffer 的一系列操作，将传入的数据绑定到这个映射缓存的 CPU 部分 */
        new $source.constructor($buffer.getMappedRange()).set($source, 0)
        $buffer.unmap() // 关闭映射操作
        return $buffer
    }
}