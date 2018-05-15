import React from 'react';
import { connect } from 'react-redux';
import cookie from 'react-cookie';
import debug from 'debug';
import { autobind } from 'core-decorators';
import { Experiment as ExperimentBase, Variant } from 'react-ab';

import {
  choose,
  set,
  clear
} from '../../state/redux/actions/app/experiment';

const log = debug('client:components:experiment');

@connect(
  (state, props) => ({
    experiments: state.app.getIn(['experiment'])
  }),
  (dispatch, props) => ({
    actions: {
      choose: (d) => dispatch(choose(d)),
      set: (d) => dispatch(set(d)),
      clear: (d) => dispatch(clear(d))
    }
  })
)
class Experiment extends React.Component {
  static propTypes = {
    id: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired
  };
  constructor (props, context) {
    super(props, context);
  }

  _sanitizeKey (key) {
    return key.replace('react_ab_', '');
  }

  @autobind
  _onChoice (e, variation_name, variation_id) {
    const experiment_id = this.props.id;
    const experiment_name = this.props.name;

    log(`for experiment ${experiment_name} (${experiment_id}), choose variation ${variation_name} (${variation_id})`);

    this.props.actions.choose({
      experiment_id,
      experiment_name,
      variation_id,
      variation_name
    });
  }
  @autobind
  _get (key) {
    key = this._sanitizeKey(key);
    log(`for experiment ${this.props.name} (${this.props.id}), get experiment key ${key} -> ${this.props.experiments.get(key)}`);
    return this.props.experiments.get(key, '');
  }

  @autobind
  _set (key, value) {
    key = this._sanitizeKey(key);
    log(`for experiment ${this.props.name} (${this.props.id}), set experient key ${key} to ${value}`);
    return this.props.actions.set({
      key,
      value
    });
  }
  @autobind
  _clear (key) {
    key = this._sanitizeKey(key)
    log(`for experiment ${this.props.name} (${this.props.id}), clear experiment key ${key}`);
    return this.props.actions.clear({
      key
    })
  }

  render () {
    return (
      <ExperimentBase
        name={this.props.name}
        onChoice={this._onChoice}
        get={this._get}
        set={this._set}
        clear={this._clear}>
        {this.props.children}
      </ExperimentBase>
    )
  }
}

export {
  Variant,
  Experiment
}
