import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link, browserHistory } from 'react-router';
import ReactModal from 'react-modal';
import { autobind } from 'core-decorators';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class Modal extends PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    animatedIn: PropTypes.bool,
    maxWidth: PropTypes.number,
    textAlign: PropTypes.oneOf(['center', 'left']),
    showClose: PropTypes.bool,
    disableBackgroundClose: PropTypes.bool,
    overlayClassName: PropTypes.string,
    blurBackground: PropTypes.bool,
    showAppHeader: PropTypes.bool
  };

  static defaultProps = {
    isOpen: false,
    onClose: d => d,
    animatedIn: false,
    maxWidth: 0,
    textAlign: 'center',
    showClose: true,
    disableBackgroundClose: false,
    overlayClassName: '',
    blurBackground: true,
    showAppHeader: false
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      isModalOpen: props.isOpen,
      isModalAnimatedIn: props.animatedIn
    };
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.isModalOpen && nextProps.isOpen === false) {
      this._closeModal();
      this._setFixedHTMLScroll(false);
    } else {
      this.setState({
        isModalOpen: nextProps.isOpen
      });
    }
  }

  componentWillUnmount () {
    this._setFixedHTMLScroll(false);
  }

  @autobind
  _afterOpenModal () {
    if (!this.state.isModalAnimatedIn) {
      this.setState({
        isModalAnimatedIn: true
      });
      this._setFixedHTMLScroll(true);
    }
  }

  @autobind
  _onRequestClose () {
    if (this.props.disableBackgroundClose) return false;
    return this._closeModal();
  }

  @autobind
  _closeModal () {
    this.setState({
      isModalAnimatedIn: false
    }, () => {
      setTimeout(() => {
        if (this.props.returnTo) {
          browserHistory.push(this.props.returnTo);
        }

        this.setState({
          isModalOpen: false
        });

        this._setFixedHTMLScroll(false);

        this.props.onClose();
      }, 200);
    });
  }

  _setFixedHTMLScroll (open) {
    if (__CLIENT__) {
      const elements = document.getElementsByTagName('html');

      if (!elements) return;

      const html = elements[0];
      const htmlClass = html.className;

      const rootElement = this.props.showAppHeader ? document.getElementById('app-content-container') : document.getElementById('root-body');
      const rootClass = rootElement.className;

      if (!open) {
        html.className = htmlClass.replace(/noscroll/g, '');
        rootElement.className = rootClass.replace(/blurBackground/g, '');
      } else {
        html.className += ' noscroll';

        if (this.props.blurBackground) {
          rootElement.className += ' blurBackground';
        }
      }
    }
  }

  render () {
    let customStyle = {};

    if (this.props.maxWidth) {
      customStyle = {
        maxWidth: this.props.maxWidth
      };
    };

    return (
      <ReactModal
        isOpen={this.state.isModalOpen}
        onAfterOpen={this._afterOpenModal}
        closeTimeoutMS={210}
        className={classNames(style.modalWrapper, this.props.wrapperClassName)}
        overlayClassName={classNames(style.overlay, this.state.isModalAnimatedIn ? style.overlayActive : '', this.props.showAppHeader ? style.overlayWithHeader : '', this.props.overlayClassName)}
        onRequestClose={this._onRequestClose}
        shouldCloseOnOverlayClick={true}
        contentLabel='Modal'
      >
        <div>
          <div
            className={classNames(style.modal, this.props.className, this.state.isModalAnimatedIn ? style.modalActive : '')}
            style={customStyle}
            onMouseOver={this.props.onMouseOver}
            onMouseLeave={this.props.onMouseLeave}
          >
            {this.props.showClose ? <a className={style.close} onClick={this._closeModal}>
              <i className='icon'>{String.fromCharCode(61943)}</i>
            </a> : null}
            <div className={classNames(style.modalContent, style['textAlign-'+this.props.textAlign])}>
              {this.props.children}
            </div>
          </div>
        </div>
      </ReactModal>
    );
  }
}
