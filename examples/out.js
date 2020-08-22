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
  const fullscreenCanvas = (element, hook) => {
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
    let currentTouch = -1;
    const mouse3 = {
      x: 0,
      y: 0,
      buttons: [],
      touches: new Map(),
      clicked: false,
      wheelDeltaX: 0,
      wheelDeltaY: 0
    };
    let clickedThisPoll = false;
    element.addEventListener("mousemove", (e) => {
      if (e.offsetX || e.offsetY) {
        mouse3.x = e.offsetX;
        mouse3.y = e.offsetY;
      }
    });
    element.addEventListener("mousedown", (e) => {
      mouse3.buttons[e.button] = true;
      clickedThisPoll = true;
    });
    element.addEventListener("mouseup", (e) => {
      mouse3.buttons[e.button] = false;
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
    });
    element.addEventListener("touchstart", (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (i === 0) {
          mouse3.x = touch.clientX;
          mouse3.y = touch.clientY;
          clickedThisPoll = true;
          mouse3[0] = true;
        }
        mouse3.touches.set(touch.identifier, touch);
      }
    });
    element.addEventListener("touchend", (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        mouse3.touches.delete(touch.identifier);
        mouse3[0] = false;
      }
    });
    element.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        mouse3.touches.set(touch.identifier, touch);
        if (i === 0) {
          mouse3.x = touch.clientX;
          mouse3.y = touch.clientY;
          clickedThisPoll = true;
          mouse3[0] = true;
        }
      }
    });
    element.addEventListener("touchcancel", (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        mouse3.touches.delete(touch.identifier);
        mouse3[0] = false;
      }
    });
    element.addEventListener("contextmenu", (e) => e.preventDefault());
    element.addEventListener("dragenter", (e) => e.preventDefault());
    const poll = () => {
      mouse3.clicked = clickedThisPoll;
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
  class Button {
    constructor(key, x = 0, y = 0, width = 0, height = 0, color = "blue", hoverColor = "red", textColor = "white") {
      this.key = key;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.hoverColor = hoverColor;
      this.textColor = textColor;
    }
    static factory(push, contextKey = "", contextFactory) {
      return (key, x, y, width, height, ...args) => push(new Button(contextKey ? contextKey + CONTEXT_SEPARATOR + key : key, x, y, width, height, ...args));
    }
    render(c2, container) {
      c2.fillStyle = this.color;
      c2.fillRect(container.x + this.x, container.y + this.y, this.width, this.height);
    }
  }
  class Container {
    constructor(key, {x, y, width, height, color}) {
      this.key = key;
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
      this.color = "white";
      Object.assign(this, {
        key,
        x,
        y,
        width,
        height,
        color
      });
      this.globalDimensions = {
        x,
        y,
        width,
        height
      };
    }
    subset(container) {
      const x = this.x + container.x;
      const y = this.y + container.y;
      this.globalDimensions.x = x;
      this.globalDimensions.y = y;
      this.globalDimensions.width = Math.min(this.width, container.width);
      this.globalDimensions.height = Math.min(this.height, container.height);
    }
    render(c2, container) {
      this.subset(container);
      c2.restore();
      c2.save();
      c2.beginPath();
      c2.rect(this.globalDimensions.x, this.globalDimensions.y, this.globalDimensions.width, this.globalDimensions.height);
      c2.clip();
      c2.fillStyle = this.color;
      c2.fillRect(this.globalDimensions.x, this.globalDimensions.y, this.globalDimensions.width, this.globalDimensions.height);
    }
    static factory(push, contextKey = "", contextFactory) {
      return (key, options, callback) => {
        const derivedKey = contextKey ? contextKey + CONTEXT_SEPARATOR + key : key;
        push(new Container(derivedKey, options));
        contextFactory(derivedKey, callback);
      };
    }
  }
  const init = (c2) => {
    const defaults2 = setDefaults(c2);
    let renderList = [];
    let oldRenderedList = [];
    let contextStack = [];
    let state = new Map();
    const push = (...rest) => {
      renderList.push(...rest);
    };
    const render2 = () => {
      console.log(renderList);
      let currentContext = {
        x: 0,
        y: 0,
        width: Infinity,
        height: Infinity
      };
      for (let renderable of renderList) {
        renderable.render(c2, currentContext);
        if (renderable instanceof Container) {
          currentContext = renderable.globalDimensions;
          contextStack.push(renderable.globalDimensions);
        }
      }
      oldRenderedList = renderList;
      renderList = [];
      contextStack = [];
    };
    const contextFactory = (key, callback) => {
      callback({
        key,
        button: Button.factory(push, key, contextFactory),
        checkbox: () => {
        },
        container: Container.factory(push, key, contextFactory)
      });
    };
    return {
      render: render2,
      context: contextFactory
    };
  };

  // examples/example.ts
  const canvas = document.getElementById("canvas");
  const pollCanvasDimensions = fullscreenCanvas(canvas);
  const pollMouse = setupMouseHandlers(canvas);
  const c = canvas.getContext("2d");
  const {context, render} = init(c);
  let frame = 0;
  const start = draw((dt) => {
    frame += dt;
    const {x, y, touches} = pollMouse();
    const [width, height] = pollCanvasDimensions();
    c.clearRect(0, 0, width, height);
    for (let [_, touch] of touches) {
      c.fillStyle = "teal";
      c.fillRect(touch.clientX, touch.clientY, touch.radiusX * 2, touch.radiusY * 2);
    }
    context("root", ({button, container}) => {
      const size = 400;
      container("container1", {
        x,
        y: 0,
        width: size,
        height: size,
        color: "black"
      }, ({button: button2}) => {
        button2("thing", frame % size, 10, 50, 50);
      });
      container("container5", {
        x: 0,
        y,
        width: size,
        height: size,
        color: "red"
      }, ({button: button2}) => {
        button2("thing", frame % size, 10, 50, 50);
      });
    });
    render();
    c.restore();
  });
  start();
})();
