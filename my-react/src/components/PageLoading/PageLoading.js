import React from 'react';
import { Spin } from 'antd';
import './index.less';

class PageLoading extends React.Component {
  render() {
    return (
      <div style={{ paddingTop: 100, textAlign: 'center' }}>
        <Spin size={this.props.size || 'large'}/>
      </div>
    );
  }
}

export default PageLoading;
