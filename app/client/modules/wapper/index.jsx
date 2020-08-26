'use strict'

import React, { PureComponent, Fragment } from 'react';
import { Menus } from '@componets';

/**
 * @author mango
 * @version 0.0.1
 * @extends { PureComponent }
 * @description application home page
 */

export default class HomePage extends PureComponent {
    constructor(props) {
        super(props)
    }

    componentDidMount () {
        this.init()
    }

    init = async () => {
    }

    render () {
        const { children } = this.props
        return (
            <Fragment>
                <header>
                    {/* <Menus>
                        <Menus.MenuItem>111</Menus.MenuItem>
                    </Menus> */}
                </header>
                {children}
                <footer></footer>
            </Fragment>
        )
    }
}