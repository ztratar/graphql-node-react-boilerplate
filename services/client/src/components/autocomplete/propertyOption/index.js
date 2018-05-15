import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import _ from 'underscore';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { autobind, throttle } from 'core-decorators';
import Immutable from 'immutable';

import { info } from '../../../io/logger';
import PureComponent from '../../common/pure';
import graphqlDeferred from '../../../decorators/graphqlDeferred';
import form from '../../../decorators/form';
import { AutocompleteInput } from '../../form';

import style from './index.css';

@form({
  initialState: (props) => ({
    searchedPropertyOptions: [],
    value: props.value || '',
    loading: false
  })
})
@graphql(gql`
  mutation createPropertyOption ($input: PropertyOptionInput!) {
    propertyOption: createPropertyOption (input: $input) {
      id
      value
    }
  }
`, {
  props: ({
    mutate
  }) => ({
    createPropertyOption: async ({
      value,
      Property
    }) => {
      return await mutate({
        variables: {
          input: {
            value,
            Property
          }
        }
      });
    }
  })
})
@graphql(gql`
  query getPropertyOptions ($input: GetPropertyOptionsInput!) {
    propertyOptions: getPropertyOptions (input: $input) {
      id
      value
    }
  }
`, {
  options: (props) => ({
    fetchPolicy: 'network-only',
    skip: !props.property || !props.property.id,
    variables: {
      input: {
        Property: { id: props.property.id }
      }
    }
  }),
  props: ({
    data: {
      propertyOptions = [],
      loading: propertyOptionsLoading
    }
  }) => ({
    propertyOptions,
    propertyOptionsLoading
  })
})
@graphqlDeferred('search', gql`
  query searchPropertyOptions ($input: SearchPropertyOptionsInput!) {
    searchedPropertyOptions: searchPropertyOptions (input: $input) {
      id
      value
    }
  }
`, {
  fetchPolicy: 'network-only'
})
@withStyles(style)
export default class PropertyOptionAutocomplete extends PureComponent {
  static propTypes = {
    search: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired, // Callback when selection is made
    onClear: PropTypes.func,
    form: PropTypes.instanceOf(Immutable.Map).isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string, // Placeholder text
    value: PropTypes.string, // Prefill
    focus: PropTypes.bool, // Focus on component
    multi: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    outerClassName: PropTypes.string,
    size: PropTypes.string
  };

  static defaultProps = {
    onSelect: d => d,
    onClear: d => d,
    placeholder: 'Add structured answer...',
    value: '',
    focus: false, // Don't focus by default
    multi: true,
    disabled: false
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      numRequestsInProgress: 0
    };
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
  _serialize (propertyOption) {
    return propertyOption;
  }

  @autobind
  _deserialize (propertyOption) {
    return propertyOption;
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
  @throttle(200)
  async _onLoadRequested ({ value: text }) {
    this.setState({
      numRequestsInProgress: this.state.numRequestsInProgress + 1
    });

    this.props.search({
      input: {
        text,
        Property: {
          id: this.props.property.id
        }
      }
    }).then((data) => {
      this.props.setInForm(['searchedPropertyOptions'], data.data.searchedPropertyOptions.map(this._serialize));

      this.setState({
        numRequestsInProgress: this.state.numRequestsInProgress - 1
      });
    }).catch((e) => {
      this.setState({
        numRequestsInProgress: this.state.numRequestsInProgress - 1
      });
    });
  }

  @autobind
  _onClearRequested () {
    this.props.setInForm(['loading'], false);
    this.props.setInForm('searchedPropertyOptions', []);
    if (this.props.multi) {
      this.props.setInForm('value', '');
    }
  }

  @autobind
  async _onSelect (propertyOption) {
    var retData;

    if (propertyOption.id === 'CREATE') {
      try {
        if (this.props.onPropertyOptionCreate) this.props.onPropertyOptionCreate();
        retData = await this.props.createPropertyOption({
          value: propertyOption.rawValue,
          Property: { id: this.props.property.id }
        });
      } catch (e) {
        if (this.props.onPropertyOptionCreateDone) this.props.onPropertyOptionCreateDone();
        return;
      }
      if (this.props.onPropertyOptionCreateDone) this.props.onPropertyOptionCreateDone();
      this.props.onSelect(this._deserialize(retData.data.propertyOption));
    } else {
      this.props.onSelect(this._deserialize(propertyOption));
    }

    if (this.props.multi) {
      _.defer(() => {
        this.props.updateForm({
          value: ''
        })

        // Blur and re-focus to keep the autocomplete open
        this.refs.auto.refs.composedComponent.refs.composedComponent.refs.autosuggest.input.blur();
        setTimeout(() => this.refs.auto.refs.composedComponent.refs.composedComponent.refs.autosuggest.input.focus(), 0);
      });
    }
  }

  @autobind
  _shouldRenderSuggestions (value) {
    return true;
  }

  render () {
    let suggestions = (this.props.propertyOptions || []).slice(0);
    let searchedSuggestions = this.props.form.get('searchedPropertyOptions').toJSON();
    let formVal = this.props.form.get('value');
    let existingIds = _.pluck(this.props.existingOptions || [], 'id');

    if (formVal) {
      suggestions = suggestions.filter(po => po && po.value && ~po.value.indexOf(formVal));
    }

    if (searchedSuggestions && searchedSuggestions.length) {
      suggestions = _.uniq(suggestions.concat(searchedSuggestions), false, po => po.id);
    }

    if (existingIds && existingIds.length) {
      suggestions = suggestions.filter(po => !_.contains(existingIds, po.id));
    }

    let suggestionVals = _.invoke(_.pluck(suggestions, 'value'), 'toLowerCase');

    if (!_.contains(suggestionVals, (formVal || '').toLowerCase()) && this.state.numRequestsInProgress === 0 && formVal) {
      suggestions.push({
        id: 'CREATE',
        rawValue: formVal,
        value: `Create "${formVal}"`
      });
    }

    return (
      <AutocompleteInput
        ref='auto'
        className={this.props.className}
        outerClassName={this.props.outerClassName}
        suggestionsClassName={style.suggestions}
        suggestions={suggestions}
        shouldRenderSuggestions={this._shouldRenderSuggestions}
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
        loading={this.props.form.get('loading')}
      />
    );
  }
}
