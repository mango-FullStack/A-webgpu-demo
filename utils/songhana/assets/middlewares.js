'use strict'

function isEffect({ type }, stream) {
    if (!type) return false
    if (typeof type !== 'string') return false
    const [ space, action ] = type.split('/')
    const [ current ] = stream.filter(({namespace}) => namespace === space)
    if (!current || typeof current !== 'object') return false
    if (!current.effects || !current.effects[action] ) return false
    return true
}

// 注入promise 以使用回调获取action执行结果
const createPromise = stream => ({ getState, dispatch }) => next => action => isEffect(action, stream) ? new Promise(($$resolve, $$reject) => next({$$resolve, $$reject, ...action })) : next(action)

// 创建 saga middleware
const createMiddlewares = stream => [ createPromise(stream) ]

export default createMiddlewares