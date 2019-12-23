import React from 'react';
import { Form, Select, Icon, Dropdown, Button, Menu } from 'antd';
import { getCompanyList, getUnitBusinessReportdata } from '@/utils/service';
import { connect } from 'react-redux';
import PageTable from '@/components/PageTable/PageTable';
import { toFixed2, getWeekLast } from '@/utils/utils';
import PageLoading from '@/components/PageLoading/PageLoading';
import { PageRangePicker } from '@/components/PageDatePicker/PageDatePicker';
import './index.less';

let { Option } = Select, weekLast = getWeekLast();

function getIndex(arr, item, key) {
  var index = -1;
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i][key] === item) {
      index = i;
      break;
    }
  }
  return index;
}

function formatData(data) {
  let currentData = [], formatArr = [], countTotal = {
    countPlan: 0,
    moneyPlan: 0,
    countWeekly: 0,
    moneyWeekly: 0,
    countOfYear: 0,
    moneyOfYear: 0,
    countOfLastYear: 0,
    moneyOfLastYear: 0,
    countOfCompare: 0,
    moneyOfCompare: 0,
    countWeeklyOfLastYear: 0,
    moneyWeeklyOfLastYear: 0,
    countWeeklyOfCompare: 0,
    moneyWeeklyOfCompare: 0,
  };
  data.forEach(function(item) {
    item.key = item.itemId;
    countTotal.countPlan += item.countPlan || 0;
    countTotal.moneyPlan += item.moneyPlan || 0;
    countTotal.countWeekly += item.countWeekly || 0;
    countTotal.moneyWeekly += item.moneyWeekly || 0;
    countTotal.countOfYear += item.countOfYear || 0;
    countTotal.moneyOfYear += item.moneyOfYear || 0;
    countTotal.countOfLastYear += item.countOfLastYear || 0;
    countTotal.moneyOfLastYear += item.moneyOfLastYear || 0;
    countTotal.countWeeklyOfLastYear += item.countWeeklyOfLastYear || 0;
    countTotal.moneyWeeklyOfLastYear += item.moneyWeeklyOfLastYear || 0;
    var currentIndex = getIndex(currentData, item.fatherId, 'fatherId');
    if (currentIndex > -1) {
      currentData[currentIndex].arr.push(item);
    } else {
      currentData.push({ fatherId: item.fatherId, fatherName: item.fatherName, arr: [item] });
    }
  });
  countTotal.countOfCompare = toFixed2(countTotal.countOfLastYear === 0 ? 0 : (countTotal.countOfYear - countTotal.countOfLastYear) / countTotal.countOfLastYear * 100) + '%';
  countTotal.moneyOfCompare = toFixed2(countTotal.moneyOfLastYear === 0 ? 0 : (countTotal.moneyOfYear - countTotal.moneyOfLastYear) / countTotal.moneyOfLastYear * 100) + '%';
  countTotal.countWeeklyOfCompare = toFixed2(countTotal.countWeeklyOfLastYear === 0 ? 0 : (countTotal.countWeekly - countTotal.countWeeklyOfLastYear) / countTotal.countWeeklyOfLastYear * 100) + '%';
  countTotal.moneyWeeklyOfCompare = toFixed2(countTotal.moneyWeeklyOfLastYear === 0 ? 0 : (countTotal.moneyWeekly - countTotal.moneyWeeklyOfLastYear) / countTotal.moneyWeeklyOfLastYear * 100) + '%';

  currentData.forEach(item => {
    item.arr[0].rowspan = item.arr.length;
    formatArr = formatArr.concat(item.arr);
  });
  return {
    formatArr, countTotal,
  };
}

