import React from 'react';
import { Form, Button } from 'antd';
import moment from 'moment';
import { getLoginRecord } from '@/utils/service';
import PageTable from '@/components/PageTable/PageTable';
import {PageRangePicker} from '@/components/PageDatePicker/PageDatePicker';
import PageLoading from '@/components/PageLoading/PageLoading';
import './index.less';

let nowDate = moment(new Date(), 'YYYY-MM-DD');

class loginRecord extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      currentPage: 1,
    };
  }

  componentDidMount() {
    this.onPageChange(1);
  }

  onPageChange = (page) => {
    this.setState({
      currentPage: page,
    }, this.search);
  };
  search = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.setState({ loading: true });
        let query = {
          startDate: values.time[0].format('YYYY-MM-DD'),
          endDate: values.time[1].format('YYYY-MM-DD'),
          'pageSize': 10,//每页显示数据条数
          'pageNum': this.state.currentPage,//当前页码
        };
        getLoginRecord(query).then(res => {
          this.setState({
            reportData: res, loading: false,
          });
        }).finally(() => {
          this.setState({ loading: false });
        }).catch(() => {
        });
      }
    });
  };

  getTable() {
    let reportData = this.state.reportData, loading = this.state.loading;
    if (reportData && !loading) {
      let columns, table;
      columns = [
        {
          title: '登陆类型',
          dataIndex: 'loginType',
          key: 'loginType',
        },
        {
          title: '用户id',
          dataIndex: 'userId',
          key: 'userId',
        },
        {
          title: '用户名',
          dataIndex: 'userName',
          key: 'userName',
        },
        {
          title: '登录时间',
          dataIndex: 'loginTime',
          key: 'loginTime',
        },
      ];
      let title = () => <div className='app-table-title'>登录日志</div>;
      table = (
        <PageTable
          columns={columns}
          dataSource={reportData.list.map((item, index) => {
            item.key = index;
            return item;
          })}
          pagination={{
            total: reportData.totalCount,
            current: this.state.currentPage,
            onChange: this.onPageChange,
          }}
          title={title}
        />
      );

      return table;
    } else {
      return (
        <PageLoading/>
      );
    }
  }

  render() {
    let { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Form layout="inline" className="login-form">
          <Form.Item label="时间">
            {getFieldDecorator('time', {
              rules: [{ type: 'array', required: true, message: '选择日期' }],
              initialValue: [nowDate, nowDate],
            })(
              <PageRangePicker/>,
            )}
          </Form.Item>
          <Form.Item>
            <Button loading={this.state.loading} onClick={this.onPageChange.bind(this, 1)} type="primary">
              查询
            </Button>
          </Form.Item>
        </Form>
        {this.getTable()}
      </React.Fragment>
    );
  }
}

export default Form.create({ name: 'loginRecord' })(loginRecord);
