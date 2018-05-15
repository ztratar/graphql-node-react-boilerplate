import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import classNames from 'classnames';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import moment from 'moment';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './datepicker.css';

@withStyles(style)
export default class DatePicker extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
    className: PropTypes.string,
    size: PropTypes.oneOf([
      'sm',
      'md',
      'lg',
      'vlg'
    ]),
    background: PropTypes.oneOf([
      'white',
      'greyLightest'
    ])
  };
  static defaultProps = {
    onChange: d => d,
    value: '',
    className: '',
    size: 'md',
    background: 'white'
  };

  constructor (props, context) {
    super(props, context);
  }

  @autobind
  _onChange (newVal) {
    console.log(newVal);

    this.props.onChange(newVal);
  }

  render () {
    const dateVal = this.props.value ? moment(this.props.value).format('MM/DD/YYYY') : '';

    return (
      <DayPickerInput
        className={style.datepicker}
        value={dateVal}
        onDayChange={this._onChange}
      />
    );
  }
}
