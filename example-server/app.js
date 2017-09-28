import React, { Component } from 'react';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: props.items,
      disabled: true
    };
  }

  // Once the component has been mounted, we can enable the button
  componentDidMount() {
    this.setState({
      disabled: false
    });
  }

  onClick = () => {
    const { items } = this.state;

    this.setState({
      items: items.concat('Item ' + items.length)
    });
  }

  render() {
    const { disabled } = this.props;

    return (
      <div>
        <button onClick={this.onClick} disable={disabled}>Add Item</button>
        <ul>{this.state.items.map((item, key) => <li key={key}>{item}</li>)}</ul>
      </div>
    );
  }
}
