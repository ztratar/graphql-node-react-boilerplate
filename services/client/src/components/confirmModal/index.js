import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { autobind } from 'core-decorators';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import Modal from 'components/modal';
import ButtonLink from 'components/buttonLink';
import {
  Input,
} from 'components/form';

import style from './index.css';

@withStyles(style)
export default class ConfirmModal extends PureComponent {
  static propTypes = {
    heading: PropTypes.string.isRequired,
    description: PropTypes.string,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    input: PropTypes.shape({
      type: PropTypes.string,
      placeholder: PropTypes.string
    })
  };

  static defaultProps = {
    confirmText: 'Confirm',
    confirmLoadingText: 'Confirming...',
    confirmLoading: false,
    cancelText: 'Cancel',
    isOpen: false,
    onClose: d => d
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      inputVal: ''
    };
  }

  @autobind
  _onConfirm () {
    this.props.onConfirm(this.state.inputVal);
  }

  render () {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        maxWidth={500}
        className={style.confirmModal}
        ref='modal'
      >
        <h2>{this.props.heading}</h2>
        {this.props.description ? <p>{this.props.description}</p> : null}
        { this.props.input && this.props.input.type ? (
          <Input
            background='greyLightest'
            value={this.state.inputVal}
            onChange={(inputVal) => this.setState({ inputVal })}
          />
        ) : null}
        <div className={style.actions}>
          <ButtonLink
            background='gradientLight'
            text={this.props.cancelText}
            onClick={() => {
              this.refs.modal.refs.composedComponent._closeModal();
            }}
          />
          <ButtonLink
            text={this.props.confirmText}
            loading={this.props.confirmLoading}
            loadingText={this.props.confirmLoadingText}
            onClick={this._onConfirm}
          />
        </div>
      </Modal>
    );
  }
}
