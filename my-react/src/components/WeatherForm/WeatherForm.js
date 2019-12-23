import React from "react";
import { Form, Select } from "antd";
import { connect } from "react-redux";
import { weatherFatherStore } from "@/store/storeRequest";

const { Option } = Select;

class WeatherForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fatherId: props.weatherCode.fatherId,
      weatherFather: {}
    };
  }

  setFatherId = (value) => {
    let { weatherFather, form } = this.props;
    this.setState({ fatherId: value });
    form.setFieldsValue({ code: weatherFather.subList[value][0].weatherTypeId });
  };

  componentDidMount() {
    weatherFatherStore()
  }

  render() {
    let { fatherId } = this.state
      , { weatherCode, weatherFather } = this.props;
    if (weatherFather.fatherList) {
      let { getFieldDecorator } = this.props.form
        , subList = weatherFather.subList[fatherId];
      return (
        <Form layout="inline" className="weather-form">
          <Form.Item label='天气情况:'>
            {getFieldDecorator("fatherId", {
              initialValue: fatherId,
              rules: [{ required: true, message: "请选择选择天气" }]
            })(
              <Select style={{ width: 150 }}
                      onChange={this.setFatherId}
                      placeholder="请选择天气">
                {weatherFather.fatherList.map(item => <Option key={item.fatherId}
                                                              value={item.fatherId}>{item.fatherName}</Option>)}
              </Select>
            )}
          </Form.Item>

          <Form.Item>
            {getFieldDecorator("code", {
              rules: [{ required: true, message: "请选择选择天气" }],
              initialValue: weatherCode.code
            })(
              <Select style={{ width: 150 }}
                      placeholder="请选择天气">
                {subList.map(item => <Option key={item.weatherTypeId}
                                             value={item.weatherTypeId}>{item.weatherName}</Option>)}
              </Select>
            )}
          </Form.Item>
        </Form>
      );
    }
    return "";
  }
}

function mapState(state) {
  return {
    weatherFather: state.weatherFather
  };
}

export default Form.create({
  name: "WeatherForm"
})(connect(mapState)(WeatherForm));
