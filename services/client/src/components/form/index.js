import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import Input from './input';
import Textarea from './textarea';
import Label from './label';
import Dropdown from './dropdown';
import Radio from './radio';
import TagRadioTable from './tagRadioTable';
import Checkbox from './checkbox';
import AutocompleteInput from './autocompleteInput';
import UploadButton from './uploadButton';
import DisplayEditField from './displayEditField';
import Switch from './switch';
import Slider from './slider';
import USD from './usd'
import Phone from './phone';
import DatePicker from './datepicker';

import style from './index.css';

@withStyles(style)
export default class Form extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    onSubmit: PropTypes.func
  }
  static defaultProps = {
    className: '',
    onSubmit: d => d
  }
  render () {
    return (
      <form
        className={classNames(style.form, style[this.props.style], this.props.className)}
        onSubmit={this.props.onSubmit}>
        {this.props.children}
      </form>
    );
  }
}

export {
  Form,
  Input,
  Textarea,
  Label,
  Dropdown,
  Radio,
  DatePicker,
  Switch,
  Slider,
  USD,
  Phone,
  Checkbox,
  UploadButton,
  AutocompleteInput,
  DisplayEditField,
  TagRadioTable
};
