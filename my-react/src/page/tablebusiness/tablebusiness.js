import React, { useState } from 'react';
import { Button, Form, Select, Modal, message } from 'antd';
import { connect } from 'react-redux';
import { PageDatePicker } from '@/components/PageDatePicker/PageDatePicker';
import moment from 'moment';
import {
  getSubUnitList,
  getItemDailyRecordBill,
  getWeatherCodeService,
  updateItemDailyRecordBill,
  updateWeatherService,
} from '@/utils/service';
import PageLoading from '@/components/PageLoading/PageLoading';
import PageTable from '@/components/PageTable/PageTable';
import InputNumberGroup from '@/components/InputNumberGroup/InputNumberGroup';
import { toFixed2 } from '@/utils/utils';
import { weatherFatherStore } from '@/store/storeRequest';
import './index.less';

let { Option } = Select, { confirm } = Modal, nowDate = moment();
let SearchForm = Form.create({
  name: 'searchForm',
  onValuesChange(props) {
    //ant-design框架存在先调用函数再设置数据的问题所以只能延迟执行
    setTimeout(props.onChange, 0);
  },
})((props) => {
  const { getFieldDecorator } = props.form, companyList = props.companyList;
  return (
    <Form layout="inline" className="login-form">
      <Form.Item label='公司'>
        {getFieldDecorator('id', {
          initialValue: companyList[0].unitId + '-' + companyList[0].subUnitId,
          rules: [{ required: true, message: '请选择选择公司' }],
        })(
          <Select style={{ width: 260 }}
                  placeholder="请选择公司">
            {companyList.map(item => <Option key={item.unitId + '-' + item.subUnitId}
                                             value={item.unitId + '-' + item.subUnitId}>{item.subUnitName}</Option>)}
          </Select>,
        )}
      </Form.Item>

      <Form.Item label="时间">
        {getFieldDecorator('recordDate', {
          rules: [{ required: true, message: '请选择选择日期' }],
          initialValue: nowDate,
        })(
          <PageDatePicker/>,
        )}
      </Form.Item>
    </Form>
  );
});
let WeatherForm = Form.create({
  name: 'WeatherForm',
})((props) => {
  let { getFieldDecorator } = props.form
    , { weatherFather, weatherCode, form } = props
    , [fatherId, setFatherId] = useState(weatherCode.fatherId)
    , subList = weatherFather.subList[fatherId]
    , onChange = (value) => {
    setFatherId(value);
    form.setFieldsValue({ code: weatherFather.subList[value][0].weatherTypeId });
  };
  return (
    <Form layout="inline" className="weather-form">
      <Form.Item label='天气情况:'>
        {getFieldDecorator('fatherId', {
          initialValue: fatherId,
          rules: [{ required: true, message: '请选择选择天气' }],
        })(
          <Select style={{ width: 260 }}
                  onChange={onChange}
                  placeholder="请选择天气">
            {weatherFather.fatherList.map(item => <Option key={item.fatherId}
                                                          value={item.fatherId}>{item.fatherName}</Option>)}
          </Select>,
        )}
      </Form.Item>

      <Form.Item>
        {getFieldDecorator('code', {
          rules: [{ required: true, message: '请选择选择天气' }],
          initialValue: weatherCode.code,
        })(
          <Select style={{ width: 260 }}
                  placeholder="请选择天气">
            {subList.map(item => <Option key={item.weatherTypeId}
                                         value={item.weatherTypeId}>{item.weatherName}</Option>)}
          </Select>,
        )}
      </Form.Item>
      <Form.Item>
        <Button onClick={props.submit} type="primary">
          保存
        </Button>
      </Form.Item>
    </Form>
  );
});

class tablebusiness extends React.Component {
  constructor(props) {
    super(props);
    this.searchForm = React.createRef();
    this.weatherForm = React.createRef();
    this.state = {
      companyList: [],
      reportData: [],
      loading: false,
      weatherCode: '',
    };
  }

  componentDidMount() {
    this.getCompany();
  }


  updateWeather(param) {
    updateWeatherService(param).then(res => {

    }).catch(e => {
      console.log(e);
    });
  }

