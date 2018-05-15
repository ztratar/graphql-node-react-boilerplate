import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import { autobind } from 'core-decorators';
import withStyles from 'isomorph-style-loader/lib/withStyles';

import PureComponent from 'components/common/pure';
import Icon from 'components/icon';
import TagRadioRow from '../tagRadioRow';

import style from './index.css';

@withStyles(style)
export default class TagRadioTable extends PureComponent {

  static propTypes = {
    title: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func,
    size: React.PropTypes.oneOf([
      'sm',
      'md',
      'lg',
      'vlg'
    ]),
    items: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.any,
      text: React.PropTypes.string.isRequired,
      value: React.PropTypes.any.isRequired
    })).isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.shape({
      text: React.PropTypes.string.isRequired,
      value: React.PropTypes.any.isRequired
    })).isRequired
  };

  static defaultProps = {
    title: '',
    onChange: d => d,
    onRemove: d => d,
    size: 'md',
    items: [],
    options: []
  };

  constructor (props, context) {
    super(props, context);
  }

  @autobind
  _onChange ({ item, option }) {
    this.props.onChange({
      item,
      option
    });
  }

  render () {
    return (
      <table className={classNames(style.tagRadioTable, !this.props.items.length ? style.hideTable : '')}>
        <thead>
          <tr>
            <th className={style.titleCol}>{this.props.title}</th>
            {this.props.options.map((option, i) =>
              <th key={i}>{option.text}</th>
            )}
          </tr>
        </thead>
        <tbody>
        {this.props.items.map((item, i) => (
          <TagRadioRow
            key={i}
            item={item}
            options={this.props.options}
            size={this.props.size}
            onChange={this._onChange}
            name={item.id || item.text}
            onRemove={this.props.onRemove ? this.props.onRemove : undefined}
          />
        ))}
        </tbody>
      </table>
    );
  }
}
