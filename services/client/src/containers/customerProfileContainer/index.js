import React from 'react';
import _ from 'underscore';
import classNames from 'classnames';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { autobind } from 'core-decorators';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import analytics from 'io/analytics';
import userFragment from 'fragments/user';
import PureComponent from 'components/common/pure';
import Avatar from 'components/avatar';
import NavBar from 'components/navBar';
import ButtonLink from 'components/buttonLink';
import ChangePasswordModal from 'components/changePasswordModal';
import Box from 'components/box';
import { toBase64, cropImageUpload } from 'lib/files';

import {
  Form,
  Input,
  Radio,
  Checkbox,
  Dropdown,
  UploadButton,
  Switch,
  Phone,
  Label,
  Slider,
  Textarea,
} from 'components/form';
import LocationAutocomplete from 'components/autocomplete/location';
import {
  add as addAlert
} from 'state/redux/actions/app/alerts';

import funcProp from 'decorators/funcProp';
import form from 'decorators/form';
import style from './index.css';

const NAV_ITEMS = [{
  icon: 61704,
  text: 'Information',
  link: '/me',
  isActive: (path) => (path === '/me')
}, {
  icon: 61844,
  text: 'Settings',
  link: '/me/settings',
  isActive: (path) => (path === '/me/settings')
}];

