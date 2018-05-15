import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import { autobind } from 'core-decorators';

import PureComponent from '../../common/pure';
import Icon from '../../icon';
import { Radio } from '../../form';
import style from './index.css';

@withStyles(style)
export default class TagRadioRow extends PureComponent {
  static propTypes = {
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func,
    size: React.PropTypes.oneOf([
      'sm',
      'md',
      'lg',
      'vlg'
    ]),
    item: React.PropTypes.shape({
      id: React.PropTypes.any,
      text: React.PropTypes.string.isRequired,
      value: React.PropTypes.any.isRequired
    }).isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.shape({
      //NOTE: We aren't using text, but we want to require it for strict typing
      text: React.PropTypes.string.isRequired,
      value: React.PropTypes.any.isRequired
    })).isRequired,
    name: React.PropTypes.string.isRequired
  };

  static defaultProps = {
    onChange: d => d,
    onRemove: d => d,
    size: 'md',
    item: {
      id: null,
      text: '',
      value: ''
    },
    options: []
  };

  constructor (props, context) {
    super(props, context);
  }

  @autobind
  _onRemove (e) {
    e.preventDefault();
    const { item } = this.props;
    this.props.onRemove({
      item
    });
  }

  @autobind
  _onChange ({ value, checked }) {
    if (checked) {
      const { item } = this.props;
      const option = this.props.options.find(option => option.value === value);
      if (checked) this.props.onChange({ item, option });
    }
  }

  render () {
    const hasRemove = !!this.props.onRemove;
    return (
      <tr className={classNames(style.tagRadioRow, style[`size-${this.props.size}`])}>
        <td className={style.tagContent}>
          <span>{this.props.item.text}</span>
          {hasRemove ? (
            <a
              href='#'
              onClick={this._onRemove}
              className={classNames(style.cancel, style[`cancel-${this.props.size}`])}>
              <Icon src={61943}/>
            </a>
          ) : null}
        </td>
        {this.props.options.map((option, i) => (
          <td key={i}>
            <Radio
              name={this.props.name}
              onChange={this._onChange}
              value={option.value}
              checked={option.value === this.props.item.value}
            />
          </td>
        ))}
      </tr>
    );
  }
}
