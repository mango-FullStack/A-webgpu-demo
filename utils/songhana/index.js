'use strict'

import React, { Component, PureComponent } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactRouters from './assets/reactrouters';
import createstore from './assets/createstore';
import { Provider } from 'react-redux';

const reference = {}

const babydva = (options, demand) => Wrapped => class extends Component {
    constructor(props) {
        super(props)
        reference.initialdata = props
        this.store = createstore(options).store
    }

    render() {
        const { dispatch, getState } = this.store // replaceReducer, subscribe
        const porps = { dispatch, ...(demand instanceof Function ? demand(getState()) : {}) }
        return (
            <BrowserRouter>
            <Provider store={this.store}>
                <Wrapped {...porps}/>
            </Provider>
            </BrowserRouter>
        )
    }
}

const initialdata = Wrapped => class extends PureComponent {
    render () {
        const { initialdata = {} } = reference
        return <Wrapped {...initialdata} {...this.props}/>
    }
}

export default babydva;
export { initialdata, ReactRouters };
export { connect } from 'react-redux';
export { Switch, withRouter, Redirect } from 'react-router-dom';