import React from "react";
import "./index.less";
import { Select, Form, Modal, Button, message, Upload } from "antd";
import moment from "moment";
import {
  getCompanyList,
  getUnitDailyRecordCacheService,
  updateUnitDailyRecordService,
  templateImportService,
  getTemplateService
} from "@/utils/service";
import { PageDatePicker } from "@/components/PageDatePicker/PageDatePicker";
import PageTable from "@/components/PageTable/PageTable";
import PageLoading from "@/components/PageLoading/PageLoading";
import InputNumberGroup from "@/components/InputNumberGroup/InputNumberGroup";
import TimeShortcutKeys from "@/components/TimeShortcutKeys/TimeShortcutKeys";
import WeatherForm from "@/components/WeatherForm/WeatherForm";
import DownLoadExcel from "@/components/DownLoadExcel/DownLoadExcel";
import { toFixed2 } from "@/utils/utils";

let { Option } = Select, { confirm } = Modal, nowDate = moment();

let SearchForm = Form.create({
  name: "searchForm",
  onValuesChange(props) {
    //ant-design框架存在先调用函数再设置数据的问题所以只能延迟执行
    setTimeout(props.onChange, 0);
  }
})(React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => (props.form));
  let { getFieldDecorator } = props.form, { submit } = props, companyList = props.companyList, upload = {
    beforeUpload: (file) => {
      var name = file.name.substr(file.name.lastIndexOf("."));
      if (name !== ".xls" && name !== ".xlsx") {
        message.warning("选择Excel格式的文件导入");
      } else {
        let formData = new FormData();
        formData.append("file", file);
        formData.append("corpId", props.form.getFieldValue("id"));
        formData.append("type", "item");
        templateImportService(formData).then(res => {
          if (res.code === 200) {
            message.success("导入成功");
            props.onChange();
          } else {
            message.warning(res.message);
          }
        });
      }
      return false;
    }
    , name: "file",
    showUploadList: false
  }, templateClick = (type) => {
    if (type === 1) {
      let corpId = props.form.getFieldValue("id");
      getTemplateService({
        "corpId": corpId,
        "type": "item"
      }).then(res => {
        let len = res.baseList.length, msg = (<div>
          {res.baseList.map((item, index) => {
            return <p key={index}>{index + 1}.{item.itemName}，示例：{item.demo}</p>;
          })}
          {res.itemList.map((item, index) => {
            return <p key={index}>{index + 1 + len}.{item.itemName}，示例：{item.demo}</p>;
          })}
        </div>);
        confirm({
          title: "提示",
          okText: "模板下载",
          content: msg,
          onOk() {
            let query = {
              "corpId": corpId,
              "type": "item"
            };
            DownLoadExcel({ url: "/computer/api/download/templateDown", data: query });
          },
          onCancel() {

          }
        });
      }).catch(err => {
        console.log(err);
      });

    }
  };
  return (
    <Form layout="inline" className="login-form">
      <Form.Item label='公司'>
        {getFieldDecorator("id", {
          initialValue: companyList[0].corpId,
          rules: [{ required: true, message: "请选择选择公司" }]
        })(
          <Select style={{ width: 260 }}
                  placeholder="请选择公司">
            {companyList.map(item => <Option key={item.corpId}
                                             value={item.corpId}>{item.name}</Option>)}
          </Select>
        )}
      </Form.Item>

      <Form.Item label="时间">
        {getFieldDecorator("recordDate", {
          rules: [{ required: true, message: "请选择选择日期" }],
          initialValue: nowDate
        })(
          <PageDatePicker/>
        )}
      </Form.Item>
      <Form.Item>
        <TimeShortcutKeys form={props.form} timeKey='recordDate'/>
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={submit}>
          保存
        </Button>
      </Form.Item>
      <Form.Item>
        <Upload {...upload}>
          <Button icon="upload" type="primary">
            导入
          </Button>
        </Upload>
      </Form.Item>
      <Form.Item style={{ float: "right" }}>
        <Button icon="download" onClick={templateClick.bind(null, 1)} type="primary">
          导出模板
        </Button>
      </Form.Item>
    </Form>
  );
}));

