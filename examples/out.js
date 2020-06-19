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
    const mouse6 = {
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
        mouse6.x = e.offsetX;
        mouse6.y = e.offsetY;
      }
    });
    element.addEventListener("mousedown", (e) => {
      mouse6.buttons[e.button] = true;
      clickedThisPoll = true;
    });
    element.addEventListener("mouseup", (e) => {
      mouse6.buttons[e.button] = false;
    });
    element.addEventListener("mouseleave", (e) => {
      mouse6.buttons = [];
    });
    element.addEventListener("mouseout", (e) => {
      mouse6.buttons = [];
    });
    element.addEventListener("blur", (e) => {
      mouse6.buttons = [];
    });
    element.addEventListener("wheel", (e) => {
      console.log(e);
    });
    element.addEventListener("contextmenu", (e) => e.preventDefault());
    element.addEventListener("dragenter", (e) => e.preventDefault());
    const poll = () => {
      mouse6.clicked = clickedThisPoll;
      clickedThisPoll = false;
      return mouse6;
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

  // src/button.ts
  const ButtonOptionDefaults = {
    x: 0,
    y: 0,
    color: "#f1faee",
    backgroundColor: "#457b9d",
    font: "sans-serif",
    fontSize: 16,
    label: "",
    padding: 4
  };
  const defaultButtonOutputs = {
    clicked: false,
    hovering: false,
    down: false
  };
  const SimpleButtonFactory = (c2, key, mouse6, defaultOptions = {}) => {
    const optionDefaults = {
      ...ButtonOptionDefaults,
      ...defaultOptions
    };
    const Button2 = (option) => {
      let outputs, textMeasurement;
      {
        let {x: x2, y: y2, width: width2, height: height2, label: label2, font, fontSize: fontSize2, padding: padding2} = {
          ...optionDefaults,
          ...option instanceof Function ? option(defaultButtonOutputs) : option
        };
        if (fontSize2 && font)
          c2.font = `${fontSize2}px ${font}`;
        const {width: _textMeasurement} = c2.measureText(label2);
        textMeasurement = _textMeasurement;
        width2 = width2 ?? 2 * padding2 + textMeasurement;
        height2 = height2 ?? 2 * padding2 + fontSize2;
        const mo = 0.5;
        const hovering = intersection({
          x: x2,
          y: y2,
          width: width2,
          height: height2
        }, {
          x: mouse6.x - mo,
          y: mouse6.y - mo,
          width: mo,
          height: mo
        });
        outputs = {
          hovering,
          clicked: hovering && mouse6.clicked,
          down: hovering && mouse6.buttons.some(Boolean)
        };
      }
      let {x, y, label, padding, width, height, fontSize, backgroundColor, color} = {
        ...optionDefaults,
        ...option instanceof Function ? option(outputs) : option
      };
      width = width ?? 2 * padding + textMeasurement;
      height = height ?? 2 * padding + fontSize;
      c2.fillStyle = backgroundColor;
      const textWidth = Math.min(textMeasurement, width);
      c2.fillRect(x, y, width, height);
      c2.fillStyle = color;
      c2.fillText(label, x + width / 2 - textWidth / 2, y + height / 2 + fontSize / 2, width);
      return outputs;
    };
    return Button2;
  };
  const button_default = SimpleButtonFactory;

  // src/checkbox.ts
  const defaultCheckboxOutput = {
    checked: false
  };
  const defaultCheckboxOptions = {
    x: 0,
    y: 0,
    size: 25
  };
  const checkboxState = new Map();
  const CheckboxContext = (c2, key, mouse6, defaultOptions) => {
    const newOptions = {
      ...defaultCheckboxOptions,
      ...defaultOptions
    };
    const button3 = button_default(c2, key, mouse6);
    const currentCheckboxId = key;
    let id = 0;
    const checkbox3 = (options) => {
      const {size, default: def, ...finalOptions} = {
        ...newOptions,
        ...options instanceof Function ? options(defaultCheckboxOutput) : options
      };
      const factoryState = checkboxState.get(currentCheckboxId) ?? new Map();
      checkboxState.set(currentCheckboxId, factoryState);
      const stateId = id++;
      const state = factoryState.get(stateId) ?? def;
      const {clicked} = button3(({clicked: clicked2, hovering}) => ({
        backgroundColor: !hovering ? "grey" : "lightgray",
        label: clicked2 != state ? "X" : "",
        width: size,
        height: size,
        ...finalOptions
      }));
      factoryState.set(stateId, clicked != state);
      return {
        checked: clicked != state
      };
    };
    return checkbox3;
  };
  const checkbox_default = CheckboxContext;

  // src/container.ts
  const defaultContainerOptions = {
    backgroundColor: "rgba(20, 130, 20, 0.4)"
  };
  const ContainerFactory = (c2, mouse6, contextFactory, defaultOverrides) => {
    const newOptions = {
      ...defaultContainerOptions,
      ...defaultOverrides
    };
    const container2 = (key, options) => {
      const {x, y, width, height, backgroundColor} = {
        ...newOptions,
        ...options
      };
      const context2 = contextFactory(key, mouse6, {
        x,
        y
      });
      c2.save();
      c2.rect(x, y, width, height);
      c2.clip();
      c2.fillStyle = backgroundColor;
      c2.fillRect(x, y, width, height);
      return context2;
    };
    return container2;
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
  const resetDefaults = (c2, oldDefaults) => {
    for (let [key, value] of Object.entries(defaults)) {
      c2[key] = value;
    }
  };
  const init = (c2) => {
    const defaults2 = setDefaults(c2);
    const reset2 = () => {
      resetDefaults(c2, defaults2);
    };
    const context2 = (key, mouse6, defaultOptions = {}) => {
      const button3 = button_default(c2, key, mouse6, defaultOptions);
      const checkbox3 = checkbox_default(c2, key, mouse6, defaultOptions);
      const container2 = ContainerFactory(c2, mouse6, context2);
      c2.restore();
      return {
        button: button3,
        checkbox: checkbox3,
        container: container2
      };
    };
    return {
      reset: reset2,
      context: context2
    };
  };

  // examples/example.ts
  const canvas = document.getElementById("canvas");
  const pollCanvasDimensions = fullscreenCanvas(canvas);
  const pollMouse = setupMouseHandlers(canvas);
  const c = canvas.getContext("2d");
  const {context, reset} = init(c);
  let frame = 0;
  let showMovingButton = false;
  let hits = 0;
  const start = draw((dt) => {
    frame += dt;
    const mouse6 = pollMouse();
    const [width, height] = pollCanvasDimensions();
    const {button: button3, checkbox: checkbox3, container: container2} = context("root", mouse6);
    c.clearRect(0, 0, width, height);
    const {clicked} = button3(({hovering}) => ({
      label: JSON.stringify(mouse6),
      x: 0,
      y: height - 70,
      fontSize: 20,
      backgroundColor: hovering ? "blue" : "red",
      color: hovering ? "red" : "blue",
      padding: hovering ? 20 : 15
    }));
    if (clicked)
      alert(`You clicked on the button!`);
    const {checked} = checkbox3({
      size: 40,
      x: width / 2 - 40 / 2,
      default: false
    });
    if (checked) {
      const {checkbox: checkbox4, button: button4} = container2("hidden-weird-checkbox-toggler", {
        x: width / 4,
        y: height / 4,
        width: width / 2,
        height: height / 2
      });
      const {checked: checked2} = checkbox4({
        default: showMovingButton
      });
      showMovingButton = checked2;
      const {clicked: clicked2} = button4({
        label: "Reset Game",
        y: height / 4 + 50
      });
      if (clicked2)
        hits = 0;
      if (showMovingButton) {
        const {button: button5} = context("moving-button-context", mouse6);
        const {clicked: clicked3} = button5(({hovering, down}) => ({
          backgroundColor: [down && "rgba(230, 40, 40, 0.8)", hovering && "rgba(40, 40, 230, 0.8)", "rgba(20, 230, 40, 0.8)"].find(Boolean),
          x: frame % width,
          y: 40,
          width: 30,
          height: 30
        }));
        if (clicked3)
          hits++;
        c.fillStyle = "black";
        c.font = `20px sans-serif`;
        c.fillText(`Hits: ${hits}`, 0, 20);
      }
    } else {
      const {checkbox: checkbox4} = container2("default-checkbox-container", {
        x: width / 4,
        y: height / 4,
        width: width / 2,
        height: height / 2
      });
      for (let i = 0; i < 20; i++) {
        checkbox4({
          y: height / 4 + i * 30
        });
      }
    }
    reset();
  });
  start();
})();
