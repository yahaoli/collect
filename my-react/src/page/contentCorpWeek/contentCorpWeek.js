import React from 'react';
import { Form, Select, Button } from 'antd';
import { getCompanyList, getCorpBusinessReportdata } from '@/utils/service';
import PageTable from '@/components/PageTable/PageTable';
import { toFixed2, getWeekLast } from '@/utils/utils';
import PageLoading from '@/components/PageLoading/PageLoading';
import { PageRangePicker } from '@/components/PageDatePicker/PageDatePicker';
import './index.less';

let { Option } = Select, weekLast = getWeekLast();

class contentCorpWeek extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companyList: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.getCompany();
    this.search();
  }

  search = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.setState({ loading: true });
        let query = {
          corpList: values.corpList,
          startDate: values.time[0].format('YYYY-MM-DD'),
          endDate: values.time[1].format('YYYY-MM-DD'),
        };
        getCorpBusinessReportdata(query).then(res => {
          this.setState({ reportData: res, loading: false });
        }).finally(() => {
          this.setState({ loading: false });
        }).catch(() => {
        });
      }
    });
  };

  getCompany() {
    getCompanyList([1, 3]).then(res => {
      this.setState({ companyList: res });
    }).catch(() => {
    });
  }

  getTable() {
    let reportData = this.state.reportData, loading = this.state.loading;

    if (reportData && !loading) {
      let columns, table;
      columns = [
        {
          title: '序号',
          dataIndex: 'corpId',
          key: 'corpId',
          width: 100,
          render: (text, record, index) => index + 1,
        },
        {
          title: '公司',
          dataIndex: 'corpName',
          key: 'corpName',
        },
        {
          title: '年度指标（元）',
          dataIndex: 'planValue',
          key: 'planValue',
          sorter: (a, b) => a.planValue - b.planValue,
          render: (text) => toFixed2(text),
        },
        {
          title: '本周实际完成（元）',
          dataIndex: 'weeklyValue',
          key: 'weeklyValue',
          sorter: (a, b) => a.weeklyValue - b.weeklyValue,
          render: (text) => toFixed2(text),
        },
        {
          title: '本年累计完成（元）',
          dataIndex: 'accumulatedOfYear',
          key: 'accumulatedOfYear',
          sorter: (a, b) => a.accumulatedOfYear - b.accumulatedOfYear,
          render: (text) => toFixed2(text),
        },
        {
          title: '上一年同期（元）',
          dataIndex: 'accumulatedOfLastYear',
          key: 'accumulatedOfLastYear',
          sorter: (a, b) => a.accumulatedOfLastYear - b.accumulatedOfLastYear,
          render: (text) => toFixed2(text),
        },
        {
          title: '同期比',
          dataIndex: 'compare',
          key: 'compare',
          sorter: (a, b) => Number(a.compare.replace(/%/g, '')) - Number(b.compare.replace(/%/g, '')),
          render: (text) => toFixed2(text),
        },
      ];
      let title = () => <div className='app-table-title'>内容公司周报</div>;
      table = (
        <PageTable
          columns={columns}
          dataSource={reportData.dataList}
          rowKey='corpId'
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
    let companyList = this.state.companyList, { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Form layout="inline" className="login-form">
          <Form.Item label='公司'>
            {getFieldDecorator('corpList', {
              initialValue: [],
            })(
              <Select mode="multiple" maxTagTextLength={4} maxTagCount={2} loading={companyList.length === 0}
                      style={{ width: 260 }}
                      placeholder="请选择公司">
                {companyList.length && companyList.map(item => <Option key={item.corpId}
                                                                       value={item.corpId}>{item.name}</Option>)}
              </Select>,
            )}
          </Form.Item>
          <Form.Item label='查询模式'>
            {getFieldDecorator('type', {
              rules: [{ required: true, message: '请选择查询模式' }],
              initialValue: '0',
            })(
              <Select style={{ width: 100 }} placeholder="Select a person">
                <Option value="0">周</Option>
              </Select>,
            )}
          </Form.Item>
          <Form.Item label="时间">
            {getFieldDecorator('time', {
              rules: [{ type: 'array', required: true, message: '选择日期' }],
              initialValue: weekLast,
            })(
              <PageRangePicker/>,
            )}
          </Form.Item>
          <Form.Item>
            <Button loading={this.state.loading} onClick={this.search} type="primary">
              查询
            </Button>
          </Form.Item>
        </Form>
        {this.getTable()}
      </React.Fragment>
    );
  }
}

export default Form.create({ name: 'contentCorpWeek' })(contentCorpWeek);
