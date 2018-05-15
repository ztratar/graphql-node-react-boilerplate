import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import PureComponent from 'components/common/pure';
import withStyles from 'isomorph-style-loader/lib/withStyles';

import style from './index.css';

@withStyles(style)
export default class ReadMoreText extends PureComponent {
  static propTypes = {
    maxLength: PropTypes.number,
    text: PropTypes.string
  };

  static defaultProps = {
    maxLength: 300,
    text: ''
  };

  constructor (props, context) {
    super(props, context);

    this.state = { expanded: false };
  }

  @autobind
  _onClickReadMore () {
    this.setState({ expanded: true });
  }

  render () {
    const { maxLength, text } = this.props;
    const { expanded } = this.state;

    const isContentCutOff = text.length > maxLength;

    let renderContent = isContentCutOff && !expanded ? text.slice(0, maxLength - 3).trim() : text;

    return (
      <span>
        {renderContent}
        {isContentCutOff && !expanded ? <a href='#' className={style.readMore} onClick={this._onClickReadMore}>... read more</a> : null}
      </span>
    );
  }
}
