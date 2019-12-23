import React from "react";
import moment from "moment";

import "./index.less";
import { Button } from "antd";

/**
 * 基于antd form的日期快捷选择
 */
class TimeShortcutKeys extends React.Component {
  timeChange(type) {
    let { form, timeKey } = this.props, nowDate = moment(), option = {},
      currentTime = moment(form.getFieldValue(timeKey));
    switch (type) {
      case 1:
        currentTime.subtract(1, "days");
        break;
      case 2:
        currentTime.add(1, "days");
        break;
      case 3:
        currentTime = nowDate.subtract(1, "days");
        break;
      case 4:
        currentTime.subtract(1, "years");
        break;
      default:
        currentTime = nowDate;
        break;
    }
    option[timeKey] = currentTime;
    form.setFieldsValue(option);
  }


  render() {
    let nowDate = moment().subtract(1, "days"), time = this.props.form.getFieldValue(this.props.timeKey);
    return (
      <Button.Group size='small'>
        <Button type="link" onClick={this.timeChange.bind(this, 1)}>
          前一天
        </Button>
        <Button disabled={!nowDate.isAfter(time)} type="link" onClick={this.timeChange.bind(this, 2)}>
          后一天
        </Button>
        <Button type="link" onClick={this.timeChange.bind(this, 3)}>
          昨天
        </Button>
        <Button type="link" onClick={this.timeChange.bind(this, 4)}>
          去年同期
        </Button>
      </Button.Group>
    );
  }
}

export default TimeShortcutKeys;
