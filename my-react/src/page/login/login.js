import React from "react";

import { Form, Icon, Input, Button } from 'antd';

class login extends React.Component {
  login = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        window.$axios({
          url: "/computer/api/login",
          method: "post",
          format:'form',
          data: values
        }).then((data) => {
        }).catch(() => {
        });
      }
    });
  };
  handleChange = (event) => {

    this.setState({ [event.target.name]: event.target.value });
  };

  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form className="login-form">
        <Form.Item>
          {getFieldDecorator("username", {
            rules: [{ required: true, message: "请输入账号" }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }}/>}
              placeholder="请输入账号"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "请输入密码" }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }}/>}
              type="password"
              placeholder="请输入密码"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button onClick={this.login} type="primary">
            登陆
          </Button>
        </Form.Item>
      </Form>
    );

  }
}

export default Form.create({ name: 'normal_login' })(login);
