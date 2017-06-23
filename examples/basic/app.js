import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Modal from '../../src/index';

const appElement = document.getElementById('example');

Modal.setAppElement('#example');

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  render() {
    return (
      <form>
        <input
          id="input1"
          value={this.state.value}
          placeholder="enter text here"
          onChange={this.handleInputChange}
        />
      </form>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalA: false,
      modalB: false,
      modalC: false
    };
  }

  toggleModal = modalNumber => {
    const modalName = `modal${modalNumber}`;
    this.setState(state => ({
      [modalName]: !state[modalName]
    }));
  };

  handleInputChange = () => {
    this.setState({ foo: 'bar' });
  };

  handleOnAfterOpenModal = () => {
    // when ready, we can access the available refs.
    this.title.style.color = '#F00';
  };

  render() {
    const { modalA, modalB, modalC } = this.state;
    return (
      <div>
        <button onClick={() => this.toggleModal('A')}>Open Modal A</button>
        <button onClick={() => this.toggleModal('B')}>Open Modal B</button>
        <button onClick={() => this.toggleModal('C')}>Open Modal C</button>
        <Modal
          id="modalA"
          closeTimeoutMS={150}
          isOpen={modalA}
          contentLabel="modalA"
          onAfterOpen={this.handleOnAfterOpenModal}
          onRequestClose={() => this.toggleModal('A')}
        >
          <h1 ref={el => this.title = el}>Hello</h1>
          <button onClick={() => this.toggleModal('A')}>close</button>
          <div>I am a modal</div>
          <Form />
          <form>
            <input onChange={this.handleInputChange} />
            <input />
            <input />
            <input />
            <input />
            <br />
            <button>hi</button>
            <button>hi</button>
            <button>hi</button>
            <button>hi</button>
            <button
              onClick={e => {
                e.preventDefault();
                this.toggleModal('B');
              }}
            >
              Open Modal B
            </button>
            <button
              onClick={e => {
                e.preventDefault();
                this.toggleModal('C');
              }}
            >
              Open Modal C
            </button>
          </form>
        </Modal>
        <Modal
          id="modalB"
          closeTimeoutMS={150}
          contentLabel="modalB"
          isOpen={modalB}
          onAfterOpen={() => {}}
          onRequestClose={() => this.toggleModal('B')}
          bodyOpenClassName="modalB--body"
        >
          <p>Modal B</p>
        </Modal>
        <Modal
          id="modalC"
          contentLabel="modalC"
          isOpen={modalC}
          onAfterOpen={() => {}}
          onRequestClose={() => this.toggleModal('C')}
        >
          <h2>Modal C</h2>
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(<App />, appElement);