class unitWeek extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companyList: [],
      reportData: '',
      menuType: 'all',
      loading: false,
    };
  }

  getCompany() {
    getCompanyList().then(res => {
      this.setState({ companyList: res });
    }).catch(() => {
    });
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
        getUnitBusinessReportdata(query).then(res => {
          this.setState({ reportData: res, loading: false });
        }).finally(() => {
          this.setState({ loading: false });
        }).catch(() => {
        });
      }
    });
  };

  getTable() {
    let reportData = this.state.reportData, loading = this.state.loading, countTotal, tFoot;

    if (reportData && !loading) {
      let columns,
        menuType = this.state.menuType, data,
        menuName = '', table, menu = (
          <Menu onClick={this.tableMenuClick} selectedKeys={[menuType]}>
            <Menu.Item key='all'>
              所有景区
            </Menu.Item>
            {reportData.unitDataList.map((item, index) =>
              <Menu.Item key={index}>
                {item.corpName}
              </Menu.Item>,
            )}
          </Menu>
        ), getMenu = () => {
          return (
            <div className='app-margin-top15'>
              <Dropdown overlay={menu} trigger={['click']}>
                <span className='app-cursor'>
                  {menuName} <Icon type="down"/>
                </span>
              </Dropdown>
            </div>
          );
        };
      if (menuType === 'all') {
        columns = [
          {
            title: '序号',
            dataIndex: 'corpId',
            key: 'corpId',
            width: 60,
            render: (text, record, index) => {
              return index + 1;
            },
          },
          {
            title: '景区',
            dataIndex: 'corpName',
            key: 'corpName',
          },
          {
            title: '年度指标',
            children: [
              {
                title: '人数',
                dataIndex: 'countPlan',
                key: 'countPlan',
                sorter: (a, b) => {
                  return a.countPlan - b.countPlan;
                },
                render: (text) => toFixed2(text),
              },
              {
                title: '收入',
                dataIndex: 'moneyPlan',
                key: 'moneyPlan',
                sorter: (a, b) => a.moneyPlan - b.moneyPlan,
                render: (text) => toFixed2(text),
              },
            ],
          },
          {
            title: '本周实际完成',
            children: [
              {
                title: '人数',
                dataIndex: 'countWeekly',
                key: 'countWeekly',
                sorter: (a, b) => a.countWeekly - b.countWeekly,
                render: (text) => toFixed2(text),
              },
              {
                title: '收入',
                dataIndex: 'moneyWeekly',
                key: 'moneyWeekly',
                sorter: (a, b) => a.moneyWeekly - b.moneyWeekly,
                render: (text) => toFixed2(text),
              },
            ],
          },
          {
            title: '本年累计完成',
            children: [
              {
                title: '人数',
                dataIndex: 'countOfYear',
                key: 'countOfYear',
                sorter: (a, b) => a.countOfYear - b.countOfYear,
                render: (text) => toFixed2(text),
              },
              {
                title: '收入',
                dataIndex: 'moneyOfYear',
                key: 'moneyOfYear',
                sorter: (a, b) => a.moneyOfYear - b.moneyOfYear,
                render: (text) => toFixed2(text),
              },
            ],
          },
          {
            title: '2018同期',
            children: [
              {
                title: '人数',
                dataIndex: 'countOfLastYear',
                key: 'countOfLastYear',
                sorter: (a, b) => a.countOfLastYear - b.countOfLastYear,
                render: (text) => toFixed2(text),
              },
              {
                title: '收入',
                dataIndex: 'moneyOfLastYear',
                key: 'moneyOfLastYear',
                sorter: (a, b) => a.moneyOfLastYear - b.moneyOfLastYear,
                render: (text) => toFixed2(text),
              },
            ],
          },
          {
            title: '同期比',
            children: [
              {
                title: '人数',
                dataIndex: 'countOfCompare',
                key: 'countOfCompare',
                sorter: (a, b) => Number(a.countOfCompare.replace(/%/g, '')) - Number(b.countOfCompare.replace(/%/g, '')),
              },
              {
                title: '收入',
                dataIndex: 'moneyOfCompare',
                key: 'moneyOfCompare',
                sorter: (a, b) => Number(a.moneyOfCompare.replace(/%/g, '')) - Number(b.moneyOfCompare.replace(/%/g, '')),
              },
            ],
          },
        ];
        countTotal = {
          countOfCompare: 0,
          countOfLastYear: 0,
          countOfYear: 0,
          countPlan: 0,
          countWeekly: 0,
          moneyOfCompare: 0,
          moneyOfLastYear: 0,
          moneyOfYear: 0,
          moneyPlan: 0,
          moneyWeekly: 0,
        };
        data = reportData.unitTotalDataList.map((item) => {
          item.key = item.corpId;
          countTotal.countPlan += item.countPlan || 0;
          countTotal.moneyPlan += item.moneyPlan || 0;
          countTotal.countWeekly += item.countWeekly || 0;
          countTotal.moneyWeekly += item.moneyWeekly || 0;
          countTotal.countOfYear += item.countOfYear || 0;
          countTotal.moneyOfYear += item.moneyOfYear || 0;
          countTotal.countOfLastYear += item.countOfLastYear || 0;
          countTotal.moneyOfLastYear += item.moneyOfLastYear || 0;
          return item;
        });
        countTotal.countOfCompare = toFixed2(countTotal.countOfLastYear === 0 ? 0 : (countTotal.countOfYear - countTotal.countOfLastYear) / countTotal.countOfLastYear * 100) + '%';
        countTotal.moneyOfCompare = toFixed2(countTotal.moneyOfLastYear === 0 ? 0 : (countTotal.moneyOfYear - countTotal.moneyOfLastYear) / countTotal.moneyOfLastYear * 100) + '%';
        menuName = '所有景区';
        let title = () => <div className='app-table-title'>收入（万元），人数（万）</div>;
        tFoot = [
          { value: '总计', align: 'right', colspan: 2 },
          { value: toFixed2(countTotal.countPlan) },
          { value: toFixed2(countTotal.moneyPlan) },
          { value: toFixed2(countTotal.countWeekly) },
          { value: toFixed2(countTotal.moneyWeekly) },
          { value: toFixed2(countTotal.countOfYear) },
          { value: toFixed2(countTotal.moneyOfYear) },
          { value: toFixed2(countTotal.countOfLastYear) },
          { value: toFixed2(countTotal.moneyOfLastYear) },
          { value: countTotal.countOfCompare },
          { value: countTotal.moneyOfCompare },
        ];
        table = (
          <PageTable
            columns={columns}
            dataSource={data}
            tFoot={tFoot}
            title={title}
          />
        );

      } else {
        let currentData = reportData.unitDataList[menuType],
          itemColumns = [
            {
              title: '项目',
              dataIndex: 'fatherName',
              key: 'fatherName',
              colSpan: 2,
              render: (value, row) => {
                const obj = {
                  children: value,
                  props: {
                    rowSpan: row.rowspan || 0,
                  },
                };
                return obj;
              },
            },
            {
              title: '景区',
              dataIndex: 'itemName',
              key: 'itemName',
              colSpan: 0,
            },
            {
              title: '年度指标',
              children: [
                {
                  title: '人数',
                  dataIndex: 'countPlan',
                  key: 'countPlan',
                  render: (text) => toFixed2(text),
                },
                {
                  title: '收入',
                  dataIndex: 'moneyPlan',
                  key: 'moneyPlan',
                  render: (text) => toFixed2(text),
                },
              ],
            },
            {
              title: '本周实际完成',
              children: [
                {
                  title: '人数',
                  dataIndex: 'countWeekly',
                  key: 'countWeekly',
                  render: (text) => toFixed2(text),
                },
                {
                  title: '收入',
                  dataIndex: 'moneyWeekly',
                  key: 'moneyWeekly',
                  render: (text) => toFixed2(text),
                },
              ],
            },
            {
              title: '本年累计完成',
              children: [
                {
                  title: '人数',
                  dataIndex: 'countOfYear',
                  key: 'countOfYear',
                  render: (text) => toFixed2(text),
                },
                {
                  title: '收入',
                  dataIndex: 'moneyOfYear',
                  key: 'moneyOfYear',
                  render: (text) => toFixed2(text),
                },
              ],
            },
            {
              title: '2018同期',
              children: [
                {
                  title: '人数',
                  dataIndex: 'countOfLastYear',
                  key: 'countOfLastYear',
                  render: (text) => toFixed2(text),
                },
                {
                  title: '收入',
                  dataIndex: 'moneyOfLastYear',
                  key: 'moneyOfLastYear',
                  render: (text) => toFixed2(text),
                },
              ],
            },
            {
              title: '同期比',
              children: [
                {
                  title: '人数',
                  dataIndex: 'countOfCompare',
                  key: 'countOfCompare',
                },
                {
                  title: '收入',
                  dataIndex: 'moneyOfCompare',
                  key: 'moneyOfCompare',
                },
              ],
            },
            {
              title: '2018周同期',
              children: [
                {
                  title: '人数',
                  dataIndex: 'countWeeklyOfLastYear',
                  key: 'countWeeklyOfLastYear',
                  render: (text) => toFixed2(text),
                },
                {
                  title: '收入',
                  dataIndex: 'moneyWeeklyOfLastYear',
                  key: 'moneyWeeklyOfLastYear',
                  render: (text) => toFixed2(text),
                },
              ],
            },
            {
              title: '周同期比',
              children: [
                {
                  title: '人数',
                  dataIndex: 'countWeeklyOfCompare',
                  key: 'countWeeklyOfCompare',
                },
                {
                  title: '收入',
                  dataIndex: 'moneyWeeklyOfCompare',
                  key: 'moneyWeeklyOfCompare',
                },
              ],
            },
          ],
          channelColumns = [
            {
              title: '渠道',
              dataIndex: 'itemName',
              key: 'itemName',
            },
            {
              title: '今年',
              children: [
                {
                  title: '本周人数',
                  dataIndex: 'countWeekly',
                  key: 'countWeekly',
                  sorter: (a, b) => a.countWeekly - b.countWeekly,
                  render: (text) => toFixed2(text),
                },
                {
                  title: '本周收入',
                  dataIndex: 'moneyWeekly',
                  key: 'moneyWeekly',
                  sorter: (a, b) => a.moneyWeekly - b.moneyWeekly,
                  render: (text) => toFixed2(text),
                },
                {
                  title: '今年人数',
                  dataIndex: 'countOfYear',
                  key: 'countOfYear',
                  sorter: (a, b) => a.countOfYear - b.countOfYear,
                  render: (text) => toFixed2(text),
                },
                {
                  title: '今年收入',
                  dataIndex: 'moneyOfYear',
                  key: 'moneyOfYear',
                  sorter: (a, b) => a.moneyOfYear - b.moneyOfYear,
                  render: (text) => toFixed2(text),
                },
              ],
            },
            {
              title: '2018同期',
              children: [
                {
                  title: '人数',
                  dataIndex: 'countOfLastYear',
                  key: 'countOfLastYear',
                  sorter: (a, b) => a.countOfLastYear - b.countOfLastYear,
                  render: (text) => toFixed2(text),
                },
                {
                  title: '收入',
                  dataIndex: 'moneyOfLastYear',
                  key: 'moneyOfLastYear',
                  sorter: (a, b) => a.moneyOfLastYear - b.moneyOfLastYear,
                  render: (text) => toFixed2(text),
                },
              ],
            },
            {
              title: '同期比',
              children: [
                {
                  title: '人数',
                  dataIndex: 'countOfCompare',
                  key: 'countOfCompare',
                },
                {
                  title: '收入',
                  dataIndex: 'moneyOfCompare',
                  key: 'moneyOfCompare',
                },
              ],
            },
          ];
        menuName = currentData.corpName;
        countTotal = {
          countWeekly: 0,
          moneyWeekly: 0,
          countOfYear: 0,
          moneyOfYear: 0,
          countOfLastYear: 0,
          moneyOfLastYear: 0,
          countOfCompare: 0,
          moneyOfCompare: 0,
        };
        if (!currentData.newItemDataList) {
          currentData.newItemDataList = formatData(currentData.itemDataList);
        }
        let itemTitle = () => <div className='app-table-title'>{menuName}业务数据（收入（万元），人数（万））</div>
          , channelTitle = () => <div className='app-table-title'>{menuName}渠道数据（收入（万元），人数（万））</div>;
        currentData.channelDataList.forEach(item => {
          item.key = item.itemId;
          countTotal.countWeekly += item.countWeekly || 0;
          countTotal.moneyWeekly += item.moneyWeekly || 0;
          countTotal.countOfYear += item.countOfYear || 0;
          countTotal.moneyOfYear += item.moneyOfYear || 0;
          countTotal.countOfLastYear += item.countOfLastYear || 0;
          countTotal.moneyOfLastYear += item.moneyOfLastYear || 0;
        });
        countTotal.countOfCompare = toFixed2(countTotal.countOfLastYear === 0 ? 0 : (countTotal.countOfYear - countTotal.countOfLastYear) / countTotal.countOfLastYear * 100) + '%';
        countTotal.moneyOfCompare = toFixed2(countTotal.moneyOfLastYear === 0 ? 0 : (countTotal.moneyOfYear - countTotal.moneyOfLastYear) / countTotal.moneyOfLastYear * 100) + '%';
        tFoot = [
          { value: '小计' },
          { value: toFixed2(countTotal.countWeekly) },
          { value: toFixed2(countTotal.moneyWeekly) },
          { value: toFixed2(countTotal.countOfYear) },
          { value: toFixed2(countTotal.moneyOfYear) },
          { value: toFixed2(countTotal.countOfLastYear) },
          { value: toFixed2(countTotal.moneyOfLastYear) },
          { value: countTotal.countOfCompare },
          { value: countTotal.moneyOfCompare },
        ];
        let countTotalItem = currentData.newItemDataList.countTotal, tFootItem = [
          { value: '小计', align: 'right', colspan: 2 },
          { value: toFixed2(countTotalItem.countPlan) },
          { value: toFixed2(countTotalItem.moneyPlan) },
          { value: toFixed2(countTotalItem.countWeekly) },
          { value: toFixed2(countTotalItem.moneyWeekly) },
          { value: toFixed2(countTotalItem.countOfYear) },
          { value: toFixed2(countTotalItem.moneyOfYear) },
          { value: toFixed2(countTotalItem.countOfLastYear) },
          { value: toFixed2(countTotalItem.moneyOfLastYear) },
          { value: countTotalItem.countOfCompare },
          { value: countTotalItem.moneyOfCompare },
          { value: toFixed2(countTotalItem.countWeeklyOfLastYear) },
          { value: toFixed2(countTotalItem.moneyWeeklyOfLastYear) },
          { value: countTotalItem.countWeeklyOfCompare },
          { value: countTotalItem.moneyWeeklyOfCompare },
        ];
        table = (
          <React.Fragment>
            <PageTable
              columns={itemColumns}
              title={itemTitle}
              tFoot={tFootItem}
              dataSource={currentData.newItemDataList.formatArr}
            />
            <PageTable
              columns={channelColumns}
              tFoot={tFoot}
              title={channelTitle}
              dataSource={currentData.channelDataList}
            />
          </React.Fragment>
        );
      }
      return (
        <React.Fragment>
          {getMenu()}
          {table}
        </React.Fragment>
      );
    } else {
      return (
        <PageLoading/>
      );
    }

  }

  tableMenuClick = (e) => {
    this.setState({
      menuType: e.key,
    });
  };


  render() {
    let { getFieldDecorator } = this.props.form
      , companyList = this.state.companyList;
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

function mapState(state) {
  return {
    weatherFather: state.weatherFather,
  };

}

export default Form.create({ name: 'unitWeek' })(connect(mapState)(unitWeek));
;
