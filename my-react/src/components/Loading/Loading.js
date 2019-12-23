import React from 'react';
import { Spin } from 'antd';
import ReactDOM from 'react-dom';
import './index.less'
class Loading extends React.Component {
  render() {
    return (
      <Spin className='page-loading-icon' size={this.props.size || 'large'}/>
    );
  }
}

class init {
  loading(props) {
    let div = document.createElement('div');
    div.className = 'page-loading';
    this.element = div;
    document.body.appendChild(div);
    ReactDOM.render(React.createElement(
      Loading,
      props,
    ), div);
    return this
  }

  close() {
    let div = this.element;
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  }
}

export default new init();
