/* global afterEach, it */
/* eslint-env mocha */
import ReactDOM from "react-dom";
import sinon from "sinon";
import { mcontent, renderModal, emptyDOM } from "./helper";

export default () => {
  afterEach("cleaned up all rendered modals", emptyDOM);

  it("allow to patch ReactDOM.createPortal.", () => {
    const isReact16 = ReactDOM.createPortal !== undefined;
    if (!isReact16) {
      console.log("Testing with version 16-");
      (true).should.be.ok();
    } else {
      const createPortalSpy = sinon.spy(ReactDOM, "createPortal");
      renderModal({ isOpen: true });
      createPortalSpy.called.should.be.ok();
      ReactDOM.createPortal.restore();
    }
  });
};
