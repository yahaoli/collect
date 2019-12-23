import React from 'react';
import { numTo2, integer, isHaveJson, isNull } from '@/utils/utils';
import createReactClass from 'create-react-class';

/**
 * 基于antd设计的数字输入框
 * 样式都来源于antd
 * 目前只支持两位小数和整数
 * 没有校验必填
 */
//随机数为了标注此组件
let count = 0;

class InputNumber extends React.Component {
  static defaultProps = {
    placeholder: '请输入数字',
    validateType: 'integer',//integer,decimal(两位小数)
  };

  static onWheelStop(evt) {
    if (evt.preventDefault) {
      // Firefox  
      evt.preventDefault();
      // /evt.stopPropagation();
    } else {
      // IE  
      //evt.cancelBubble = true;
      evt.returnValue = false;
    }
  }

  validateValue(value) {
    let validateType = this.props.validateType;
    if (value === '') return true;
    return validateType === 'integer' ? integer(value) : numTo2(value);
  }

  onChange = (e) => {
    let value = e.target.value, { onChange, groupChange } = this.props, validate = this.validateValue(value);
    value = isNull(value) ? '' : isNaN(value) ? 0 : Number(value);
    this.setState({
      value: value,
      validate: validate,
    });
    onChange && validate && onChange(value);
    groupChange && groupChange({ domId: this.domId, validate: validate, value: value, inputRef: this.inputRef });
  };

  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.domId = new Date().getTime() + String(count);
    count = count === 99 ? 0 : count + 1;

    this.state = {
      value: props.defaultValue,
      validate: this.validateValue(props.defaultValue),
    };
  }

  render() {
    let validateType = this.props.validateType, validate = this.state.validate,
      errMessage = { integer: '必须是整数', decimal: '保留两位小数' };
    return (
      <div className={!validate ? 'has-error' : ''}>
        <input ref={this.inputRef} value={this.state.value} placeholder={this.props.placeholder} type='number'
               className='ant-input' onChange={this.onChange} onWheel={InputNumber.onWheelStop}/>
        <div className="ant-form-explain">{!validate&&errMessage[validateType]}</div>
      </div>
    );
  }
}

export default function create(Component) {
  return createReactClass({
    err: {},
    onChange(data) {
      let err = this.err, current = err[data.domId];
      if (current && data.validate) {
        delete err[data.domId];
      } else if (!current && !data.validate) {
        err[data.domId] = data.inputRef;
      }
    },
    validate() {
      let err = this.err, errKey = isHaveJson(err);
      if (errKey) {
        err[errKey].current.focus();
        return false;
      }
      return true;

    },
    render() {
      return React.createElement(Component, { inputNumberGroup: this });
    },
    getInputDecorator(options) {
      return <InputNumber groupChange={this.onChange} {...options}/>;
    },
  });
}

