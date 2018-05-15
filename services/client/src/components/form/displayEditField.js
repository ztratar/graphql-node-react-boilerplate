import React from 'react';
import classNames from 'classnames';
import { autobind } from 'core-decorators';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import { Form, Input } from 'components/form'
import ButtonLink from 'components/buttonLink';

import style from './displayEditField.css';

@withStyles(style)
export default class DisplayEditField extends PureComponent {

  static propTypes = {
    name: React.PropTypes.string,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onSave: React.PropTypes.func
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      editMode: false
    };
  }

  @autobind
  closeEditMode (e) {
    this.setState({
      editMode: false
    });
  }

  @autobind
  _enterEditMode (e) {
    e.preventDefault();
    this.setState({
      editMode: true
    });
  }

  @autobind
  _saveForm (e) {
    e.preventDefault();
    this.setState({
      editMode: false
    });
    if (this.props.onSave) {
      this.props.onSave(e);
    }
  }

  render () {
    return (
      <div className={classNames(style.displayEditField, style[this.props.size], this.props.className)}>
        {this.state.editMode ?
        <div className={classNames('form-inline', style.editForm)}>
          <Input
            name={this.props.name}
            value={this.props.value}
            onChange={this.props.onChange}
            background='greyLightest'
            focus
          />
          {this.props.onSave ? <ButtonLink type='submit' text='Save' size='sm' onClick={this._saveForm}/> : null}
        </div>
        :
        <div>
          <h3>{this.props.value}</h3>
          <a href='#' onClick={this._enterEditMode}>
            <i className='icon'>{String.fromCharCode(61952)}</i>
          </a>
        </div>
        }
      </div>
    );
  }
}
