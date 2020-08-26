'use strict'

import React, { PureComponent } from 'react';

class MenuItem extends PureComponent {
    constructor(props) {
        super(props)
    }

    render () {
        const { children } = this.props
        return <li>{children}</li>
    }
}

export default class Menus extends PureComponent {
    static MenuItem = MenuItem

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
            <nav>
                <ul>
                    {children}
                </ul>
            </nav>
        )
    }
}