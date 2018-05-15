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

@form({
  initialState: (props) => ({
    relations: {
      Companies: [],
      Skills: [],
      Roles: []
    },
    value: props.value || ''
  })
})
@graphqlDeferred('search', gql`
  query polySearch ($query: PolySearchInput!) {
    search: polySearch (query: $query) {
      id
      Companies {
        id
        name
      }
      Skills {
        id
        name
      }
      Roles {
        id
        name
      }
    }
  }
`)
export default class PolySearchAutocomplete extends PureComponent {
  static propTypes = {
    search: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired, // Callback when selection is made
    form: PropTypes.instanceOf(Immutable.Map).isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string, // Placeholder text
    value: PropTypes.string, // Prefill search value
    relations: PropTypes.arrayOf(PropTypes.oneOf(['Companies', 'Skills', 'Roles'])).isRequired,
    focus: PropTypes.bool // Focus on component
  };

  static defaultProps = {
    onSelect: d => d,
    placeholder: 'Search...',
    value: '',
    relations: [],
    focus: false // Don't focus by default
  };

  constructor (props, context) {
    super(props, context);
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
  _deserialize ({ id, name, data }) {
    return data;
  }

  @autobind
  _serializeCompany (company) {
    return {
      id: company.id,
      value: company.name,
      data: company,
      relation: 'Companies'
    };
  }

  @autobind
  _serializeRole (role) {
    return {
      id: role.id,
      value: role.name,
      data: role,
      relation: 'Roles'
    };
  }

  @autobind
  _serializeSkill (skill) {
    return {
      id: skill.id,
      value: skill.name,
      data: skill,
      relation: 'Skills'
    };
  }

  @autobind
  _onChange (value) {
    this.props.setInForm('value', value);
  }

  @autobind
  _onLoadRequested ({ value: text }) {
    this.props.search({
      query: {
        text,
        relations: this.props.relations
      }
    }).then(({
      data: {
        search: {
          Companies,
          Roles,
          Skills
        }
      }
    }) => this.props.setInForm('relations', Immutable.fromJS({
      Companies: Companies.map(this._serializeCompany),
      Roles: Roles.map(this._serializeRole),
      Skills: Skills.map(this._serializeSkill)
    })));
  }

  @autobind
  _onClearRequested () {
    this.props.setInForm('value', '');
    this.props.setInForm('relations', Immutable.fromJS({
      Companies: [],
      Roles: [],
      Skills: []
    }));
  }

  @autobind
  _onSelect (item) {
    this.props.onSelect(this._deserialize(item), item.relation);

    _.defer(() => this._onClearRequested());
  }

  render () {

    const relations = this.props.form.get('relations').toJSON();

    const suggestions = this.props.relations.reduce((arr, relation) => [
      ...arr,
      ...relations[relation]
    ], []);

    return (
      <div>
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