class checkoutChannel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companyList: [],
      reportData: [],
      isEdit: "init",
      weatherCode: "",
      searchFormPrev: {},
      loading: false,
      weatherVisible: false
    };
    this.searchForm = React.createRef();
    this.weatherForm = React.createRef();
  }

  componentDidMount() {
    this.getCompany();
  }

  modalToggle = () => {
    let { weatherVisible } = this.state;
    this.setState({ weatherVisible: !weatherVisible });
  };
  submit = (type) => {
    if (type === 1) {
      this.searchForm.validateFieldsAndScroll((errors, values) => {
        if (!errors) {
          let { validate } = this.props.inputNumberGroup;
          validate() && this.modalToggle();
        }
      });
    } else {
      this.weatherForm.current.validateFieldsAndScroll((errors, values) => {
        let { id, recordDate } = this.searchForm.getFieldsValue(), { weatherCode, reportData } = this.state;
        let itemDataList = [], query = {
          query: {
            corpId: id,
            startDate: recordDate,
            endDate: recordDate
          },
          dataList: [{
            channelDataList: [],
            itemDataList: itemDataList,
            "weather": {
              "id": weatherCode.id,//id
              "corpId": id,//公司id
              "code": values.code,//天气码
              "fatherId": values.fatherId,//父级id
              "tmp": weatherCode.tmp//温度
            }
          }]
        };
        reportData.forEach((item) => {
          itemDataList.push({
            itemId: item.itemId,
            id: item.id,
            itemName: item.itemName,
            moneyValueHandle: item.moneyValueHandle,
            countValueHandle: item.countValueHandle
          });
        });
        updateUnitDailyRecordService(query).then(res => {
          if (res) {
            message.success("保存成功");
            this.modalToggle();
          } else {
            message.error("保存失败");
          }
        }).catch(e => {
          console.log(e);
        });
      });
    }
  };

  getCompany() {
    getCompanyList([2]).then(res => {
      this.setState({ companyList: res }, this.search);
    }).catch(() => {
    });
  }

  getTableData = () => {
    this.searchForm.validateFieldsAndScroll((errors, values) => {
      if (!errors) {
        let time = values.recordDate.format("YYYY-MM-DD");
        this.setState({ loading: true, searchFormPrev: values });
        getUnitDailyRecordCacheService({
          corpId: values.id,
          startDate: time,
          endDate: time,
          type: "item"
        }).then(res => {
          this.setState({ reportData: res.dataList[0].channelDataList, weatherCode: res.dataList[0].weather });
        }).finally(() => {
          this.setState({ loading: false });
        });
      }
    });
  };
  search = () => {
    let _this = this, { isEdit } = this.state;
    if (isEdit === "edit") {
      confirm({
        title: "提示",
        content: "您有数据未保存，是否保存数据？",
        onOk() {
          _this.setState({ isEdit: "reset" });
          _this.searchForm.setFieldsValue(_this.state.searchFormPrev, () => {
            _this.submit(1);
          });
        },
        onCancel() {
          _this.setState({ isEdit: "init" });
          _this.getTableData();
        }
      });
    } else if (isEdit === "reset") {
      _this.setState({ isEdit: "init" });
    } else if (this.state.isEdit === "init") {
      this.getTableData();
    }
  };

  onChange(value, index, key) {
    let reportData = this.state.reportData;
    reportData[index][key] = value;
    this.setState({ reportData: reportData, isEdit: "edit" });
  }

  getTable() {
    let reportData = this.state.reportData, loading = this.state.loading, _this = this,
      countTotal = {
        moneyValueAutoTotal: 0,
        countValueAutoTotal: 0,
        moneyValueHandleTotal: 0,
        countValueHandleTotal: 0,
        moneyValueTotal: 0,
        countValueTotal: 0
      }, tFoot, { getInputDecorator } = this.props.inputNumberGroup;
    if (reportData && reportData.length && !loading) {

      let columns = [
        {
          title: "项目",
          dataIndex: "itemName"
        },
        {
          title: "系统收入（元）",
          dataIndex: "moneyValueAuto"
        },
        {
          title: "系统人数",
          dataIndex: "countValueAuto"
        },
        {
          title: "人工收入（元）",
          dataIndex: "moneyValueHandle",
          width: 200,
          render: (text, record, index) => (
            getInputDecorator({
              defaultValue: text || "",
              validateType: "decimal",
              placeholder: "请输入数据（选填）",
              onChange(value) {
                _this.onChange(value, index, "moneyValueHandle");
              }
            })
          )
        },
        {
          title: "人工人数",
          dataIndex: "countValueHandle",
          width: 200,
          render: (text, record, index) => (
            getInputDecorator({
              defaultValue: text || "",
              placeholder: "请输入数据（选填）",
              validateType: "integer",
              onChange(value) {
                _this.onChange(value, index, "countValueHandle");
              }
            })
          )
        },
        {
          title: "最终收入（元）",
          dataIndex: "moneyValue"
        },
        {
          title: "最终人数",
          dataIndex: "countValue"
        }
      ];
      countTotal = reportData.reduce((prev, curr) => {
        prev.moneyValueAutoTotal += curr.moneyValueAuto || 0;
        prev.countValueAutoTotal += curr.countValueAuto || 0;
        prev.moneyValueHandleTotal += curr.moneyValueHandle || 0;
        prev.countValueHandleTotal += curr.countValueHandle || 0;
        prev.moneyValueTotal += curr.moneyValue || 0;
        prev.countValueTotal += curr.countValue || 0;
        return prev;

      }, countTotal);

      let title = () => <div className='app-table-title'>业务数据</div>;
      tFoot = [
        { value: "合计", align: "right" },
        { value: parseFloat(toFixed2(countTotal.moneyValueAutoTotal)) },
        { value: parseFloat(toFixed2(countTotal.countValueAutoTotal)) },
        { value: parseFloat(toFixed2(countTotal.moneyValueHandleTotal)) },
        { value: parseFloat(toFixed2(countTotal.countValueHandleTotal)) },
        { value: parseFloat(toFixed2(countTotal.moneyValueTotal)) },
        { value: parseFloat(toFixed2(countTotal.countValueTotal)) }
      ];
      return (
        <PageTable
          rowKey='itemId'
          columns={columns}
          dataSource={reportData}
          tFoot={tFoot}
          title={title}
        />
      );
    } else {
      return (
        <PageLoading/>
      );
    }
  }

  render() {
    let { companyList, weatherCode } = this.state;
    return (
      <React.Fragment>
        {companyList.length > 0 &&
        <SearchForm wrappedComponentRef={(form) => this.searchForm = form} companyList={companyList}
                    onChange={this.search} submit={this.submit.bind(this, 1)}/>}
        {this.getTable()}
        <Modal
          title="信息提示"
          visible={this.state.weatherVisible}
          onOk={this.submit.bind(this, 2)}
          onCancel={this.modalToggle}
        >
          <WeatherForm
            ref={this.weatherForm}
            weatherCode={weatherCode}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

export default InputNumberGroup(checkoutChannel);