@graphql(gql`
  query getMyUser {
    user: getMyUser {
      ...UserFragment
    }
  }
  ${userFragment}
`, {
  props: ({
    data: {
      user,
      loading
    }
  }) => ({
    user,
    loading
  })
})
@graphql(gql`
  mutation userUpdateMyProfile ($input: UserUpdateMyProfileInput!) {
    user: userUpdateMyProfile (input: $input) {
      ...UserFragment
    }
  }
  ${userFragment}
`, {
  props: ({
    mutate
  }) => ({
    userUpdateMyProfile: async ({
      name,
      email,
      phoneNumber,
      Avatar,
      CurrentLocation
    }) => {
      analytics.track('USER_UPDATE_MY_PROFILE');
      try {
        const user = await mutate({
          variables: {
            input: {
              name,
              email,
              phoneNumber,
              Avatar,
              CurrentLocation
            }
          }
        });
        analytics.track('UPDATE_USER_MY_PROFILE_SUCCESS');
        return user;
      } catch (e) {
        analytics.track('UPDATE_USER_MY_PROFILE_FAILURE', {
          message: e.message
        });
        throw e;
      }
    }
  })
})
@graphql(gql`
  mutation userUpdateMySettings ($input: UserUpdateMySettingsInput!) {
    user: userUpdateMySettings (input: $input) {
      ...UserFragment
    }
  }
  ${userFragment}
`, {
  props: ({
    mutate
  }) => ({
    userUpdateMySettings: async ({
      emailSubscribed,
      smsSubscribed
    }) => {
      analytics.track('USER_UPDATE_MY_SETTINGS');
      try {
        const user = await mutate({
          variables: {
            input: {
              emailSubscribed,
              smsSubscribed
            }
          }
        });
        analytics.track('USER_UPDATE_MY_SETTINGS_SUCCESS');
        return user;
      } catch (e) {
        analytics.track('USER_UPDATE_MY_SETTINGS_FAILURE', {
          message: e.message
        });
        throw e;
      }
    }
  })
})
@funcProp('reduceFormState', (user = {}) => {
  return {
    user,
    userUpdateMyProfileMutationPending: false,
    userUpdateMySettingsMutationPending: false,
    isChangePasswordModalOpen: false
  }
})
@form({
  id: 'form',
  initialState: ({ user, reduceFormState }) => reduceFormState(user)
})
@connect(
  (state, props) => ({}),
  (dispatch, props) => ({
    actions: {
      addAlert: (opts) => dispatch(addAlert(opts))
    }
  })
)
@withStyles(style)
export default class CustomerProfileContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.user && !nextProps.loading && nextProps.user) {
      this.props.setInForm(['user'], nextProps.user);
    }
  }

  @autobind
  async _onAvatarButtonUpload (files) {
    const content = await cropImageUpload(files[0], 200, 200);
    this.props.setInForm(['user', 'Avatar'], {
      content: content,
      key: content
    });
  }

  @autobind
  async _onAvatarChange (content) {
    this.props.setInForm(['user', 'Avatar'], {
      content: content,
      key: content
    });
  }

  @autobind
  _onNameChange (name) {
    this.props.setInForm(['user', 'name'], name);
  }

  @autobind
  _onEmailChange (email) {
    this.props.setInForm(['user', 'email'], email);
  }

  @autobind
  _onPhoneNumberChange (phoneNumber) {
    this.props.setInForm(['user', 'phoneNumber'], phoneNumber);
  }

  @autobind
  _onCurrentLocationChange (currentLocation) {
    this.props.setInForm(['user', 'CurrentLocation'], currentLocation);
  }

  @autobind
  async _onUpdateProfileClick () {
    if (this.props.form.get('userUpdateMyProfileMutationPending')) return;

    this.props.setInForm(['userUpdateMyProfileMutationPending'], true);

    try {
      const userData = this.props.form.get('user').toJSON();

      const {
        name = undefined,
        email = undefined,
        phoneNumber = undefined
      } = userData;

      const { data: { user } } = await this.props.userUpdateMyProfile({
        name,
        email,
        phoneNumber,
        Avatar: userData.Avatar ? {
          ...userData.Avatar,
          key: undefined,
          __typename: undefined
        } : undefined,
        CurrentLocation: userData.CurrentLocation ? {
          ...userData.CurrentLocation,
          __typename: undefined
        } : undefined,
        __typename: undefined
      });
      this.props.updateForm({
        user
      });
    } catch (e) {
      this.props.setInForm(['userUpdateMyProfileMutationPending'], false);
    }

    this.props.setInForm(['userUpdateMyProfileMutationPending'], false);

    this.props.actions.addAlert({
      text: 'Profile saved successfully!',
      color: '#11D79D',
      timeout: 3000
    });
  }

  @autobind
  _onEmailSubscribedMessagesChange (emailSubscribedMessages) {
    this.props.setInForm(['user', 'emailSubscribed'], emailSubscribedMessages);
  }

  @autobind
  _onSMSSubscribedMessagesChange (smsSubscribedMessages) {
    this.props.setInForm(['user', 'smsSubscribed'], smsSubscribedMessages);
  }

  @autobind
  async _onSettingsUpdateClick () {
    if (this.props.form.get('userUpdateMySettingsMutationPending')) return;

    this.props.setInForm(['userUpdateMySettingsMutationPending'], true);

    try {

      const userData = this.props.form.get('user').toJSON();

      const {
        emailSubscribed,
        smsSubscribed
      } = userData;

      const { data: { user } } = await this.props.userUpdateMySettings({
        emailSubscribed,
        smsSubscribed
      });

      this.props.updateForm({
        user
      });
    } catch (e) {
      this.props.setInForm(['userUpdateMySettingsMutationPending'], false);
    }

    this.props.setInForm(['userUpdateMySettingsMutationPending'], false);

    this.props.actions.addAlert({
      text: 'Settings saved successfully!',
      color: '#11D79D',
      timeout: 3000
    });
  }

  render () {
    const onSettingsTab = this.props.location.pathname === '/me/settings';

    return (
      <div className={style.customerProfileContainer}>
        <ChangePasswordModal
          isOpen={this.props.form.getIn(['isChangePasswordModalOpen'])}
          onClose={() => {
            this.props.setInForm(['isChangePasswordModalOpen'], false);
          }}
        />
        <div className={style.navBarWrapper}>
          <NavBar
            className={style.navbar}
            navs={[{
              to: '/me',
              name: 'Information'
            }, {
              to: '/me/settings',
              name: 'Settings'
            }]}
          />
        </div>
        {!onSettingsTab ? (
        <Box className={style.box}>
          <Form className='form-horizontal'>
            <div className='form-group'>
              <Label centerText={true} className='col-xs-12 col-sm-4'>Avatar</Label>
              <div className='col-xs-12 col-sm-8'>
                <Avatar
                  name='avatar'
                  src={this.props.form.getIn(['user', 'Avatar', 'key'])}
                  size='lg'
                  onChange={this._onAvatarChange}
                />
                <UploadButton
                  name='avatar_button'
                  text='Change Avatar'
                  background='gradientLight'
                  size='sm'
                  className={style.changeAvatarButton}
                  onChange={this._onAvatarButtonUpload}
                />
              </div>
            </div>
            <div className='form-group'>
              <Label centerText={true} className='col-xs-12 col-sm-4'>Email</Label>
              <div className='col-xs-12 col-sm-8'>
                <Input
                  type='text'
                  name='email'
                  background='greyLightest'
                  placeholder='e.g. elon@tesla.com'
                  value={this.props.form.getIn(['user', 'email'])}
                  onChange={this._onEmailChange}
                />
              </div>
            </div>
            <div className='form-group'>
              <Label centerText={true} className='col-xs-12 col-sm-4'>Name</Label>
              <div className='col-xs-12 col-sm-8'>
                <Input
                  type='text'
                  name='name'
                  background='greyLightest'
                  placeholder='e.g. Elon Musk'
                  value={this.props.form.getIn(['user', 'name'])}
                  onChange={this._onNameChange}
                />
              </div>
            </div>
            <div className='form-group'>
              <Label centerText={true} className='col-xs-12 col-sm-4'>Phone Number</Label>
              <div className='col-xs-12 col-sm-8'>
                <Phone
                  background='greyLightest'
                  value={this.props.form.getIn(['user', 'phoneNumber'])}
                  onChange={this._onPhoneNumberChange}
                />
              </div>
            </div>
            <div className='form-group'>
              <Label centerText={true} className='col-xs-12 col-sm-4'>Current location</Label>
              <div className='col-xs-12 col-sm-8'>
                <LocationAutocomplete
                  name='currentLocation'
                  placeholder='e.g. San Francisco, CA'
                  background='greyLightest'
                  value={this.props.form.getIn(['user', 'CurrentLocation', 'googleName'])}
                  onSelect={this._onCurrentLocationChange}
                />
              </div>
            </div>
            <div className={style.formActions}>
              <ButtonLink
                text='Save'
                uppercase={true}
                className={style.saveButton}
                onClick={this._onUpdateProfileClick}
                loading={this.props.form.get('userUpdateMyProfileMutationPending')}
                loadingText='Saving...'
              />
            </div>
          </Form>
        </Box>
        ) : (
        <div>
          <Box className={style.box}>
            <h3>Subscription Settings</h3>
            <Form className='form-horizontal'>
              <div className='form-group'>
                <Label centerText={true} className='col-xs-12 col-sm-4'>Email</Label>
                <div className='col-xs-12 col-sm-8'>
                  <Switch
                    className={style.switch}
                    onChange={this._onEmailSubscribedMessagesChange}
                    checked={this.props.form.getIn(['user', 'emailSubscribed'])}
                  />
                </div>
              </div>
              <div className='form-group'>
                <Label centerText={true} className='col-xs-12 col-sm-4'>SMS</Label>
                <div className='col-xs-12 col-sm-8'>
                  <Switch
                    className={style.switch}
                    onChange={this._onSMSSubscribedMessagesChange}
                    checked={this.props.form.getIn(['user', 'smsSubscribed'])}
                  />
                </div>
              </div>
              <div className={style.formActions}>
                <ButtonLink
                  text='Save'
                  uppercase={true}
                  className={style.saveButton}
                  onClick={this._onSettingsUpdateClick}
                  loading={this.props.form.get('userUpdateMySettingsMutationPending')}
                  loadingText='Saving...'
                />
              </div>
            </Form>
          </Box>
          <Box className={style.box}>
            <h3>Password</h3>
            <ButtonLink
              text='Change Password'
              onClick={() => {
                this.props.setInForm(['isChangePasswordModalOpen'], true);
              }}
            />
          </Box>
        </div>
        )}
      </div>
    );
  }
}
