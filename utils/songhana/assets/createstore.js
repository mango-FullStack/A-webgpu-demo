'use strict'

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { takeEvery, put, call, fork, select, take, cancel } from 'redux-saga/effects';
import createMiddlewares from './middlewares';
import createSaga from 'redux-saga';

// TODO subscriptions.js
const createReducer = (stream = []) => {
    const reslut = {}
    
    stream.forEach(iterator => {
        const { namespace, reducers, state: initialState } = iterator
        reslut[namespace] = (state = {}, payload = {}) => {
            const { type } = payload 
            
            if (type.startsWith("@@redux")) return initialState
            if (!type.endsWith("@@reducers")) return state
            // console.warn('Please use "put" in "effects" to call "reducers" or add "/@@reducer" to the end of "type"')

            const array = type.split('/')
            const [ _namespace, _type ] = array 

            if (_namespace !== namespace) return state
            if (!(reducers[_type] instanceof Function)) return state

            const updatastate = reducers[_type](state, payload) || {}
            return { ...initialState, ...state, ...updatastate }
        }
    })
    
    return combineReducers({ ...reslut })
}

const createEffects = (stream = []) => {
    return function* () {
        // yield call(function* () { console.log('我是阻塞的') });
        // const task = yield fork(function* () { console.log('我是非阻塞的') });
        // 这样可以拿到结果: task.done().then(res => res)
        // 请使用try catch包裹effects

        for (const iterator of stream) {
            const { namespace, effects = {} } = iterator

            const _put = params => put({...params, type: `${namespace}/${params.type}/@@reducers`})
            const personal = params => put({...params, type: `${namespace}/${params.type}`})

            for (const key in effects) {
                const element = effects[key]
                const effectoptions = { call, put: _put, select, fork, take, cancel, personal }
                const generator = function * ({ $$resolve, $$reject, ...action}) { return $$resolve(yield element(action, effectoptions)) }
                yield takeEvery(`${namespace}/${key}`, generator) // watcher saga 监听 dispatch 传过来的 action
            }
        }
    }
}

export default function create(opts = {}) {
    const app = {}
    const { stream, preloadedState } = opts

    const saga = createSaga()
    const middlewares = createMiddlewares(stream)
    const enhancer = applyMiddleware(...middlewares, saga); // 注入 middleware

    app.store = createStore(createReducer(stream), preloadedState, enhancer) // app.store = {subscribe, ...props}
    saga.run(createEffects(stream))

    return app
}