  submit = () => {
    let _this = this, { validate } = this.props.inputNumberGroup;
    Promise.all([this.searchForm.current.validateFieldsAndScroll({ scroll: { offsetTop: 80 } }), this.weatherForm.current.validateFieldsAndScroll()]).then(all => {
      let recordDate = all[0].recordDate.format('YYYY-MM-DD');
      validate() && confirm({
        title: '信息提示',
        content: <React.Fragment><p>当前时间：<span
          className='app-text-warning'>{recordDate}</span></p><p>请仔细核对，确定要提交 ？</p>
        </React.Fragment>,
        onOk() {
          let id = all[0].id.split('-')
            , reportData = _this.state.reportData
            , metaDataList = []
            , weatherParams = {}
            , params = {
            query: {
              unitId: id[0],
              subUnitId: id[1],
              recordDate: recordDate,
            },
          };
          reportData.forEach(item => {
            item.forEach(item => {
              metaDataList.push({
                id: item.id,
                itemId: item.itemId,
                itemName: item.itemName,
                recordValueSync: item.recordValueSync || 0,
                recordValueWrite: item.recordValueWrite || 0,
                recordValue: item.recordValue || 0,
              });
            });
          });
          params.metaDataList = metaDataList;
          weatherParams = { updateTmp: '', updateWeatherId: all[1].code, ...params.query };
          _this.updateWeather(weatherParams);
          updateItemDailyRecordBill(params).then(() => {
            message.success('操作成功');
          }).catch(err => {
            console.log(err);
          });
        },
        onCancel() {
          console.log('Cancel');
        },
      });

    }).catch(err => {
      console.log(err);
    });
  };

  getWeatherCode(query) {
    Promise.all([weatherFatherStore(), getWeatherCodeService(query)]).then(all => {
      this.setState({ weatherCode: all[1] });
    });
  }

  getBusinessList = () => {
    this.searchForm.current.validateFieldsAndScroll((errors, values) => {
      if (!errors) {
        this.setState({ loading: true });
        let id = values.id.split('-'), query = {
          unitId: id[0],
          subUnitId: id[1],
          recordDate: values.recordDate.format('YYYY-MM-DD'),
        };
        this.getWeatherCode(query);
        getItemDailyRecordBill(query).then(res => {
          let reportData = [];
          res.metaDataList.forEach(item => {
            let tempStatus = Number((item.itemId).toString().slice(0, 1)) - 1;
            reportData[tempStatus] ? reportData[tempStatus].push(item) : reportData[tempStatus] = [];
          });
          this.setState({ reportData: reportData, loading: false });
        }).finally(() => {
          this.setState({ loading: false });
        }).catch((err) => {
          console.log(err);
        });
      }
    });
  };

  onChange(value, parentIndex, index) {
    let reportData = this.state.reportData;
    reportData[parentIndex][index].recordValueWrite = value;
    reportData[parentIndex][index].recordValue = value;
    this.setState({ reportData: reportData });
  }

  getTable() {
    let reportData = this.state.reportData, loading = this.state.loading, _this = this,
      countTotal, tFoot, { getInputDecorator } = this.props.inputNumberGroup;
    if (reportData && reportData.length && !loading) {
      let columns, nameMap = ['接待人数', '二消人数', '经营收入'];
      let table = reportData.map((item, parentIndex) => {
        columns = [
          {
            title: '接待人数',
            dataIndex: 'itemName',
            key: 'itemName',
          },
          {
            title: '系统统计',
            dataIndex: 'recordValueSync',
            key: 'recordValueSync',
          },
          {
            title: '人工录入',
            dataIndex: 'recordValueWrite',
            key: 'recordValueWrite',
            width: 200,
            render: (text, record, index) => (
              getInputDecorator({
                defaultValue: text,
                validateType: nameMap[parentIndex] !== '经营收入' ? 'integer' : 'decimal',
                onChange(value) {
                  _this.onChange(value, parentIndex, index);
                },
              })
            ),
          },
          {
            title: '最终上报',
            dataIndex: 'recordValue',
            key: 'recordValue',
          },
        ];
        countTotal = item.reduce((prev, curr) => {

          return prev + (curr.recordValueWrite || 0);

        }, 0);

        let title = () => <div className='app-table-title'>{nameMap[parentIndex]}</div>;
        tFoot = [
          { value: '合计', align: 'right', colspan: 3 },
          { value: parseFloat(toFixed2(countTotal)) },
        ];
        return (
          <PageTable
            key={nameMap[parentIndex]}
            rowKey='itemId'
            columns={columns}
            dataSource={item}
            tFoot={tFoot}
            title={title}
          />
        );
      });
      return (
        <React.Fragment>
          {table}
          {this.state.weatherCode &&
          <WeatherForm ref={this.weatherForm} submit={this.submit}
                       weatherFather={this.props.weatherFather}
                       weatherCode={this.state.weatherCode}/>}
        </React.Fragment>
      );
    } else {
      return (
        <PageLoading/>
      );
    }
  }

  getCompany() {
    getSubUnitList().then(res => {
      this.setState({ companyList: res }, this.getBusinessList);
    }).catch(() => {
    });
  }

  render() {
    let companyList = this.state.companyList;
    return companyList.length ? (
      <div className='table-business'>
        <SearchForm ref={this.searchForm} companyList={companyList} onChange={this.getBusinessList}/>
        {this.getTable()}

      </div>
    ) : <PageLoading/>;
  }
}

function mapState(state) {
  return {
    weatherFather: state.weatherFather,
  };

}

export default InputNumberGroup(connect(mapState)(tablebusiness));

