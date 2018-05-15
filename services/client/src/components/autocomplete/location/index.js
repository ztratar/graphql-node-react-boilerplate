import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import gql from 'graphql-tag';
import { autobind } from 'core-decorators';
import Immutable from 'immutable';

import { info } from '../../../io/logger';
import PureComponent from '../../common/pure';
import graphqlDeferred from '../../../decorators/graphqlDeferred';
import form from '../../../decorators/form';
import { AutocompleteInput } from '../../form';


@form({
  initialState: (props) => ({
    locations: [],
    value: props.value || '',
    loading: false
  })
})
@graphqlDeferred('search', gql`
  query locationAutocomplete ($input: LocationSearchInput!) {
    locations: searchLocations(input: $input) {
      id: googleId
      googlePlaceId
      googleName
    }
  }
`)
export default class LocationAutocomplete extends PureComponent {
  static propTypes = {
    search: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired, // Callback when selection is made
    onClear: PropTypes.func,
    form: PropTypes.instanceOf(Immutable.Map).isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string, // Placeholder text
    value: PropTypes.string, // Prefill location
    focus: PropTypes.bool, // Focus on component
    multi: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string
  };

  static defaultProps = {
    onSelect: d => d,
    onClear: d => d,
    placeholder: 'ex: San Francisco, CA',
    value: '',
    focus: false, // Don't focus by default
    multi: false,
    disabled: false
  };

  constructor (props, context) {
    super(props, context);

    this.state = { loading: false };
  }

  componentWillReceiveProps (nextProps) {
    const { value } = nextProps;
    if (this.props.value !== value) { // Provide a means to manually set the value from outside of the component, to prefill location etc
      this.props.updateForm({
        value
      });
    }
  }

  @autobind
  _serialize (location) {
    return {
      value: location.googleName,
      id: location.googlePlaceId
    };
  }

  @autobind
  _deserialize (location) {
    return {
      googlePlaceId: location.id,
      googleName: location.value
    };
  }

  @autobind
  _onChange (value) {
    this.props.updateForm({
      value
    })

    if (value === '') {
      this.props.onClear();
    }
  }

  @autobind
  async _onLoadRequested ({ value: text }) {
    if (this.props.form.get('loading')) return;

    this.props.setInForm(['loading'], true);

    const { data: { locations } } = await this.props.search({
      input: {
        text
      }
    });

    this.props.setInForm(['locations'], locations.map(this._serialize));

    this.props.setInForm(['loading'], false);
  }

  @autobind
  _onClearRequested () {
    this.props.setInForm(['loading'], false);
    this.props.setInForm('locations', []);
    if (this.props.multi) {
      this.props.setInForm('value', '');
    }
  }

  @autobind
  _onSelect (location) {
    this.props.onSelect(this._deserialize(location));

    if (this.props.multi) {
      _.defer(() => this.props.updateForm({
        value: ''
      }));
    }
  }

  render () {
    return (
      <AutocompleteInput
        className={this.props.className}
        suggestions={this.props.form.get('locations').toJSON()}
        onChange={this._onChange}
        onLoadRequested={this._onLoadRequested}
        onClearRequested={this._onClearRequested}
        onSelect={this._onSelect}
        placeholder={this.props.placeholder}
        value={this.props.form.get('value')}
        focus={this.props.focus}
        background={this.props.background}
        size={this.props.size}
        disabled={this.props.disabled}
        background={this.props.background}
        size={this.props.size}
        loading={this.props.form.get('loading')}
      />
    );
  }
}
