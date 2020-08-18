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
  const fullscreenCanvas = (element) => {
    let dimensions = getWindowDimensions();
    setCanvasDimensions(element, dimensions[0], dimensions[1]);
    window.addEventListener("resize", (e) => {
      dimensions = getWindowDimensions();
      setCanvasDimensions(element, dimensions[0], dimensions[1]);
    });
    return () => dimensions;
  };
  const setupMouseHandlers = (element) => {
    const mouse3 = {
      x: 0,
      y: 0,
      buttons: [],
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
      console.log(e);
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
    static factory(push) {
      return (key, x, y, width, height, ...args) => push(new Button(key, x, y, width, height, ...args));
    }
    render(c2, container) {
      c2.fillStyle = this.color;
      c2.fillRect(container.x + this.x, container.y + this.y, this.width, this.height);
    }
  }
  class Container {
    constructor(key, x = 0, y = 0, width = 0, height = 0, color = "white") {
      this.key = key;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
    }
    render(c2, container) {
      const x = Math.max(this.x, container.x);
      const y = Math.max(this.y, container.y);
      const containerX = container.x + container.width;
      const containerY = container.y + container.height;
      c2.save();
      c2.rect(x, y, Math.min(this.width, containerX - x), Math.min(this.height, containerY - y));
      c2.clip();
      c2.fillStyle = this.color;
      c2.fillRect(this.x, this.y, this.width, this.height);
    }
    static factory(push) {
      return (key, ...args) => push(new Container(key, ...args));
    }
  }
  const init = (c2) => {
    const defaults2 = setDefaults(c2);
    let renderList = [];
    const push = (...rest) => renderList.push(...rest);
    const render2 = () => {
      let currentContext = {
        x: 0,
        y: 0,
        width: 2000,
        height: 2000
      };
      c2.restore();
      for (let renderable of renderList) {
        renderable.render(c2, currentContext);
        if (renderable instanceof Container) {
          currentContext = renderable;
        }
      }
      renderList = [];
    };
    const context2 = (key) => {
      return {
        key,
        button: Button.factory(push),
        checkbox: () => {
        },
        container: Container.factory(push)
      };
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
  const start = draw((dt) => {
    frame += dt;
    const mouse3 = pollMouse();
    const [width, height] = pollCanvasDimensions();
    const {button, checkbox, container} = context("root");
    c.clearRect(0, 0, width, height);
    container("container1", mouse3.x, mouse3.y, 400, 400, "black");
    button("first", 0, 10, 50, 50);
    render();
    c.restore();
  });
  start();
})();
