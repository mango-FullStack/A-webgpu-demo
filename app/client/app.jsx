'use strict'

import React, { PureComponent, StrictMode } from 'react';
import songhana, { ReactRouters, Switch, withRouter, Redirect } from '@utils/songhana/index';
import { Wapper as PageWapper } from '@modules';
import routes from './pages/router';
import ReactDOM from 'react-dom';
import stream from '@stream';

import '@styles/reset.scss';

/**
 * @author mango
 * @version 0.0.3
 * @extends { PureComponent }
 * @description application entrit
 */

@songhana({ stream }, state => state)
@withRouter // react-router 需要放在 redux 之下
export default class App extends PureComponent {
    constructor (props) {
        super(props)
    }

    componentDidMount() {
        this.init()
    }

    init = async () => {
        console.log('======== App DidMount ========')
    }
    
    render () {
        const { location } = this.props
        return (
            <PageWapper>
            <Switch location={location}>
                <Redirect exact from='/' to='/home'/>
                <ReactRouters routes={routes}/>
            </Switch>
            </PageWapper>
        )
    }
}

ReactDOM.render(<StrictMode><App/></StrictMode>, document.getElementById('app'))