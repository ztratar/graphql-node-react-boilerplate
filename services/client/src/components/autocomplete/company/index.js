import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import gql from 'graphql-tag';
import uuid from 'uuid';
import Immutable from 'immutable';
import { autobind } from 'core-decorators';

import { info } from '../../../io/logger';
import PureComponent from '../../common/pure';
import graphqlDeferred from '../../../decorators/graphqlDeferred';
import form from '../../../decorators/form';
import { AutocompleteInput } from '../../form';
import CreateCompanyModal from 'containers/createCompanyModal';

@form({
  initialState: (props) => ({
    companies: [],
    value: props.value || ''
  })
})
@graphqlDeferred('search', gql`
  query companyAutocomplete ($text: String!) {
    companies: companyAutocomplete(text: $text) {
      id
      name
      Logo {
        id
        key
      }
    }
  }
`)
export default class CompanyAutocomplete extends PureComponent {
  static propTypes = {
    search: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired, // Callback when selection is made
    form: PropTypes.instanceOf(Immutable.Map).isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string, // Placeholder text
    value: PropTypes.string, // Prefill company
    focus: PropTypes.bool // Focus on component
  };

  static defaultProps = {
    onSelect: d => d,
    placeholder: 'Type a company name...',
    value: '',
    focus: false // Don't focus by default
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      createCompanyOpen: false,
      newCompanyName: null
    };
  }

  componentWillReceiveProps (nextProps) {
    const { value } = nextProps;
    if (this.props.value !== value) { // Provide a means to manually set the value from outside of the component, to prefill company etc
      this.props.updateForm({
        value
      });
    }
  }

  @autobind
  _serialize ({ id, name, Logo }) {
    return {
      id,
      value: name,
      Logo
    };
  }

  @autobind
  _deserialize ({ id, value, Logo }) {
    return {
      id,
      name: value,
      Logo
    };
  }

  @autobind
  _onChange (value) {
    this.props.setInForm('value', value);
  }

  @autobind
  _onLoadRequested ({ value: text }) {
    this.props.search({
      text
    }).then(({
      data: {
        companies
      }
    }) => this.props.setInForm('companies', companies.map(this._serialize)));
  }

  @autobind
  _onClearRequested () {
    this.props.setInForm('companies', []);
    this.props.setInForm('value', '');
  }

  @autobind
  _onSelect (company) {
    if (company.id.startsWith('CREATE_')) {
      this._openCreateCompany(company.rawValue);
      return;
    }

    this.props.onSelect(this._deserialize(company));
  }

  @autobind
  _onCreate ({ name, url }) {
    this.props.onSelect({
      id: `CREATE_${uuid.v4()}`,
      name,
      url
    });
    this._onClearRequested();
  }

  @autobind
  _openCreateCompany (newCompanyName) {
    this.setState({
      createCompanyOpen: true,
      newCompanyName: newCompanyName
    });
  }

  @autobind
  _closeCreateCompany () {
    if (__CLIENT__) {
      setTimeout(() => this.setState({
        createCompanyOpen: false
      }));
    }
  }

  render () {
    let suggestions = this.props.form.get('companies').toJSON();
    suggestions = suggestions.slice(0, 5);
    let formVal = this.props.form.get('value');

    let suggestionVals = _.invoke(_.pluck(suggestions, 'value'), 'toLowerCase');

    if (!_.contains(suggestionVals, formVal)) {
      suggestions.push({
        id: `CREATE_${uuid.v4()}`,
        rawValue: formVal,
        value: `Create new company "${formVal}"`
      });
    }

    return (
      <div>
        {this.state.createCompanyOpen ? (
          <CreateCompanyModal
            name={`${this.props.name}-creation-modal`}
            onSubmit={this._onCreate}
            companyName={this.state.newCompanyName}
            onClose={this._closeCreateCompany}
          />
        ) : null}

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
        />
      </div>
    );
  }
}
