import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

import feed from '../../assets/images/icons/feed.svg';
import hamburger from '../../assets/images/icons/hamburger.svg';

const svgIconMap = {
  'feed': feed,
  'hamburger': hamburger
};

@withStyles(style)
export class Icon extends PureComponent {

  static propTypes = {
    size: React.PropTypes.oneOf([
      '',
      'tn',
      'sm',
      'md',
      'lg',
      'vlg'
    ]),
    src: React.PropTypes.any,
    color: React.PropTypes.oneOf([
      '',
      'slate',
      'white',
      'blue',
      'green',
      'red',
      'orange',
      'pink'
    ]),
    outlined: React.PropTypes.bool,
    className: React.PropTypes.string
  };

  static defaultProps = {
    size: '',
    color: '',
    outlined: false,
    className: ''
  };

  constructor (props, context) {
    super(props, context);
  }

  render () {
    const {
      outlined,
      size,
      color,
      className,
      ...rest
    } = this.props;

    let { src } = this.props;

    if (!isNaN(src)) {
      src = Number(src);
    }

    return (
      <span className={classNames(
        style.icon,
        outlined ? style['outlined-'+size] : '',
        size ? style['size-'+size] : '',
        color ? style['color-'+color] : '',
        className
      )} {...rest}>
        {typeof src === 'number' ?
        <i className='icon'>{String.fromCharCode(src)}</i>
        :
        <span className={classNames('icon', style.svgIcon)} dangerouslySetInnerHTML={{__html: svgIconMap[src]}}/>
        }
      </span>
    );
  }
}

export default Icon;
