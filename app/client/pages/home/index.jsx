'use strict'

import React, { PureComponent } from 'react';
import { WebGPU } from '@modules';

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
        return (
            <div className='wapper-page'>
                <WebGPU></WebGPU>
            </div>
        )
    }
}