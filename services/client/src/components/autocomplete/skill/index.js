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
    skills: [],
    value: props.value || ''
  })
})
@graphqlDeferred('search', gql`
  query skillAutocomplete ($search: SkillSearchInput!) {
    skills: searchSkills(search: $search) {
      id
      name
    }
  }
`)
export default class SkillAutocomplete extends PureComponent {
  static propTypes = {
    search: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired, // Callback when selection is made
    form: PropTypes.instanceOf(Immutable.Map).isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string, // Placeholder text
    value: PropTypes.string, // Prefill skill
    focus: PropTypes.bool // Focus on component
  };

  static defaultProps = {
    onSelect: d => d,
    placeholder: 'ex: Javascript, Android, etc...',
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
    if (this.props.value !== value) { // Provide a means to manually set the value from outside of the component, to prefill skill etc
      this.props.updateForm({
        value
      });
    }
  }

  @autobind
  _serialize ({ id, name }) {
    return {
      id,
      value: name
    };
  }

  @autobind
  _deserialize ({ id, value }) {
    return {
      id,
      name: value
    };
  }

  @autobind
  _onChange (value) {
    this.props.setInForm('value', value);
  }

  @autobind
  _onLoadRequested ({ value: input }) {
    this.setState({
      numRequestsInProgress: this.state.numRequestsInProgress + 1
    });

    this.props.search({
      search: {
        input
      }
    }).then(({
      data: {
        skills
      }
    }) => {
      this.props.setInForm('skills', skills.map(this._serialize))
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
    this.props.setInForm('skills', []);
    this.props.setInForm('value', '');
  }

  @autobind
  _onSelect (skill) {
    if (skill.id === 'CREATE') {
      this.props.onSelect({
        id: 'CREATE_' + skill.rawValue,
        name: skill.rawValue
      });
      return;
    }

    this.props.onSelect(this._deserialize(skill));

    _.defer(() => this.props.updateForm({
      value: ''
    }));
  }

  render () {
    let suggestions = this.props.form.get('skills').toJSON();
    suggestions = suggestions.slice(0, 5);
    let formVal = this.props.form.get('value');

    let suggestionVals = _.invoke(_.pluck(suggestions, 'value'), 'toLowerCase');

    if (!_.contains(suggestionVals, (formVal || '').toLowerCase()) && this.state.numRequestsInProgress === 0) {
      suggestions.push({
        id: 'CREATE',
        rawValue: formVal,
        value: `Create new skill "${formVal}"`
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
