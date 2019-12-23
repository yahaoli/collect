import React from 'react';
import './index.less';
import { NavLink, Route, Switch, withRouter } from 'react-router-dom';
import { Menu, Tabs, Spin } from 'antd';
import Load from '@/utils/asyncComponent';
import { systemListPc } from '@/utils/service';

const { SubMenu } = Menu, { TabPane } = Tabs;
let menuList = [];

class PageMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: this.props.location.pathname,
      openKeys: [],
      menu: [],
    };
    this.getSystemListPc();
  }

  menuTree = () => {
    let that = this, menu = this.state.menu;
    if (menu.length === 0) {
      return (
        <div style={{ paddingTop: 50, textAlign: 'center' }}>
          <Spin/>
        </div>
      );
    }

    function tree(menuArr, parentIndex) {
      return menuArr.map((arr, index) => {
        if (arr.toolBarList) {
          arr.index = parentIndex !== void(0) ? parentIndex + '-' + index : index.toString();
          return (
            <SubMenu
              key={arr.index}
              title={arr.descript}
            >
              {tree(arr.toolBarList, arr.index)}
            </SubMenu>
          );
        } else {
          if (parentIndex) arr.parentIndex = parentIndex;
          let url = arr.url.replace(/.html/, '');
          arr.route = '/admin/' + url;
          arr.component = Load(() => import('@/page/' + url + '/' + url));
          menuList.push(arr);
          return (<Menu.Item key={arr.route}><NavLink to={arr.route}
                                                      onClick={that.props.linkChange.bind(this, arr)}>{arr.descript}</NavLink></Menu.Item>);
        }
      });
    }

    return tree(menu);
  };
  handleClick = e => {
    this.setState({
      current: e.key,
    });
  };
  onOpenChange = (Keys) => {
    this.setState({
      openKeys: Keys,
    });
  };
  getSystemListPc = () => {
    systemListPc().then(data => {
      this.setState({ menu: data }, this.menuInit);
    }).catch(() => {
    });
  };

  menuInit() {
    let pathname = this.state.current, openKeys = [];
    let currentRoute = menuList.filter(item => {
      return item.route === pathname;
    });
    if (currentRoute.length === 0) return;
    let parentIndex = currentRoute[0].parentIndex;
    if (parentIndex) {
      parentIndex = parentIndex.split('-');
      if (parentIndex.length === 1) {
        openKeys = parentIndex;
      } else {
        while (parentIndex.length > 0) {
          openKeys.unshift(parentIndex.join('-'));
          parentIndex.pop();
        }
      }
    }
    this.setState({
      openKeys: openKeys,
    });
    this.props.linkChange(currentRoute[0]);

  }

  render() {
    return (
      <div>
        <Menu
          theme='dark'
          onClick={this.handleClick}
          openKeys={this.state.openKeys}
          selectedKeys={[this.state.current]}
          onOpenChange={this.onOpenChange}
          mode="inline"
        >

          {this.menuTree()}
        </Menu>
      </div>
    );
  }
}

const PageMenuList = withRouter(PageMenu);

class admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: '1',
      currentRoute: '',
      routeList: menuList,
    };
  }


  linkChange = (route) => {
    this.setState({
      currentRoute: route,
    });
  };
  routerRender = () => {
    let currentRoute = this.state.currentRoute;
    if (currentRoute) {
      return (
        <Tabs defaultActiveKey={currentRoute.route} key={currentRoute.route}>
          <TabPane tab={currentRoute.descript} key={currentRoute.route}>
            <Switch>
              {this.state.routeList.map(item => {
                return (
                  <Route exact path={item.route} key={item.route}  component={item.component}/>
                );
              })
              }
            </Switch>
          </TabPane>
        </Tabs>
      );
    }
    //return (<div>Not Found</div>)
  };

  render() {
    return (
      <div className='admin-con'>
        <div className='admin-head'/>
        <div className='admin-aside'>
          <PageMenuList linkChange={this.linkChange}/>
        </div>
        <div className='admin-main'>
          {
            this.routerRender()
          }
        </div>
      </div>
    );
  }
}

export default admin;
