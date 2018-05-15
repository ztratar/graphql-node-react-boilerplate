import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import logo from '../../assets/images/logo.svg';
import logoIcon from '../../assets/images/logoIcon.svg';

import style from './index.css';

const logoTypeMap = {
  'logo': logo,
  'logoIcon': logoIcon
};

@withStyles(style)
export class Logo extends PureComponent {
  static defaultProps = {
    lightTheme: false
  };

  render () {
    this.type = this.props.type || 'logo';

    return (
      <div
        className={classNames(this.props.className, this.props.lightTheme ? style.lightLogo : '')}
        dangerouslySetInnerHTML={{__html: logoTypeMap[this.type]}}/>
    );
  }
}

export default Logo;
