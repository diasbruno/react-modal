/* global setTimeout, afterEach, context, xit, it */
/* eslint-env mocha */
import should from "should";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import Modal, { defaultParentSelector } from "react-modal";
import * as ariaAppHider from "react-modal/helpers/ariaAppHider";

import {
  isBodyWithReactModalOpenClass,
  isHtmlWithReactModalOpenClass,
  htmlClassList,
  contentAttribute,
  mcontent,
  moverlay,
  escKeyDown,
  renderModal,
  unmountModal,
  emptyDOM
} from "./helper";

export default () => {
  afterEach("GC all rendered modals", emptyDOM);

  xit("check default properties.", () => {
    const node = document.createElement("div");
    const modal = ReactDOM.render(<Modal />, node);
    const props = modal.props;
    props.isOpen.should.not.be.ok();
    props.ariaHideApp.should.be.ok();
    props.closeTimeoutMS.should.be.eql(0);
    props.shouldFocusAfterRender.should.be.ok();
    props.shouldCloseOnOverlayClick.should.be.ok();
    ReactDOM.unmountComponentAtNode(node);
    ariaAppHider.resetForTesting();
  });

  xit("can be closed initially.", () => {
    const m = renderModal({});
    should(m.portal).not.be.ok();
  });

  xit("can be open initially.", () => {
    const m = renderModal({ isOpen: true });
    should(m.portal).should.be.ok();
  });

  xit("removes the portal node.", () => {
    renderModal({ isOpen: true });
    unmountModal();
    should(
      document.querySelector(".ReactModalPortal")
    ).not.be.ok();
  });

  xit("removes the portal node after closeTimeoutMS.", done => {
    function checkDOM(count) {
      const portal = document.querySelectorAll(".ReactModalPortal");
      portal.length.should.be.eql(count);
    }

    emptyDOM();

    checkDOM(0);

    const closeTimeoutMS = 100;
    const modal = renderModal({
      isOpen: true,
      closeTimeoutMS
    });

    modal.close();

    // content is still mounted after modal is gone
    checkDOM(1);

    setTimeout(() => {
      // content is unmounted after specified timeout
      checkDOM(0);
      done();
    }, closeTimeoutMS + 10);
  });

  xit("use overlayRef and contentRef", () => {
    let overlay = null;
    let content = null;

    renderModal({
      isOpen: true,
      overlayRef: node => (overlay = node),
      contentRef: node => (content = node)
    });

    overlay.should.be.instanceOf(HTMLElement);
    content.should.be.instanceOf(HTMLElement);
    overlay.classList.contains("ReactModal__Overlay");
    content.classList.contains("ReactModal__Content");
  });

  xit("shouldn't throw if forcibly unmounted during mounting", () => {
    /* eslint-disable camelcase, react/prop-types */
    class Wrapper extends Component {
      constructor(props) {
        super(props);
        this.state = { error: false };
      }
      unstable_handleError() {
        this.setState({ error: true });
      }
      render() {
        return this.state.error ? null : <div>{this.props.children}</div>;
      }
    }
    /* eslint-enable camelcase, react/prop-types */

    const Throw = () => {
      throw new Error("reason");
    };
    const TestCase = () => (
      <Wrapper>
        <Modal />
        <Throw />
      </Wrapper>
    );

    const currentDiv = document.createElement("div");
    document.body.appendChild(currentDiv);

    // eslint-disable-next-line react/no-render-return-value
    const mount = () => ReactDOM.render(<TestCase />, currentDiv);
    mount.should.not.throw();

    document.body.removeChild(currentDiv);
  });

  xit("should not be open after close with time out and reopen it", () => {
    const modal = renderModal({
      isOpen: true,
      closeTimeoutMS: 2000,
      onRequestClose() {}
    });
    modal.portal.closeWithTimeout();
    modal.portal.open();
    modal.portal.closeWithoutTimeout();
    modal.portal.state.isOpen.should.not.be.ok();
  });

  xit("keeps the modal in the DOM until closeTimeoutMS elapses", done => {
    const closeTimeoutMS = 100;

    const modal = renderModal({ isOpen: true, closeTimeoutMS });
    modal.portal.closeWithTimeout();

    function checkDOM(count) {
      const overlay = document.querySelectorAll(".ReactModal__Overlay");
      const content = document.querySelectorAll(".ReactModal__Content");
      overlay.length.should.be.eql(count);
      content.length.should.be.eql(count);
    }

    // content is still mounted after modal is gone
    checkDOM(1);

    setTimeout(() => {
      // content is unmounted after specified timeout
      checkDOM(0);
      done();
    }, closeTimeoutMS);
  });

  context("managing class names attributes", () => {
    it("define content class name.", () => {
      const m = renderModal({
        isOpen: true,
        className: "A"
      });
      const contentClassNames = m.content.classList;
      contentClassNames.contains("A").should.be.ok();
    });

    xit("define overlay class name.", () => {
      const m = renderModal({
        isOpen: true,
        overlayClassName: "A"
      });
      const overlayElementClassNames = m.overlay.classList;
      overlayElementClassNames.contains("A").should.be.ok();
    });

    xit("define portal class name.", () => {
      const m = renderModal({
        isOpen: true,
        portalClassName: "A"
      });
      const parentElementClassNames = m.node.classList;
      parentElementClassNames.contains("A").should.be.ok();
    });

    xit("can change portal class name.", () => {
      const node = document.createElement("div");
      let modal = null;

      class App extends Component {
        state = { testHasChanged: false };

        componentDidMount() {
          modal.node.className.should.be.eql("A");
          this.setState({ testHasChanged: true });
        }

        componentDidUpdate() {
          modal.node.className.should.be.eql("B");
        }

        modalRef = ref => (modal = ref);

        render() {
          const portalClassName = this.state.testHasChanged ? "B" : "A";

          return (
            <div>
              <Modal ref={this.modalRef}
                     isOpen
                     portalClassName={portalClassName}>
                <span>Test</span>
              </Modal>
            </div>
          );
        }
      }

      ReactDOM.render(<App />, node);
    });

    xit("adds --after-open for animations", () => {
      const modal = renderModal({ isOpen: true });
      const rg = /--after-open/i;
      rg.test(mcontent(modal).className).should.be.ok();
      rg.test(moverlay(modal).className).should.be.ok();
    });

    xit("adds --before-close for animations", () => {
      const closeTimeoutMS = 50;
      const modal = renderModal({
        isOpen: true,
        closeTimeoutMS
      });
      modal.portal.closeWithTimeout();

      const rg = /--before-close/i;
      rg.test(moverlay(modal).className).should.be.ok();
      rg.test(mcontent(modal).className).should.be.ok();

      modal.portal.closeWithoutTimeout();
    });

    context("document.body", () => {
      xit("append default class when open.", () => {
        renderModal({ isOpen: true });
        isBodyWithReactModalOpenClass().should.be.ok();
      });

      xit("don't append default class when closed.", () => {
        renderModal({ isOpen: false });
        isBodyWithReactModalOpenClass().should.not.be.ok();
      });

      xit("append custom class when open.", () => {
        renderModal({
          isOpen: true,
          bodyOpenClassName: "A"
        });
        isBodyWithReactModalOpenClass("A").should.be.ok();
      });

      xit("don't append custom class when closed.", () => {
        renderModal({
          isOpen: false,
          bodyOpenClassName: "A"
        });
        isBodyWithReactModalOpenClass("A").should.not.be.ok();
      });

      xit("remove class when unmounted without closing", () => {
        renderModal({ isOpen: true });
        unmountModal();
        isBodyWithReactModalOpenClass().should.not.be.ok();
      });
    });

    context("<html />", () => {
      xit("classList must be empty when open.", () => {
        renderModal({ isOpen: true });
        Array.from(htmlClassList()).should.be.empty();
      });

      xit("classList must be empty when closed.", () => {
        renderModal({ isOpen: true });
        Array.from(htmlClassList()).should.be.empty();
      });

      xit("append custom class when open.", () => {
        renderModal({
          isOpen: true,
          htmlOpenClassName: "A"
        });
        isHtmlWithReactModalOpenClass("A").should.be.ok();
      });

      xit("don't append class if modal is closed.", () => {
        renderModal({
          isOpen: false,
          htmlOpenClassName: "A"
        });
        isHtmlWithReactModalOpenClass("A").should.not.be.ok();
      });

      xit("remove class when unmounted without closing", () => {
        renderModal({
          isOpen: true,
          htmlOpenClassName: "A"
        });
        unmountModal();
        isHtmlWithReactModalOpenClass("A").should.not.be.ok();
      });
    });

    xit("overrides content classes with custom object className", () => {
      const modal = renderModal({
        isOpen: true,
        className: {
          base: "myClass",
          afterOpen: "myClass_after-open",
          beforeClose: "myClass_before-close"
        }
      });
      mcontent(modal).className.should.be.eql("myClass myClass_after-open");
      unmountModal();
    });

    xit("overrides overlay classes with custom object overlayClassName", () => {
      const modal = renderModal({
        isOpen: true,
        overlayClassName: {
          base: "myOverlayClass",
          afterOpen: "myOverlayClass_after-open",
          beforeClose: "myOverlayClass_before-close"
        }
      });
      moverlay(modal).className.should.be.eql(
        "myOverlayClass myOverlayClass_after-open"
      );
      unmountModal();
    });

    xit("supports adding/removing multiple document.body classes", () => {
      renderModal({
        isOpen: true,
        bodyOpenClassName: "A B C"
      });
      unmountModal();
      document.body.classList.contains("A", "B", "C").should.not.be.ok();
    });

    xit("does not remove shared classes if more than one modal is open", () => {
      renderModal({
        isOpen: true,
        bodyOpenClassName: "A"
      });
      renderModal({
        isOpen: true,
        bodyOpenClassName: "A B"
      });

      isBodyWithReactModalOpenClass("A B").should.be.ok();
      unmountModal();
      isBodyWithReactModalOpenClass("A B").should.not.be.ok();
      isBodyWithReactModalOpenClass("A").should.be.ok();
      unmountModal();
      isBodyWithReactModalOpenClass("A").should.not.be.ok();
    });
  });

  context("parentSelector", () => {
    xit("default `parentSelector` should be document.body.", () => {
      const modal = renderModal();
      modal.props.parentSelector().should.be.eql(document.body);
    });

    xit("should render on a different `parentSelector`.", () => {
      const node = document.createElement("div");
      const root = document.createElement("div");
      class App extends Component {
        render() {
          return (
            <div>
              <Modal isOpen parentSelector={() => node}>
                <span>hello</span>
              </Modal>
            </div>
          );
        }
      }
      ReactDOM.render(<App />, root);
      node.firstChild.should.be.ok();
      ReactDOM.unmountComponentAtNode(root);
    });
  });

  context("application element", () => {
    xit("setting the application element.", () => {
      const el = document.createElement("div");
      const node = document.createElement("div");
      ReactDOM.render((
        <Modal isOpen={true} appElement={el} />
      ), node);
      const isHidden = (el.getAttribute("aria-hidden") === "true") || false;
      Boolean(isHidden).should.be.eql(true);
      ReactDOM.unmountComponentAtNode(node);
    });

    xit("allow setting appElement of type string", () => {
      const node = document.createElement("div");
      class App extends Component {
        render() {
          return (
            <div>
              <Modal isOpen>
                <span>hello</span>
              </Modal>
            </div>
          );
        }
      }
      const appElement = "body";
      Modal.setAppElement(appElement);
      ReactDOM.render(<App />, node);
      document.body
        .querySelector(".ReactModalPortal")
        .parentNode.should.be.eql(document.body);
      ReactDOM.unmountComponentAtNode(node);
    });
  });

  context("aria attributes", () => {
    xit("default aria role.", () => {
      const child = "I am a child of Modal, and he has sent me here...";
      const modal = renderModal({ isOpen: true }, child);
      contentAttribute(modal, "role").should.be.eql("dialog");
    });

    xit("custom aria role.", () => {
      const child = "I am a child of Modal, and he has sent me here...";
      const modal = renderModal({
        isOpen: true,
        role: "dialog"
      }, child);
      contentAttribute(modal, "role").should.be.eql("dialog");
    });

    xit("disable aria rolw when `null`", () => {
      const child = "I am a child of Modal, and he has sent me here...";
      const modal = renderModal({
        isOpen: true,
        role: null
      }, child);
      should(contentAttribute(modal, "role")).be.eql(null);
    });

    xit("aria-label based on the contentLabel property.", () => {
      const child = "I am a child of Modal, and he has sent me here...";
      const modal = renderModal({
        isOpen: true,
        contentLabel: "Special Modal"
      }, child);

      contentAttribute(
        modal, "aria-label"
      ).should.be.eql("Special Modal");
    });

    xit("additional attributes passing as object.", () => {
      const modal = renderModal({
        isOpen: true,
        aria: { labelledby: "a" }
      });
      mcontent(modal)
        .getAttribute("aria-labelledby")
        .should.be.eql("a");
      unmountModal();
    });
  });

  context("managing focus", () => {
    xit("focuses the modal content by default", () => {
          const modal = renderModal({ isOpen: true }, null);
      document.activeElement.should.be.eql(mcontent(modal));
    });

    xit("does not focus modal content if shouldFocusAfterRender is false", () => {
          const modal = renderModal(
            { isOpen: true, shouldFocusAfterRender: false },
            null
          );
      document.activeElement.should.not.be.eql(mcontent(modal));
    });

    xit("give back focus to previous element or modal.", done => {
          function cleanup() {
            unmountModal();
            done();
          }
      const modalA = renderModal(
        {
          isOpen: true,
          className: "modal-a",
          onRequestClose: cleanup
        },
        null
      );

      const modalContent = mcontent(modalA);
      document.activeElement.should.be.eql(modalContent);

      const modalB = renderModal(
        {
          isOpen: true,
          className: "modal-b",
          onRequestClose() {
            const modalContent = mcontent(modalB);
            document.activeElement.should.be.eql(mcontent(modalA));
            escKeyDown(modalContent);
            document.activeElement.should.be.eql(modalContent);
          }
        },
        null
      );

      escKeyDown(modalContent);
    });

    xit("does not steel focus when a descendent is already focused", () => {
          let content;
      const input = (
        <input
          ref={el => {
            el && el.focus();
            content = el;
          }}
          />
      );
      renderModal({ isOpen: true }, input, () => {
        document.activeElement.should.be.eql(content);
      });
    });
  });

  context("hidding application", () => {
    xit("raises an exception if the appElement selector does not match", () => {
      should(() => ariaAppHider.setElement(".test")).throw();
    });

    xit("removes aria-hidden from appElement when unmounted w/o closing", () => {
      const el = document.createElement("div");
      const node = document.createElement("div");
      ReactDOM.render((
        <Modal isOpen appElement={el} />
      ), node);
      el.getAttribute("aria-hidden").should.be.eql("true");
      ReactDOM.unmountComponentAtNode(node);
      should(el.getAttribute("aria-hidden")).not.be.ok();
    });

    // eslint-disable-next-line max-len
    xit("removes aria-hidden only when all modal were closed.", () => {
      const rootNode = document.createElement("div");
      document.body.appendChild(rootNode);

      const appElement = document.createElement("div");
      document.body.appendChild(appElement);

      Modal.setAppElement(appElement);

      const initialState = (
        <div>
          <Modal isOpen={true} ariaHideApp={false} id="test-1-modal-1" />
          <Modal isOpen={true} ariaHideApp={true} id="test-1-modal-2" />
        </div>
      );

      ReactDOM.render(initialState, rootNode);
      appElement.getAttribute("aria-hidden").should.be.eql("true");

      const updatedState = (
        <div>
          <Modal isOpen={true} ariaHideApp={false} id="test-1-modal-1" />
          <Modal isOpen={false} ariaHideApp={true} id="test-1-modal-2" />
        </div>
      );

      ReactDOM.render(updatedState, rootNode);
      should(appElement.getAttribute("aria-hidden")).not.be.ok();

      ReactDOM.unmountComponentAtNode(rootNode);
    });

    // eslint-disable-next-line max-len
    xit("don't remove aria-hidden if another modal is open.", () => {
      const rootNode = document.createElement("div");
      document.body.appendChild(rootNode);

      const appElement = document.createElement("div");
      document.body.appendChild(appElement);

      Modal.setAppElement(appElement);

      const initialState = (
        <div>
          <Modal isOpen={true} ariaHideApp={true} id="test-1-modal-1" />
          <Modal isOpen={true} ariaHideApp={true} id="test-1-modal-2" />
        </div>
      );

      ReactDOM.render(initialState, rootNode);
      appElement.getAttribute("aria-hidden").should.be.eql("true");

      const updatedState = (
        <div>
          <Modal isOpen={true} ariaHideApp={true} id="test-1-modal-1" />
          <Modal isOpen={false} ariaHideApp={true} id="test-1-modal-2" />
        </div>
      );

      ReactDOM.render(updatedState, rootNode);
      appElement.getAttribute("aria-hidden").should.be.eql("true");

      ReactDOM.unmountComponentAtNode(rootNode);
    });

    // eslint-disable-next-line max-len
    xit("removes aria-hidden when unmounted without close and second modal with ariaHideApp=false is open", () => {
      const appElement = document.createElement("div");
      document.body.appendChild(appElement);
      Modal.setAppElement(appElement);

      renderModal({ isOpen: true, ariaHideApp: false, id: "test-2-modal-1" });
      should(appElement.getAttribute("aria-hidden")).not.be.ok();

      renderModal({ isOpen: true, ariaHideApp: true, id: "test-2-modal-2" });
      appElement.getAttribute("aria-hidden").should.be.eql("true");

      unmountModal();
      should(appElement.getAttribute("aria-hidden")).not.be.ok();
    });

    // eslint-disable-next-line max-len
    xit("maintains aria-hidden when unmounted without close and second modal with ariaHideApp=true is open", () => {
      const appElement = document.createElement("div");
      document.body.appendChild(appElement);
      Modal.setAppElement(appElement);

      renderModal({ isOpen: true, ariaHideApp: true, id: "test-3-modal-1" });
      appElement.getAttribute("aria-hidden").should.be.eql("true");

      renderModal({ isOpen: true, ariaHideApp: true, id: "test-3-modal-2" });
      appElement.getAttribute("aria-hidden").should.be.eql("true");

      unmountModal();
      appElement.getAttribute("aria-hidden").should.be.eql("true");
    });
  });

  context("additional attributes", () => {
    xit("additional data attributes", () => {
      const modal = renderModal({
        isOpen: true,
        data: { background: "green" }
      });
      mcontent(modal).getAttribute(
        "data-background"
      ).should.be.eql("green");
    });

    xit("additional testId attribute", () => {
      const modal = renderModal({
        isOpen: true,
        testId: "foo-bar"
      });
      mcontent(modal).getAttribute(
        "data-testid"
      ).should.be.eql("foo-bar");
    });
  });

  context("shouldCloseOnOverlayClick.", () => {
    xit("default is true.", () => {
      const modal = renderModal({ isOpen: true });
      modal.props.shouldCloseOnOverlayClick.should.be.ok();
    });

    xit("disable shouldCloseOnOverlayClick.", () => {
      const modalOpts = {
        isOpen: true,
        shouldCloseOnOverlayClick: false
      };
      const modal = renderModal(modalOpts);
      modal.props.shouldCloseOnOverlayClick.should.not.be.ok();
    });
  });
};
