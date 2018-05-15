import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

const NAV_ITEMS = [{
  text: 'Posts',
  link: '/admin/posts',
  isActive: (path) => (path.indexOf('/admin/posts') !== -1) || path === '/admin'
}, {
  text: 'Cohorts',
  link: '/admin/cohorts',
  isActive: (path) => ~path.indexOf('/admin/cohorts')
}];

@withStyles(style)
export default class AdminContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }
  render () {
    return (
      <div className={style.adminContainer}>
        <div className={style.adminNav}>
          <h5>Admin</h5>
          <ul className={style.adminNavItems}>
            {NAV_ITEMS.map((item, key) =>
              <li key={key}>
                <Link to={item.link} className={classNames(style.normalItem, item.isActive(this.props.location.pathname) ? style.activeItem : '')}>
                  {item.icon ?
                    <i className='icon'>{String.fromCharCode(item.icon)}</i>
                   : ''
                  }
                  {item.text}
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div className={style.adminChildPageContainer}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
