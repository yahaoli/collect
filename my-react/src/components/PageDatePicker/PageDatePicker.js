import React from "react";
import { DatePicker } from "antd";
import moment from "moment";
import "./index.less";

let { RangePicker } = DatePicker
  , nowDateEnd = moment().endOf("day");

export class PageRangePicker extends React.Component {
  static defaultProps = {
    allowClear: false,
    format: "YYYY-MM-DD",
    disabledDate(current) {
      return current && current > nowDateEnd;
    }
  };

  render() {
    return (
      <RangePicker {...this.props} />
    );
  }
}

export class PageDatePicker extends React.Component {
  static defaultProps = {
    allowClear: false,
    showToday: false,
    format: "YYYY-MM-DD",
    disabledDate(current) {
      return current && current > nowDateEnd;
    }
  };
  render() {
    return (
      <DatePicker {...this.props}/>
    );
  }
}
