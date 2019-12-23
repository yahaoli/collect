import React from 'react';

export default class group extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }
  render() {
    return (
      <div>
        group
      </div>
    );
  }
}
