import React from 'react';
import { Table } from 'antd';

class PageTable extends React.Component {
  static defaultProps = {
    className: 'app-margin-top15',
    rowKey: 'key',
  };

  //总计行目前
  tabletFoot() {
    let tFoot = this.props.tFoot, keyFirst = 'count';
    if (tFoot && tFoot.length) {
      return (
        <tfoot className='ant-table-tbody'>
        <tr className="ant-table-row ant-table-row-level-0">
          {
            tFoot.map((item, index) => {
              let attr = {
                colSpan: item.colspan,
                align: item.align,
                key: keyFirst + index,
              };
              return (
                <td {...attr}>{item.value}</td>
              );
            })
          }
        </tr>
        </tfoot>
      );
    }
  }

  BodyWrapper = (props) => {
    return (
      <React.Fragment>
        <tbody {...props}>
        {props.children}
        </tbody>
        {this.tabletFoot()}
      </React.Fragment>
    );
  };

  render() {
    let pagination = this.props.pagination
      , props = {
      bordered: true, size: "middle"
      , ...this.props
    };
    props.pagination = pagination ? Object.assign({
      size: "default ", pageSize: 10, position: "bottom"
    }, pagination) : false;
    return (
      <Table
        {...props}
        components={{ body: { wrapper: this.BodyWrapper } }}
      />
    );
  }
}

export default PageTable;
