(() => {
  // src/utils.ts
  const setCanvasDimensions = (element, maxWidth, maxHeight) => {
    element.width = maxWidth;
    element.height = maxHeight;
    element.style.width = String(maxWidth) + "px";
    element.style.height = String(maxHeight) + "px";
  };
  const getWindowDimensions = () => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    return [width, height];
  };
  const fullscreenCanvas = (element, hook = () => {
  }) => {
    let dimensions = getWindowDimensions();
    setCanvasDimensions(element, dimensions[0], dimensions[1]);
    window.addEventListener("resize", (e) => {
      dimensions = getWindowDimensions();
      setCanvasDimensions(element, dimensions[0], dimensions[1]);
      hook(e);
    });
    return () => dimensions;
  };
  const setupMouseHandlers = (element) => {
    let wheelDeltaX;
    let wheelDeltaY;
    const mouse3 = {
      x: 0,
      y: 0,
      buttons: [],
      touches: new Map(),
      action: false,
      clicked: false,
      wheelDeltaX: 0,
      wheelDeltaY: 0
    };
    let clickedThisPoll = false;
    let downThisPoll = false;
    element.addEventListener("mousemove", (e) => {
      if (e.offsetX || e.offsetY) {
        mouse3.x = e.offsetX;
        mouse3.y = e.offsetY;
      }
    });
    element.addEventListener("mousedown", (e) => {
      mouse3.buttons[e.button] = true;
      downThisPoll = true;
    });
    element.addEventListener("mouseup", (e) => {
      mouse3.buttons[e.button] = false;
      clickedThisPoll = true;
    });
    element.addEventListener("mouseleave", (e) => {
      mouse3.buttons = [];
    });
    element.addEventListener("mouseout", (e) => {
      mouse3.buttons = [];
    });
    element.addEventListener("blur", (e) => {
      mouse3.buttons = [];
    });
    element.addEventListener("wheel", (e) => {
      e.preventDefault();
      wheelDeltaX = e.deltaX;
      wheelDeltaY = e.deltaY;
    });
    element.addEventListener("touchstart", (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        mouse3.touches.set(touch.identifier, touch);
      }
    });
    element.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        mouse3.touches.set(touch.identifier, touch);
      }
    });
    element.addEventListener("touchcancel", (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        mouse3.touches.delete(touch.identifier);
        clickedThisPoll = true;
        mouse3.buttons[0] = false;
      }
    });
    element.addEventListener("touchend", (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        mouse3.touches.delete(touch.identifier);
        clickedThisPoll = true;
        mouse3.buttons[0] = false;
      }
    });
    element.addEventListener("contextmenu", (e) => e.preventDefault());
    element.addEventListener("dragenter", (e) => e.preventDefault());
    const poll = () => {
      for (let [_, touch] of mouse3.touches) {
        mouse3.x = touch.clientX;
        mouse3.y = touch.clientY;
        downThisPoll = true;
        mouse3.buttons[0] = true;
      }
      mouse3.clicked = clickedThisPoll;
      mouse3.action = downThisPoll;
      mouse3.wheelDeltaX = wheelDeltaX;
      mouse3.wheelDeltaY = wheelDeltaY;
      wheelDeltaX = 0;
      wheelDeltaY = 0;
      clickedThisPoll = false;
      return mouse3;
    };
    return poll;
  };
  const draw = (cb, fps = 60) => {
    let then = 0;
    const func = (now = 0) => {
      const dt = (now - then) / (1000 / fps);
      then = now;
      cb(dt);
      window.requestAnimationFrame(func);
    };
    return func;
  };

  // src/rectangle.ts
  const intersection = (a, b) => {
    const rect1x = a.x;
    const rect1y = a.y;
    const rect1w = a.width;
    const rect1h = a.height;
    const rect2x = b.x;
    const rect2y = b.y;
    const rect2w = b.width;
    const rect2h = b.height;
    return rect1x + rect1w > rect2x && rect1x < rect2x + rect2w && rect1y + rect1h > rect2y && rect1y < rect2y + rect2h;
  };

  // src/index.ts
  const defaults = {
    textBaseline: "bottom"
  };
  const setDefaults = (c2) => {
    const opts = {};
    for (let [key, value] of Object.entries(defaults)) {
      opts[key] = c2[key];
      c2[key] = value;
    }
    return opts;
  };
  const CONTEXT_SEPARATOR = "|";
  class GUIComponent {
    constructor() {
      this.key = "";
      this.contextKey = "";
    }
    render(c2, container, state) {
    }
    update(mouse3, container) {
    }
    static factory(push, contextKey, state, contextFactory) {
    }
  }
  GUIComponent.defaultState = {};
  class Button {
    constructor(key, contextKey, props) {
      this.key = key;
      this.contextKey = contextKey;
      this.props = props;
    }
    static factory(push, contextKey = "", state, contextFactory) {
      return (key, props) => {
        const globalKey = contextKey ? contextKey + CONTEXT_SEPARATOR + key : key;
        push(new Button(globalKey, contextKey, props));
        return state.get(globalKey) || Button.defaultState;
      };
    }
    computeProps(state) {
      return Object.assign({}, Button.defaultProps(state), typeof this.props === "function" ? this.props(state) : this.props);
    }
    render(c2, container, state) {
      const {x, y, width, height, backgroundColor} = this.computeProps(state);
      c2.fillStyle = backgroundColor;
      c2.fillRect(container.x + x, container.y + y, width, height);
    }
    update(mouse3, container) {
      const {x, y, width, height} = this.computeProps(Button.defaultState);
      const mo = 0.5;
      const mouseBox = {
        x: mouse3.x - mo,
        y: mouse3.y - mo,
        width: mo,
        height: mo
      };
      const hovering = intersection({
        x: container.x + x,
        y: container.y + y,
        width,
        height
      }, mouseBox) && intersection(container, mouseBox);
      const {wheelDeltaX, wheelDeltaY} = mouse3;
      const scrollX = hovering ? wheelDeltaX : 0;
      const scrollY = hovering ? wheelDeltaY : 0;
      return {
        hovering,
        scrollX,
        scrollY,
        clicked: hovering && mouse3.clicked,
        down: hovering && mouse3.buttons.some(Boolean)
      };
    }
  }
  Button.defaultProps = (state) => ({
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    backgroundColor: state.hovering ? "red" : "blue"
  });
  Button.defaultState = {
    hovering: false,
    scrollX: 0,
    scrollY: 0,
    clicked: false,
    down: false
  };
  class ContextContainer extends GUIComponent {
    constructor(key = "", contextKey = "", props = {
      x: 0,
      y: 0,
      width: Infinity,
      height: Infinity
    }) {
      super();
      this.key = key;
      this.contextKey = contextKey;
      this.props = props;
      this.globalBoundary = props;
    }
  }
  class Container extends ContextContainer {
    constructor(key, contextKey, props) {
      super();
      this.key = key;
      this.contextKey = contextKey;
      this.props = props;
      const {x, y, width, height} = props;
      this.globalBoundary = {
        x,
        y,
        width,
        height
      };
    }
    subset(container) {
      const {x: _x, y: _y, width, height} = this.props;
      const x = _x + container.x;
      const y = _y + container.y;
      this.globalBoundary.x = x;
      this.globalBoundary.y = y;
      this.globalBoundary.width = Math.min(width, container.width);
      this.globalBoundary.height = Math.min(height, container.height);
    }
    render(c2, container, state) {
      this.subset(container);
      c2.beginPath();
      c2.rect(this.globalBoundary.x, this.globalBoundary.y, this.globalBoundary.width, this.globalBoundary.height);
      c2.clip();
      c2.fillStyle = this.props.color;
      c2.fillRect(this.globalBoundary.x, this.globalBoundary.y, this.globalBoundary.width, this.globalBoundary.height);
    }
    static factory(push, contextKey = "", state, contextFactory) {
      return (key, options, callback) => {
        const derivedKey = contextKey ? contextKey + CONTEXT_SEPARATOR + key : key;
        push(new Container(derivedKey, contextKey, options));
        contextFactory(derivedKey, callback);
        return state.get(derivedKey) || Container.defaultState;
      };
    }
  }
  const init = (c2) => {
    const defaults2 = setDefaults(c2);
    let renderList = [];
    let state = new Map();
    const push = (...rest) => {
      renderList.push(...rest);
    };
    const render2 = (mouse3) => {
      c2.save();
      const contextMap = new Map();
      let currentContext = null;
      for (let renderable of renderList) {
        if (currentContext !== renderable.contextKey) {
          c2.restore();
          c2.save();
        }
        renderable.render(c2, contextMap.get(renderable.contextKey), state.get(renderable.key) || renderable.constructor.defaultState);
        if (renderable instanceof ContextContainer) {
          currentContext = renderable.key;
          contextMap.set(renderable.key, renderable.globalBoundary);
        }
      }
      for (let renderable of renderList) {
        if (renderable.key) {
          state.set(renderable.key, renderable.update(mouse3, contextMap.get(renderable.contextKey)));
        }
      }
      renderList.length = 0;
      c2.restore();
    };
    const contextFactory = (key, callback) => {
      callback({
        key,
        button: Button.factory(push, key, state, contextFactory),
        checkbox: () => {
        },
        container: Container.factory(push, key, state, contextFactory)
      });
    };
    const context2 = (key, callback) => {
      push(new ContextContainer(key));
      return contextFactory(key, callback);
    };
    return {
      render: render2,
      context: context2
    };
  };

  // examples/example.ts
  const canvas = document.getElementById("canvas");
  const pollCanvasDimensions = fullscreenCanvas(canvas);
  const pollMouse = setupMouseHandlers(canvas);
  const c = canvas.getContext("2d");
  const {context, render} = init(c);
  let frame = 0;
  let showMovingButton = false;
  let movingButtonY = 0;
  let hits = 0;
  let offset = 10;
  const start = draw((dt) => {
    frame += dt;
    const mouse3 = pollMouse();
    const {x, y, touches} = mouse3;
    const [width, height] = pollCanvasDimensions();
    c.clearRect(0, 0, width, height);
    for (let [_, touch] of touches) {
      c.fillStyle = "teal";
      c.fillRect(touch.clientX, touch.clientY, touch.radiusX * 2, touch.radiusY * 2);
    }
    context("root", ({container, button}) => {
      const size = 400;
      container("container1", {
        x: 0,
        y: 0,
        width: size,
        height: size,
        color: "black"
      }, ({button: button2}) => {
        const {clicked} = button2("thing", {
          x: frame % size,
          y: offset,
          width: 50,
          height: 50
        });
        if (clicked) {
          showMovingButton = !showMovingButton;
        }
      });
      container("container5", {
        x: 0,
        y: height / 2,
        width: size,
        height: size,
        color: "teal"
      }, ({container: container2}) => {
        container2("container", {
          x: 0,
          y: 0,
          width: size,
          height: size / 2,
          color: "green"
        }, ({button: button2}) => {
          const {scrollY, clicked, down} = button2("thing", {
            x: frame % size,
            y: 10,
            width: 50,
            height: 50
          });
          offset += scrollY;
          if (clicked)
            hits++;
          if (down)
            movingButtonY++;
        });
        container2("container2", {
          x: 0,
          y: size / 2,
          width: size / 2,
          height: size / 2,
          color: "orange"
        }, ({button: button2}) => {
          const {clicked} = button2("thing", {
            x: frame % size / 2,
            y: 10,
            width: 50,
            height: 50
          });
          if (clicked)
            alert("yellow");
        });
        container2("container3", {
          x: size / 2,
          y: size / 2,
          width: size / 2,
          height: size / 2,
          color: "purple"
        }, ({button: button2}) => {
          const {clicked} = button2("thing", {
            x: frame % size / 2,
            y: 10,
            width: 50,
            height: 50
          });
          if (clicked)
            alert("purple");
        });
      });
      if (showMovingButton) {
        const {scrollY, clicked, down} = button("thing", ({down: down2, hovering}) => ({
          x: movingButtonY,
          y: 50,
          width: 50,
          height: 50,
          backgroundColor: [down2 && "yellow", hovering && "purple", "blue"].filter(Boolean)[0]
        }));
        if (clicked)
          alert("Hello you clicked me");
      }
    });
    render(mouse3);
    c.fillStyle = "white";
    c.fillText(String(hits), 100, 100);
  });
  start();
})();
