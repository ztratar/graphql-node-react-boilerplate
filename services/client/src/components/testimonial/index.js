import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorph-style-loader/lib/withStyles';

import PureComponent from 'components/common/pure';
import Img from 'components/img';

import style from './index.css';

@withStyles(style)
export default class Testimonial extends PureComponent {
  render () {
    return (
      <div className={style.testimonial}>
        <p>{this.props.children}</p>
        <div className='imgWrap'>
          <Img src={this.props.img} />
        </div>
        <h4>{this.props.name}</h4>
        <h5>{this.props.position}</h5>
      </div>
    );
  }
}
