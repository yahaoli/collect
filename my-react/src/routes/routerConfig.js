import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import Load from '../utils/asyncComponent';
import Admin from '../page/admin/admin';
import history from '../utils/history'
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
let Login = Load(() => import('../page/login/login'));
moment.locale('zh-cn');
export default () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router history={history}>
        <Switch>
          <Redirect from='/' exact to='/admin'/>
          <Route path="/login" render={props => {
            return <Login {...props}/>;
          }}/>
          <Route path="/admin" render={props => {
            return <Admin {...props}/>;
          }}/>
          <Route render={() => <div>Not Found</div>}/>
        </Switch>
      </Router>
    </ConfigProvider>
  );

};
