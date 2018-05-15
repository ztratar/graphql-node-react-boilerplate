import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import gql from 'graphql-tag';
import Immutable from 'immutable';
import { autobind } from 'core-decorators';

import { info } from '../../../io/logger';
import PureComponent from '../../common/pure';
import graphqlDeferred from '../../../decorators/graphqlDeferred';
import form from '../../../decorators/form';
import { AutocompleteInput } from '../../form';

@form({
  initialState: (props) => ({
    topics: [],
    value: props.value || ''
  })
})
@graphqlDeferred('search', gql`
  query topicAutocomplete ($input: TopicSuggestInput!) {
    topics: suggestTopics(input: $input) {
      id
      title
    }
  }
`, {
  fetchPolicy: 'network-only'
})
export default class TopicAutocomplete extends PureComponent {
  static propTypes = {
    search: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired, // Callback when selection is made
    form: PropTypes.instanceOf(Immutable.Map).isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string, // Placeholder text
    value: PropTypes.string, // Prefill topic
    focus: PropTypes.bool // Focus on component
  };

  static defaultProps = {
    onSelect: d => d,
    placeholder: 'ex: Raise, Company Research, etc...',
    value: '',
    focus: false // Don't focus by default
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      numRequestsInProgress: 0
    };
  }

  componentWillReceiveProps (nextProps) {
    const { value } = nextProps;
    if (this.props.value !== value) { // Provide a means to manually set the value from outside of the component, to prefill topic etc
      this.props.updateForm({
        value
      });
    }
  }

  @autobind
  _serialize ({ id, title }) {
    return {
      id,
      value: title
    };
  }

  @autobind
  _deserialize ({ id, value }) {
    return {
      id,
      title: value
    };
  }

  @autobind
  _onChange (value) {
    this.props.setInForm('value', value);
  }

  @autobind
  _onLoadRequested ({ value: text }) {
    this.setState({
      numRequestsInProgress: this.state.numRequestsInProgress + 1
    });

    this.props.search({
      input: {
        text
      }
    }).then(({
      data: {
        topics
      }
    }) => {
      this.props.setInForm('topics', topics.map(this._serialize))
      this.setState({
        numRequestsInProgress: this.state.numRequestsInProgress - 1
      });
    }).catch((e) => {
      this.setState({
        numRequestsInProgress: this.state.numRequestsInProgress - 1
      });
      throw e;
    });
  }

  @autobind
  _onClearRequested () {
    this.props.setInForm('topics', []);
    this.props.setInForm('value', '');
  }

  @autobind
  _onSelect (topic) {
    if (topic.id === 'CREATE') {
      this.props.onSelect(this._deserialize({
        value: topic.rawValue,
        id: 'CREATE_' + topic.rawValue
      }));
      return;
    }

    this.props.onSelect(this._deserialize(topic));

    _.defer(() => this.props.updateForm({
      value: ''
    }));
  }

  render () {
    let suggestions = this.props.form.get('topics').toJSON();
    suggestions = suggestions.slice(0, 5);
    let formVal = this.props.form.get('value');

    let suggestionVals = _.invoke(_.pluck(suggestions, 'value'), 'toLowerCase');

    if (!_.contains(suggestionVals, (formVal || '').toLowerCase()) && this.state.numRequestsInProgress === 0) {
      suggestions.push({
        id: 'CREATE',
        rawValue: formVal,
        value: `Create new topic "${formVal}"`
      });
    }

    return (
      <AutocompleteInput
        suggestions={suggestions}
        onChange={this._onChange}
        onLoadRequested={this._onLoadRequested}
        onClearRequested={this._onClearRequested}
        onSelect={this._onSelect}
        placeholder={this.props.placeholder}
        value={this.props.form.get('value')}
        focus={this.props.focus}
        background={this.props.background}
        size={this.props.size}
        loading={this.state.numRequestsInProgress > 0}
      />
    );
  }
}
