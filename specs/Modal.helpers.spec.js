/* eslint-env mocha */
import "should";
import buildClassNames, { CLASS_NAMES } from "../src/helpers/classNames";
import tabbable from "../src/helpers/tabbable";
import "sinon";

export default () => {
  describe("tabbable", () => {
    describe("without tabbable descendents", () => {
      it("returns an empty array", () => {
        const elem = document.createElement("div");
        tabbable(elem).should.deepEqual([]);
      });
    });

    describe("with tabbable descendents", () => {
      let elem;
      beforeEach(() => {
        elem = document.createElement("div");
        document.body.appendChild(elem);
      });

      afterEach(() => {
        document.body.removeChild(elem);
      });

      it("includes descendent tabbable inputs", () => {
        const input = document.createElement("input");
        elem.appendChild(input);
        tabbable(elem).should.containEql(input);
      });

      it("includes tabbable non-input elements", () => {
        const div = document.createElement("div");
        div.tabIndex = 1;
        elem.appendChild(div);
        tabbable(elem).should.containEql(div);
      });

      it("includes links with an href", () => {
        const a = document.createElement("a");
        a.href = "foobar";
        a.innerHTML = "link";
        elem.appendChild(a);
        tabbable(elem).should.containEql(a);
      });

      it("excludes links without an href or a tabindex", () => {
        const a = document.createElement("a");
        elem.appendChild(a);
        tabbable(elem).should.not.containEql(a);
      });

      it("excludes descendent inputs if they are not tabbable", () => {
        const input = document.createElement("input");
        input.tabIndex = -1;
        elem.appendChild(input);
        tabbable(elem).should.not.containEql(input);
      });

      it("excludes descendent inputs if they are disabled", () => {
        const input = document.createElement("input");
        input.disabled = true;
        elem.appendChild(input);
        tabbable(elem).should.not.containEql(input);
      });

      it("excludes descendent inputs if they are not displayed", () => {
        const input = document.createElement("input");
        input.style.display = "none";
        elem.appendChild(input);
        tabbable(elem).should.not.containEql(input);
      });

      it("excludes descendent inputs with 0 width and height", () => {
        const input = document.createElement("input");
        input.style.width = "0";
        input.style.height = "0";
        input.style.border = "0";
        input.style.padding = "0";
        elem.appendChild(input);
        tabbable(elem).should.not.containEql(input);
      });

      it("excludes descendents with hidden parents", () => {
        const input = document.createElement("input");
        elem.style.display = "none";
        elem.appendChild(input);
        tabbable(elem).should.not.containEql(input);
      });

      it("excludes inputs with parents that have zero width and height", () => {
        const input = document.createElement("input");
        elem.style.width = "0";
        elem.style.height = "0";
        elem.style.overflow = "hidden";
        elem.appendChild(input);
        tabbable(elem).should.not.containEql(input);
      });

      it("includes inputs visible because of overflow == visible", () => {
        const input = document.createElement("input");
        elem.style.width = "0";
        elem.style.height = "0";
        elem.style.overflow = "visible";
        elem.appendChild(input);
        tabbable(elem).should.containEql(input);
      });
    });
  });

  describe("buildClassNames", () => {
    const dc = CLASS_NAMES.content;
    const dov = CLASS_NAMES.overlay;

    context("default names", () => {
      context("when idle.", () => {
        it("no className. - using default names", () => {
          buildClassNames(0, "content").should.be.equal(dc);
        });

        it("no overlayClassName - using default name.", () => {
          buildClassNames(0, "overlay").should.be.equal(dov);
        });

        it("className empty string - using default name.", () => {
          buildClassNames(0, "content", "").should.be.equal(dc);
        });

        it("overlayClassName empty string - using default name.", () => {
          buildClassNames(0, "overlay", "").should.be.equal(dov);
        });

        it("className as string.", () => {
          buildClassNames(0, "content", "test").should.be.equal(dc);
        });

        it("overlayClassName as string.", () => {
          buildClassNames(0, "overlay", "test").should.be.equal(dov);
        });
      });

      context("after open.", () => {
        it("no className.", () => {
          buildClassNames(1, "content", "").should.be.equal(
            `${dc} ${dc}--after-open`
          );
        });

        it("no overlayClassName.", () => {
          buildClassNames(1, "overlay", "").should.be.equal(
            `${dov} ${dov}--after-open`
          );
        });

        it("className as string.", () => {
          buildClassNames(1, "content", "test").should.be.equal(
            `${dc} ${dc}--after-open test`
          );
        });

        it("overlayClassName as string.", () => {
          buildClassNames(1, "overlay", "test").should.be.equal(
            `${dov} ${dov}--after-open test`
          );
        });
      });

      context("before close.", () => {
        it("no className.", () => {
          buildClassNames(2, "content", "").should.be.equal(
            `${dc} ${dc}--before-close`
          );
        });

        it("no overlayClassName.", () => {
          buildClassNames(2, "overlay", "").should.be.equal(
            `${dov} ${dov}--before-close`
          );
        });

        it("className as string.", () => {
          buildClassNames(2, "content", "test").should.be.equal(
            `${dc} ${dc}--before-close test`
          );
        });

        it("overlayClassName as string.", () => {
          buildClassNames(2, "overlay", "test").should.be.equal(
            `${dov} ${dov}--before-close test`
          );
        });
      });
    });

    context("classes as objects", () => {
      const buildObject = (base, afterOpen, beforeClose) => ({ base, afterOpen, beforeClose });

      context("when idle.", () => {
        it("className.", () => {
          buildClassNames(0, "content", buildObject("A", "B", "C")).should.be.equal("A");
        });

        it("overlayClassName.", () => {
          buildClassNames(0, "overlay", buildObject("A", "B", "C")).should.be.equal("A");
        });

        it("className should merge with default names.", () => {
          buildClassNames(0, "content", {}).should.be.equal(dc);
        });

        it("overlayClassName should merge with default names.", () => {
          buildClassNames(0, "overlay", {}).should.be.equal(dov);
        });
      });

      context("after open.", () => {
        it("className.", () => {
          buildClassNames(1, "content", buildObject("A", "B", "C")).should.be.equal("A B");
        });

        it("overlayClassName.", () => {
          buildClassNames(1, "overlay", buildObject("A", "B", "C")).should.be.equal("A B");
        });

        it("className should merge with default names.", () => {
          buildClassNames(1, "content", {}).should.be.equal(
            `${dc} ${dc}--after-open`
          );
        });

        it("overlayClassName should merge with default names.", () => {
          buildClassNames(1, "overlay", {}).should.be.equal(
            `${dov} ${dov}--after-open`
          );
        });
      });

      context("before close.", () => {
        it("className.", () => {
          buildClassNames(2, "content", buildObject("A", "B", "C")).should.be.equal("A C");
        });

        it("overlayClassName.", () => {
          buildClassNames(2, "overlay", buildObject("A", "B", "C")).should.be.equal("A C");
        });

        it("className should merge with default names.", () => {
          buildClassNames(2, "content", {}).should.be.equal(
            `${dc} ${dc}--before-close`
          );
        });

        it("overlayClassName should merge with default names.", () => {
          buildClassNames(2, "overlay", {}).should.be.equal(
            `${dov} ${dov}--before-close`
          );
        });
      });
    });
  });
};
