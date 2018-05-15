import React from 'react';
import debug from 'debug';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { remove as removeAlert } from '../../state/redux/actions/app/alerts';

import PureComponent from 'components/common/pure';
import FlashBanner from 'components/flashBanner';

const log = debug('client:components:alert_box');

@connect(
  (state, props) => ({
    alerts: state.app.get('alerts')
  }),
  (dispatch, props) => ({
    actions: bindActionCreators({
      remove: removeAlert
    }, dispatch)
  })
)
export default class AlertBox extends PureComponent {
  constructor (props, context) {
    super(props, context);

    this.state = {
      id: null,
      text: null,
      color: null,
      timeout: null,
      onTimeout: (f) => f
    };
  }
  componentDidMount () {
    this.reduceAlertsIntoState(this.props.alerts.toJSON());
  }
  componentWillReceiveProps (nextProps) {
    this.reduceAlertsIntoState(nextProps.alerts.toJSON());
  }
  reduceAlertsIntoState (inputAlerts) {
    log('reducing alerts into state');
    const alerts = inputAlerts;
    const nextAlert = alerts[0] || null;

    if (nextAlert) log('next alert: %O', nextAlert);
    else log('no more alerts');

    if (!__CLIENT__|| !alerts || !alerts.length) return this.setState({
      id: null,
      text: null,
      color: null,
      timeout: null,
      onTimeout: (f) => f
    });

    if (!nextAlert.text) return this.props.actions.remove(nextAlert.id);

    if (nextAlert.id !== this.state.id) {
      log('setting next alert into state: %O', nextAlert);
      this.setState({
        id: nextAlert.id,
        text: nextAlert.text || null,
        timeout: nextAlert.timeout || 2500,
        color: nextAlert.color || 'c6522f',
        onTimeout: () => this.props.actions.remove(nextAlert.id)
      });
    }
  }
  render () {
    if (this.state.id) log(`rendering alert with text ${this.state.text}, color ${this.state.color}, and timeout ${this.state.timeout}`);
    log('alerts in queue: %O', this.props.alerts.toJSON());
    return (
      <FlashBanner
        message={this.state.text}
        timeout={this.state.timeout}
        color={this.state.color}
        onTimeout={this.state.onTimeout}
      />
    );
  }
}
