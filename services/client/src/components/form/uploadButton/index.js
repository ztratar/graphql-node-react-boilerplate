import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import ReactTooltip from 'react-tooltip';

import process from '../../../io/file';
import PureComponent from '../../common/pure';
import Icon from '../../icon';
import style from './index.css';
import buttonStyle from '../../buttonLink/index.css';

@withStyles(style)
@withStyles(buttonStyle)
export default class UploadButton extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    icon: PropTypes.string,
    className: PropTypes.string,
    text: PropTypes.string,
    size: PropTypes.oneOf([
      'sm',
      'md',
      'lg',
      'vlg'
    ]),
    background: PropTypes.oneOf([
      'gradientLight',
      'gradientDark',
      'gradientBlue',
      'gradientGreen',
      'light',
      'dark',
      'blue',
      'green',
      'red'
    ]),
    uppercase: PropTypes.bool,
    loading: PropTypes.bool,
    loadingText: PropTypes.string,
    tooltip: React.PropTypes.string,
    accept: PropTypes.string,
    name: PropTypes.string.isRequired
  };
  static defaultProps = {
    onChange: d => d,
    className: '',
    size: 'md',
    background: 'gradientLight',
    text: 'Upload File',
    uppercase: false,
    loading: false,
    loadingText: 'Loading...',
    tooltip: ''
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      uid: uuid.v4()
    };
  }

  @autobind
  _onChange (e) {
    this.props.onChange(e.target.files);
  }

  render () {
    let btnClass = classNames(
      'btn',
      buttonStyle[this.props.size],
      buttonStyle[this.props.background],
      this.props.uppercase ? buttonStyle.uppercase : '',
      style.uploadButton,
      this.props.className
    );

    const { uid } = this.state;

    return (
      <div className={btnClass} data-for={`upload-button-${this.props.name}`} data-tip='true'>
        {this.props.icon ? <Icon src={this.props.icon}/> : null}
        {this.props.text ? <div className={style.text}>{this.props.text}</div> : null}
        {this.props.tooltip ?
          <ReactTooltip
            id={`upload-button-${this.props.name}`}
            place='top'
            effect='solid'
          >
            {this.props.tooltip}
          </ReactTooltip>
        : null}
        <input type='file' onChange={this._onChange} accept={this.props.accept}/>
      </div>
    );
  }
}
