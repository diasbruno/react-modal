/* global afterEach, describe, context, xit, it */
/* eslint-env mocha */
import React from "react";
import "should";
import sinon from "sinon";
import Modal from "react-modal";
import {
  moverlay,
  mcontent,
  clickAt,
  mouseDownAt,
  mouseUpAt,
  escKeyDown,
  tabKeyDown,
  renderModal,
  emptyDOM
} from "./helper";

export default () => {
  afterEach("Unmount modal", emptyDOM);

  xit("should trigger the onAfterOpen callback", () => {
    const afterOpenCallback = sinon.spy();
    renderModal({ isOpen: true, onAfterOpen: afterOpenCallback });
    afterOpenCallback.called.should.be.ok();
  });

  xit("keeps focus inside the modal when child has no tabbable elements", () => {
    let tabPrevented = false;
    const { content } = renderModal({ isOpen: true }, "hello");
    document.activeElement.should.be.eql(content);
    tabKeyDown(content, {
      preventDefault() {
        tabPrevented = true;
      }
    });
    tabPrevented.should.be.eql(true);
  });

  xit("handles case when child has no tabbable elements", () => {
    const { content } = renderModal({ isOpen: true });
    tabKeyDown(content);
    document.activeElement.should.be.eql(content);
  });

  xit("traps tab in the modal on shift + tab", () => {
    const topButton = <button>top</button>;
    const bottomButton = <button>bottom</button>;
    const modalContent = (
      <div>
        {topButton}
        {bottomButton}
      </div>
    );
    const { content } = renderModal({ isOpen: true }, modalContent);
    tabKeyDown(content, { shiftKey: true });
    document.activeElement.textContent.should.be.eql("bottom");
  });

  context("shouldCloseOnEsc", () => {
    it("should request to close.", () => {
      const requestCloseCallback = sinon.spy();
      const { content } = renderModal({
        isOpen: true,
        shouldCloseOnEsc: true,
        onRequestClose: requestCloseCallback
      });
      escKeyDown(content);
      requestCloseCallback.called.should.be.ok();
      // Check if event is passed to onRequestClose callback.
      const event = requestCloseCallback.getCall(0).args[0];
      event.should.be.ok();
    });

    it("when disabled, it should not close.", () => {
      const requestCloseCallback = sinon.spy();
      const { content } = renderModal({
        isOpen: true,
        shouldCloseOnEsc: false,
        onRequestClose: requestCloseCallback
      });
      escKeyDown(content);
      (!requestCloseCallback.called).should.be.ok();
    });
  });

  context("shouldCloseOnOverlayClick", () => {
    it("when false, click on overlay should not close", () => {
      const requestCloseCallback = sinon.spy();
      const { overlay } = renderModal({
        isOpen: true,
        shouldCloseOnOverlayClick: false
      });
      clickAt(overlay);
      requestCloseCallback.called.should.not.be.ok();
    });

    it("when true, click on overlay must close", () => {
      const requestCloseCallback = sinon.spy();
      const { overlay } = renderModal({
        isOpen: true,
        shouldCloseOnOverlayClick: true,
        onRequestClose: requestCloseCallback
      });
      clickAt(overlay);
      requestCloseCallback.called.should.be.ok();
    });

    it("overlay mouse down and content mouse up, should not close", () => {
      const requestCloseCallback = sinon.spy();
      const { overlay, content } = renderModal({
        isOpen: true,
        shouldCloseOnOverlayClick: true,
        onRequestClose: requestCloseCallback
      });
      mouseDownAt(overlay);
      mouseUpAt(content);
      requestCloseCallback.called.should.not.be.ok();
    });

    it("content mouse down and overlay mouse up, should not close", () => {
      const requestCloseCallback = sinon.spy();
      const { overlay, content } = renderModal({
        isOpen: true,
        shouldCloseOnOverlayClick: true,
        onRequestClose: requestCloseCallback
      });
      mouseDownAt(content);
      mouseUpAt(overlay);
      requestCloseCallback.called.should.not.be.ok();
    });
  });

  xit("should not stop event propagation", () => {
    let hasPropagated = false;
    const { overlay } = renderModal({
      isOpen: true,
      shouldCloseOnOverlayClick: true
    });
    window.addEventListener("click", () => (hasPropagated = true));
    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    hasPropagated.should.be.ok();
  });

  xit("verify event passing on overlay click", () => {
    const requestCloseCallback = sinon.spy();
    const { overlay } = renderModal({
      isOpen: true,
      shouldCloseOnOverlayClick: true,
      onRequestClose: requestCloseCallback
    });
    // click the overlay
    clickAt(overlay, {
      // Used to test that this was the event received
      fakeData: "ABC"
    });
    requestCloseCallback.called.should.be.ok();
    // Check if event is passed to onRequestClose callback.
    const event = requestCloseCallback.getCall(0).args[0];
    event.should.be.ok();
  });

  xit("on nested modals, only the topmost should handle ESC key.", () => {
    const requestCloseCallback = sinon.spy();
    const innerRequestCloseCallback = sinon.spy();
    let innerModal = null;
    let innerModalRef = ref => {
      innerModal = ref;
    };

    renderModal(
      {
        isOpen: true,
        onRequestClose: requestCloseCallback
      },
      <Modal
        isOpen
        onRequestClose={innerRequestCloseCallback}
        ref={innerModalRef}
      >
        <span>Test</span>
      </Modal>
    );

    const content = mcontent(innerModal);
    escKeyDown(content);
    innerRequestCloseCallback.called.should.be.ok();
    requestCloseCallback.called.should.not.be.ok();
  });
};
