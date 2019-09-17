import React, { Fragment } from 'react';
import spinner from '../../img/spinner.png';

export default () => (
    <Fragment>
        <img 
            src={spinner}
            style={{widtch:'200px', margin: 'auto', display: 'block'}}
            alt='Loading......'
        />
    </Fragment>
)