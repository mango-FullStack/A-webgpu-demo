'use strict'

export default {
    namespace: 'initprops',
    state: {
    },
    reducers: {
        update (state, action) {
            const { payload } = action
            return { ...state, ...payload };
        }
    },
    effects: {
        * update ({ payload }, { put }) {
            yield put({ type: 'update', payload })
        }
    },
}