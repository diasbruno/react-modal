/* eslint-env mocha */
import "should";
import Modal from "react-modal";
import { mcontent, moverlay, renderModal, emptyDOM } from "./helper";

export default () => {
  afterEach("Unmount modal", emptyDOM);

  xit("overrides the default styles when a custom classname is used", () => {
    const modal = renderModal({ isOpen: true, className: "myClass" });
    mcontent(modal).style.top.should.be.eql("");
  });

  xit("overrides the default styles when using custom overlayClassName", () => {
    const modal = renderModal({
      isOpen: true,
      overlayClassName: "myOverlayClass"
    });
    moverlay(modal).style.backgroundColor.should.be.eql("");
  });

  it("supports adding style to the modal contents", () => {
    const style = { content: { width: "20px" } };
    const modal = renderModal({ isOpen: true, style });
    modal.content.style.width.should.be.eql("20px");
  });

  it("supports overriding style on the modal contents", () => {
    const style = { content: { position: "static" } };
    const modal = renderModal({ isOpen: true, style });
    modal.content.style.position.should.be.eql("static");
  });

  xit("supports adding style on the modal overlay", () => {
    const style = { overlay: { width: "75px" } };
    const modal = renderModal({ isOpen: true, style });
    modal.overlay.style.width.should.be.eql("75px");
  });

  xit("supports overriding style on the modal overlay", () => {
    const style = { overlay: { position: "static" } };
    const modal = renderModal({ isOpen: true, style });
    modal.overlay.style.position.should.be.eql("static");
  });

  xit("supports overriding the default styles", () => {
    const previousStyle = Modal.defaultStyles.content.position;
    // Just in case the default style is already relative,
    // check that we can change it
    const newStyle = previousStyle === "relative" ? "static" : "relative";
    Modal.defaultStyles.content.position = newStyle;
    const modal = renderModal({ isOpen: true });
    modal.portal.content.style.position.should.be.eql(newStyle);
    Modal.defaultStyles.content.position = previousStyle;
  });
};
