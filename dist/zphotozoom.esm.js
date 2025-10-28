/**
 * zPhotoZoom v2.0.0
 * A modern TypeScript library for interactive image zoom
 *
 * @license MIT
 * @author AMGHAR Abdeslam
 * @repository https://github.com/AMGHAR-AS/zPhotoZoom
 */
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "", value);
/**
 * zPhotoZoom - A Modern TypeScript Image Zoom Library (CORRECTED VERSION)
 *
 * @description
 * This is the CORRECTED version that maintains 100% compatibility with the original JavaScript.
 * All original functionality, structure, and even the typo "stoped" are preserved.
 *
 * @version 2.0.1-corrected
 * @license MIT
 * @author AMGHAR Abdeslam
 */
const injectStyles = () => {
  if (document.getElementById("z-photo-zoom-styles")) {
    return;
  }
  const styleElement = document.createElement("style");
  styleElement.id = "z-photo-zoom-styles";
  styleElement.textContent = `
    .ZPhotoZoom {
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 999999999;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .ZPhotoZoom img {
      position: absolute;
      cursor: grab;
    }

    .ZPhotoZoom img:active {
      cursor: grabbing;
    }

    .ZPhotoZoom span {
      color: white;
      line-height: 30px;
      font-weight: bold;
      position: fixed;
      top: calc(50vh - 25px);
      left: calc(50vw - 15px);
      background-color: rgba(114, 123, 135, 0.5);
      width: 50px;
      height: 30px;
      display: inline-block;
      vertical-align: middle;
      border-radius: 5px;
      text-align: center;
    }

    .ZPhotoZoom zloader {
      position: fixed;
      top: calc(50vh - 50px);
      left: calc(50vw - 50px);
      width: 40px;
      height: 40px;
      display: inline-block;
      vertical-align: middle;
      border-radius: 40px;
      border: 6px solid rgba(114, 123, 135, 0.4);
    }

    .ZPhotoZoom zloader:after {
      content: '';
      position: absolute;
      top: -6px;
      left: -6px;
      bottom: -6px;
      right: -6px;
      width: 40px;
      height: 40px;
      border-radius: 40px;
      border: 6px solid transparent;
      border-top-color: rgba(38, 38, 38, 0.27);
      -webkit-animation: zPhotoZoomSpin 1s linear infinite;
      animation: zPhotoZoomSpin 1s linear infinite;
    }

    @keyframes zPhotoZoomSpin {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(styleElement);
};
function imageProportion(image, callback) {
  const img = new Image();
  img.onload = function() {
    const height = this.height;
    const width = this.width;
    callback.call(this, width, height);
  };
  img.src = image;
}
function centerImage(image, container, min, max) {
  const prop = container.width / container.height;
  let newWidth, newHeight;
  if (image.landscape) {
    newWidth = 8 * container.width / 10;
    newHeight = newWidth / image.prop;
    if (newHeight > container.height) {
      newHeight = 9 * container.height / 10;
      newWidth = newHeight * image.prop;
    }
  } else {
    if (prop >= image.prop) {
      newHeight = 9 * container.height / 10;
      newWidth = newHeight * image.prop;
    } else {
      const tmp = image.prop - prop;
      newHeight = 9 * container.height / 10 - 8 * container.height / 10 * tmp;
      newWidth = newHeight * image.prop;
    }
  }
  let scale = Math.min(newWidth / image.width, newHeight / image.height);
  if (typeof min !== "number" || min <= 0) {
    min = 0.3;
    if (scale < min) {
      min = scale;
    }
  } else if (scale < min) {
    scale = min;
  }
  if (typeof max !== "number" || max < min) {
    max = 5;
    if (scale > max) {
      max = scale;
      scale = 3;
    }
  } else if (scale > max) {
    scale = max;
  }
  return {
    width: newWidth,
    height: newHeight,
    x: (container.width - newWidth) / 2,
    y: (container.height - newHeight) / 2,
    scale,
    min,
    max
  };
}
function calculateNewCenter(cursors) {
  if (cursors.length === 1) {
    return {
      x: cursors[0].x,
      y: cursors[0].y
    };
  } else {
    const cursorsCopy = Array.prototype.slice.call(cursors).map((cursor) => ({
      x: cursor.x,
      y: cursor.y
    }));
    return {
      x: cursorsCopy.map((c) => c.x).reduce((a, b) => a + b) / cursorsCopy.length,
      y: cursorsCopy.map((c) => c.y).reduce((a, b) => a + b) / cursorsCopy.length
    };
  }
}
function closeViewer() {
  const thisInstance = this;
  const process = this._process;
  let prevent = false;
  let stop = false;
  for (let i = 0; i < process.eventsClose.length; i++) {
    process.eventsClose[i]({
      preventDefault: () => {
        prevent = true;
      },
      stopPropagation: () => {
        stop = true;
      },
      target: process.currentImage.image.node,
      instance: thisInstance
    });
    if (prevent) return;
    if (stop) break;
  }
  process.flags = {
    isAnimated: false,
    isMoved: false,
    wheel: false,
    movements: 0,
    updateAttempt: false,
    updated: false,
    zoomIn: false,
    loader: false,
    stoped: process.flags.stoped
    // Preserve typo!
  };
  try {
    process.currentImage.image.evener.remove();
  } catch (e) {
  }
  if (process.container) {
    process.preview.container.removeChild(process.currentImage.imageNode);
    process.preview.evener(true);
  } else {
    const body = process.context.body || process.context.getElementsByTagName("body")[0];
    body.removeChild(process.preview.container);
  }
  if (process.flags.loader) {
    clearTimeout(process.flags.loader);
    process.flags.loader = false;
  }
  process.preview = false;
  process.loader = false;
}
function showLoader(text, timeout) {
  const process = this._process;
  if (process.container) {
    return;
  }
  if (process.loader) {
    process.preview.container.removeChild(process.loader);
    if (process.flags.loader) {
      clearTimeout(process.flags.loader);
      process.flags.loader = false;
    }
  }
  if (text) {
    process.loader = process.context.createElement("SPAN");
    process.loader.innerText = " " + text;
  } else {
    process.loader = process.context.createElement("ZLOADER");
  }
  process.loader.style.opacity = "1";
  process.preview.container.appendChild(process.loader);
  if (timeout) {
    hideLoader.call(this, timeout);
  }
}
function hideLoader(timeout) {
  const process = this._process;
  if (process.loader) {
    if (process.flags.loader) {
      clearTimeout(process.flags.loader);
    }
    process.loader.style.transition = "opacity " + timeout + "ms";
    process.flags.loader = setTimeout(() => {
      if (process.preview) {
        process.preview.container.removeChild(process.loader);
      }
      process.loader = false;
      process.flags.loader = false;
    }, timeout);
  }
}
function getContainerPreview() {
  const thisInstance = this;
  const process = this._process;
  let moved = false;
  let interaction = false;
  function mouseDown(e) {
    if (e.button === 0) {
      interaction = true;
      if (!process.flags.isMoved) {
        moved = false;
      }
    }
  }
  function mousemove(e) {
    if (process.flags.isMoved || interaction) {
      moved = true;
    }
  }
  function mouseup(e) {
    const body2 = process.context.body || process.context.getElementsByTagName("body")[0];
    if ((this === e.target || !body2) && !moved && interaction) {
      try {
        closeViewer.call(thisInstance);
      } catch (e2) {
      }
    }
    moved = false;
    interaction = false;
    e.stopPropagation();
    e.preventDefault();
  }
  let body;
  let container;
  let context;
  if (process.container) {
    container = process.container;
    context = process.context;
  } else {
    container = process.context.createElement("DIV");
    container.setAttribute("class", "ZPhotoZoom");
    body = process.context.body || process.context.getElementsByTagName("body")[0];
    context = container;
  }
  return {
    container,
    apply: function() {
      if (body) {
        body.appendChild(container);
      }
    },
    evener: function(remove) {
      if (remove) {
        context.removeEventListener("mousedown", mouseDown);
        context.removeEventListener("mousemove", mousemove);
        context.removeEventListener("mouseup", mouseup);
      } else {
        setTimeout(function() {
          context.addEventListener("mousedown", mouseDown);
          context.addEventListener("mousemove", mousemove);
          context.addEventListener("mouseup", mouseup);
        }, 100);
      }
    }
  };
}
function openViewer(image) {
  const thisInstance = this;
  const process = this._process;
  let prevent = false;
  let stop = false;
  for (let i = 0; i < process.eventsOpen.length; i++) {
    process.eventsOpen[i]({
      preventDefault: () => {
        prevent = true;
      },
      stopPropagation: () => {
        stop = true;
      },
      target: image.node,
      // Note: image.node, not currentImage!
      instance: thisInstance
    });
    if (prevent) return;
    if (stop) break;
  }
  let imageNode;
  let nf = {};
  process.preview = getContainerPreview.call(thisInstance);
  if (image.loaded) {
    imageNode = image.imageNode;
    process.preview.container.appendChild(imageNode);
    nf = centerImage(image, getContainerTarget.call(thisInstance).nf, process.scaleLimit.min, process.scaleLimit.max);
    updateScaleImage.call(thisInstance, nf.scale, {
      x: nf.x / nf.scale,
      y: nf.y / nf.scale
    });
  } else {
    showLoader.call(thisInstance);
  }
  process.preview.apply();
  process.preview.evener();
  const nfc = getContainerTarget.call(thisInstance).nf;
  process.currentImage = {
    image,
    imageNode,
    animate: false,
    factor: nf.scale,
    distanceFactor: 1,
    scale: nf.scale,
    origin: nf,
    center: {
      x: nfc.cx,
      // Important: cx!
      y: nfc.cy
      // Important: cy!
    },
    minScale: nf.min,
    maxScale: nf.max,
    x: nf.x,
    y: nf.y,
    width: function() {
      return process.currentImage.imageNode.offsetWidth;
    },
    height: function() {
      return process.currentImage.imageNode.offsetHeight;
    }
  };
  if (image.loaded) {
    image.evener.apply();
  }
}
function getContainerTarget() {
  const container = this._process.container;
  if (container) {
    const nf = this._process.container.getBoundingClientRect();
    return {
      container,
      nf: {
        width: nf.width,
        height: nf.height,
        top: nf.top,
        left: nf.left,
        cx: nf.left + nf.width / 2,
        // Important: cx!
        cy: nf.top + nf.height / 2,
        // Important: cy!
        x: 0,
        y: 0
      }
    };
  } else {
    return {
      container: null,
      nf: {
        width: window.innerWidth,
        height: window.innerHeight,
        top: 0,
        left: 0,
        cx: window.innerWidth / 2,
        // Important: cx!
        cy: window.innerHeight / 2,
        // Important: cy!
        x: 0,
        y: 0
      }
    };
  }
}
function initImageEvents(imageNode) {
  const thisInstance = this;
  const process = this._process;
  let fingers = 0;
  let pointA = null;
  let interaction = false;
  let dragInteraction = false;
  let lastTimeClick = null;
  function getCursorsPositions(cursors) {
    let posTop = 0;
    let posLeft = 0;
    const scrollTop = process.context.documentElement.scrollTop || process.context.body.scrollTop;
    const scrollLeft = process.context.documentElement.scrollLeft || process.context.body.scrollLeft;
    const nfc = getContainerTarget.call(thisInstance).nf;
    posTop = nfc.top + scrollTop;
    posLeft = nfc.left + scrollLeft;
    const positions = [];
    for (let i = 0; i < cursors.length; i++) {
      positions.push({
        x: cursors[i].pageX - posLeft,
        y: cursors[i].pageY - posTop
      });
    }
    return positions;
  }
  function isDoubleClick(e) {
    if (!dragInteraction) {
      const time = (/* @__PURE__ */ new Date()).getTime();
      if (time - lastTimeClick < 320) {
        doubleClickZoom.call(thisInstance, pointA[0]);
        cleanClickInteraction();
        e.stopPropagation();
        e.preventDefault();
      }
      return time;
    }
    return 0;
  }
  function cleanClickInteraction(timer) {
    lastTimeClick = timer || null;
    interaction = false;
  }
  function cleanDragInteraction() {
    pointA = null;
    dragInteraction = false;
  }
  function clickEvent(e) {
    if (e.type === "mousedown") {
      const mouseEvent = e;
      if (mouseEvent.button === 0) {
        interaction = true;
        pointA = getCursorsPositions([mouseEvent]);
        e.stopPropagation();
        e.preventDefault();
      }
    } else if (e.type === "touchstart") {
      const touchEvent = e;
      interaction = true;
      fingers = touchEvent.touches.length;
      pointA = getCursorsPositions(touchEvent.touches);
    }
  }
  function wheelEvent(e) {
    if (!interaction && !pointA) {
      let factor = 1;
      if (e.deltaY < 0) {
        factor = -1;
      }
      wheelZoom.call(thisInstance, getCursorsPositions([e])[0], factor);
      e.stopPropagation();
      e.preventDefault();
    }
  }
  function mouseMove(e) {
    if (interaction) {
      if (e.button === 0) {
        dragInteraction = true;
        const pointB = getCursorsPositions([e]);
        if (pointA) {
          drag.call(thisInstance, pointA[0], pointB[0]);
        }
        pointA = pointB;
        e.stopPropagation();
        e.preventDefault();
      } else {
        cleanClickInteraction(lastTimeClick);
        cleanDragInteraction();
      }
    }
  }
  function touchMove(e) {
    if (fingers > 0) {
      if (!pointA) {
        pointA = getCursorsPositions(e.touches);
      } else if (fingers === 1) {
        dragInteraction = true;
        const pointB = getCursorsPositions(e.touches);
        drag.call(thisInstance, pointA[0], pointB[0]);
        pointA = pointB;
        e.stopPropagation();
        e.preventDefault();
      } else if (fingers >= 2) {
        if (pointA.length < 2) {
          pointA = getCursorsPositions(e.touches);
        } else {
          touchZoom.call(thisInstance, pointA, getCursorsPositions(e.touches));
          e.stopPropagation();
          e.preventDefault();
        }
      }
    }
  }
  function clickUp(e) {
    if (e.button === 0) {
      if (interaction) {
        lastTimeClick = isDoubleClick(e);
      }
      cleanClickInteraction(lastTimeClick);
      cleanDragInteraction();
    }
  }
  function touchEnd(e) {
    if (interaction) {
      if (fingers === 1) {
        lastTimeClick = isDoubleClick(e);
        cleanDragInteraction();
        process.currentImage.distanceFactor = 1;
      }
      fingers = e.touches.length;
      if (fingers === 0) {
        cleanClickInteraction();
        cleanDragInteraction();
        process.flags.movements = 0;
        process.currentImage.distanceFactor = 1;
      } else {
        cleanDragInteraction();
      }
    } else {
      process.flags.movements = 0;
      process.currentImage.distanceFactor = 1;
      cleanClickInteraction();
      cleanDragInteraction();
    }
  }
  return {
    remove: function() {
      imageNode.removeEventListener("wheel", wheelEvent, { passive: false });
      imageNode.removeEventListener("mousedown", clickEvent, { passive: false });
      imageNode.removeEventListener("touchstart", clickEvent, { passive: false });
      imageNode.removeEventListener("mousemove", mouseMove);
      imageNode.removeEventListener("touchmove", touchMove, { passive: false });
      process.context.removeEventListener("mouseup", clickUp, { passive: false, capture: true });
      process.context.removeEventListener("touchend", touchEnd, { passive: false, capture: true });
    },
    apply: function() {
      fingers = 0;
      pointA = null;
      interaction = false;
      dragInteraction = false;
      lastTimeClick = null;
      imageNode.addEventListener("wheel", wheelEvent, { passive: false });
      imageNode.addEventListener("mousedown", clickEvent, { passive: false });
      imageNode.addEventListener("touchstart", clickEvent, { passive: false });
      imageNode.addEventListener("mousemove", mouseMove);
      imageNode.addEventListener("touchmove", touchMove, { passive: false });
      process.context.addEventListener("mouseup", clickUp, { passive: false, capture: true });
      process.context.addEventListener("touchend", touchEnd, { passive: false, capture: true });
    }
  };
}
function drag(pointA, pointB) {
  const process = this._process;
  if (!process.flags.movements && !process.flags.isAnimated) {
    process.flags.isMoved = true;
    process.currentImage.x += pointB.x - pointA.x;
    process.currentImage.y += pointB.y - pointA.y;
    updateScaleImage.call(this, process.currentImage.factor, {
      x: process.currentImage.x / process.currentImage.factor,
      y: process.currentImage.y / process.currentImage.factor
    }, false);
  }
}
function wheelZoom(center, m) {
  const process = this._process;
  if (process.flags.updateAttempt || process.flags.stoped) {
    return;
  }
  if (m > 0) {
    process.currentImage.scale -= 0.05;
  } else {
    process.currentImage.scale += 0.05;
  }
  const oldFactor = process.currentImage.factor;
  process.currentImage.scale = Math.min(process.currentImage.maxScale, Math.max(process.currentImage.scale, process.currentImage.minScale));
  process.currentImage.factor = process.currentImage.scale;
  const inf = process.currentImage.imageNode.getBoundingClientRect();
  const nf = getContainerTarget.call(this).nf;
  process.currentImage.x -= (process.currentImage.factor / oldFactor - 1) * (center.x - inf.left + nf.left);
  process.currentImage.y -= (process.currentImage.factor / oldFactor - 1) * (center.y - inf.top + nf.top);
  updateScaleImage.call(this, process.currentImage.factor, {
    x: process.currentImage.x / process.currentImage.factor,
    y: process.currentImage.y / process.currentImage.factor
  });
  process.currentImage.center = center;
  process.flags.wheel = setTimeout(function() {
    process.flags.wheel = false;
  }, 600);
}
function doubleClickZoom(center) {
  const process = this._process;
  if (process.flags.isAnimated || process.flags.updateAttempt || process.flags.stoped) {
    return;
  }
  if (process.currentImage.scale <= process.currentImage.origin.scale) {
    const oldFactor = process.currentImage.factor;
    const inf = process.currentImage.imageNode.getBoundingClientRect();
    const nf = getContainerTarget.call(this).nf;
    process.currentImage.scale = Math.min(process.currentImage.maxScale, Math.max(process.currentImage.scale + 2, process.currentImage.minScale));
    process.currentImage.factor = process.currentImage.scale;
    process.currentImage.x -= (process.currentImage.factor / oldFactor - 1) * (center.x - inf.left + nf.left);
    process.currentImage.y -= (process.currentImage.factor / oldFactor - 1) * (center.y - inf.top + nf.top);
    process.currentImage.center = center;
    updateScaleImage.call(this, process.currentImage.factor, {
      x: process.currentImage.x / process.currentImage.factor,
      y: process.currentImage.y / process.currentImage.factor
    }, true);
  } else {
    restoreOriginStatus.call(this);
  }
}
function restoreOriginStatus() {
  const process = this._process;
  process.currentImage.scale = process.currentImage.origin.scale;
  process.currentImage.factor = process.currentImage.origin.scale;
  process.currentImage.x = process.currentImage.origin.x;
  process.currentImage.y = process.currentImage.origin.y;
  process.currentImage.minScale = process.currentImage.origin.min;
  process.currentImage.maxScale = process.currentImage.origin.max;
  const nfc = getContainerTarget.call(this).nf;
  process.currentImage.center = {
    x: nfc.cx,
    // Important: cx!
    y: nfc.cy
    // Important: cy!
  };
  updateScaleImage.call(this, process.currentImage.factor, {
    x: process.currentImage.x / process.currentImage.factor,
    y: process.currentImage.y / process.currentImage.factor
  }, true);
}
function touchZoom(lastTouches, nextTouches) {
  const thisInstance = this;
  const process = this._process;
  function calculateScale(touchA, TouchB) {
    function distance(a, b) {
      const x = a.x - b.x;
      const y = a.y - b.y;
      return Math.sqrt(x * x + y * y);
    }
    return distance(TouchB[0], TouchB[1]) / distance(touchA[0], touchA[1]);
  }
  if (process.flags.updateAttempt || process.flags.stoped) {
    return;
  }
  const oldScale = process.currentImage.distanceFactor;
  process.currentImage.distanceFactor = calculateScale(lastTouches, nextTouches);
  const scale = process.currentImage.distanceFactor / oldScale;
  if (scale < 1) {
    if (!process.flags.zoomIn) {
      process.flags.zoomIn = true;
    }
  } else if (process.flags.zoomIn) {
    process.flags.zoomIn = false;
  }
  process.currentImage.scale *= scale;
  const center = calculateNewCenter(nextTouches);
  const oldFactor = process.currentImage.factor;
  process.currentImage.factor = Math.min(process.currentImage.maxScale, Math.max(process.currentImage.scale, process.currentImage.minScale));
  const inf = process.currentImage.imageNode.getBoundingClientRect();
  if (!!process.flags.movements && process.flags.movements > 1) {
    const nf = getContainerTarget.call(thisInstance).nf;
    process.currentImage.x -= (process.currentImage.factor / oldFactor - 1) * (center.x - inf.left + nf.left) - (center.x - process.currentImage.center.x);
    process.currentImage.y -= (process.currentImage.factor / oldFactor - 1) * (center.y - inf.top + nf.top) - (center.y - process.currentImage.center.y);
    if (!process.flags.updated && !process.flags.isAnimated) {
      process.flags.updated = true;
      setTimeout(function() {
        updateScaleImage.call(thisInstance, process.currentImage.factor, {
          x: process.currentImage.x / process.currentImage.factor,
          y: process.currentImage.y / process.currentImage.factor
        });
        process.flags.updated = false;
      }, 0);
    }
  }
  process.currentImage.center = center;
  process.flags.movements += 1;
}
function updateScaleImage(factor, translate, animate) {
  const process = this._process;
  if (process.flags.isAnimated) {
    return;
  }
  process.flags.isAnimated = true;
  let text = Math.round(factor * 100);
  if (text < 100) {
    text = " " + text;
  }
  showLoader.call(this, text + "%", 800);
  setTimeout(function() {
    process.flags.isAnimated = false;
    const transform3d = "scale3d(" + factor + "," + factor + ",1) translate3d(" + translate.x + "px," + translate.y + "px,0px)";
    const transform2d = "scale(" + factor + ", " + factor + ") translate(" + translate.x + "px," + translate.y + "px)";
    if (process.currentImage.animate) {
      clearTimeout(process.currentImage.animate);
    }
    if (animate) {
      process.currentImage.animate = setTimeout(function() {
        process.currentImage.imageNode.style.transition = "";
        process.currentImage.animate = false;
        process.flags.isMoved = false;
      }, 500);
    } else {
      process.currentImage.imageNode.style.transition = "";
      process.currentImage.animate = setTimeout(function() {
        process.flags.isMoved = false;
      }, 100);
    }
    process.currentImage.imageNode.style.transformOrigin = "top left";
    process.currentImage.imageNode.style.webkitTransformOrigin = "top left";
    process.currentImage.imageNode.style.transform = transform3d;
    process.currentImage.imageNode.style.webkitTransform = transform3d;
    process.currentImage.imageNode.style.mozTransform = transform2d;
    process.currentImage.imageNode.style.msTransform = transform2d;
    process.currentImage.imageNode.style.oTransform = transform2d;
  });
}
function getImages() {
  const thisInstance = this;
  const process = this._process;
  const selector = process.selector;
  const context = process.context;
  function treat(image) {
    imageProportion(image.src, function(width, height) {
      image.imageNode = this;
      image.loaded = true;
      image.width = width;
      image.height = height;
      image.prop = width / height;
      image.landscape = width >= height;
      image.evener = initImageEvents.call(thisInstance, this);
      if (process.preview) {
        if (process.currentImage.image === image) {
          process.currentImage.imageNode = this;
          process.preview.container.appendChild(process.currentImage.imageNode);
          process.currentImage.origin = centerImage(image, getContainerTarget.call(thisInstance).nf, process.scaleLimit.min, process.scaleLimit.max);
          hideLoader.call(thisInstance, 480);
          restoreOriginStatus.call(thisInstance);
          image.evener.apply();
        }
      }
    });
  }
  const images = [];
  let nodes = [];
  if (selector && typeof selector === "string" && context && Node.DOCUMENT_NODE === context.nodeType) {
    if (/\s+[^#]|>|\[|\.|,/.test(selector)) {
      nodes = Array.from(context.querySelectorAll(selector));
    } else {
      const singleNode = context.querySelector(selector);
      if (singleNode) {
        nodes = [singleNode];
      }
    }
  }
  if ((Array.isArray(nodes) || nodes instanceof NodeList) && nodes.length > 0) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const image = {
        node,
        src: ""
      };
      let tmp = false;
      if (node.tagName === "IMG" && node.src) {
        tmp = node.src;
      } else {
        const bgImage = getComputedStyle(node).backgroundImage;
        if (bgImage) {
          if (/^url\(/.test(bgImage)) {
            try {
              const match = bgImage.match(/url\(["']?([^"']*)["']?\)/);
              tmp = match ? match[1] : false;
            } catch (e) {
              tmp = false;
            }
          } else {
            tmp = false;
          }
        }
      }
      if (tmp) {
        image.src = tmp;
        treat(image);
        images.push(image);
      }
    }
  }
  return images;
}
function initViewerEvent(image, remove) {
  const thisInstance = this;
  let click = false;
  let moved = false;
  function openViewerEvent(e) {
    if (!moved) {
      openViewer.call(thisInstance, image);
    }
    moved = false;
    click = false;
  }
  function clicked() {
    click = true;
  }
  function preventMove() {
    if (click) {
      moved = true;
    }
  }
  if (remove) {
    image.node.removeEventListener("click", openViewerEvent);
    image.node.removeEventListener("touchstart", clicked);
    image.node.removeEventListener("touchend", openViewerEvent);
    image.node.removeEventListener("touchmove", preventMove);
  } else {
    image.node.addEventListener("click", openViewerEvent);
    image.node.addEventListener("touchstart", clicked);
    image.node.addEventListener("touchend", openViewerEvent);
    image.node.addEventListener("touchmove", preventMove);
  }
}
function initImages() {
  const process = this._process;
  process.images = getImages.call(this);
  if (process.images.length > 0) {
    for (let i = 0; i < process.images.length; i++) {
      initViewerEvent.call(this, process.images[i]);
    }
  }
}
function applyProcess(object, context) {
  Object.defineProperty(this, "_process", {
    value: {
      preview: null,
      loader: null,
      eventsOpen: [],
      eventsClose: [],
      images: [],
      flags: {
        isAnimated: false,
        isMoved: false,
        wheel: false,
        movements: 0,
        updateAttempt: false,
        updated: false,
        zoomIn: false,
        loader: false,
        stoped: false
        // Preserve typo!
      },
      container: object.container,
      scaleLimit: {
        min: object.min,
        max: object.max
      },
      selector: object.el,
      context: context || document,
      currentImage: null
    },
    configurable: false,
    enumerable: false,
    writable: false
  });
}
function initialize() {
  const thisInstance = this;
  const process = thisInstance._process;
  initImages.call(thisInstance);
  window.addEventListener("resize", function() {
    function reload() {
      process.flags.updateAttempt = setTimeout(function() {
        if (!process.flags.isAnimated) {
          restoreOriginStatus.call(thisInstance);
          process.flags.updateAttempt = false;
        } else {
          reload();
        }
      }, 70);
    }
    if (process.preview) {
      const nf = centerImage(process.currentImage.image, getContainerTarget.call(thisInstance).nf, process.scaleLimit.min, process.scaleLimit.max);
      process.currentImage.origin = nf;
      reload();
    }
  });
}
class zPhotoZoom {
  constructor(object, context) {
    __publicField(this, "_process");
    injectStyles();
    if (!(this instanceof zPhotoZoom)) {
      return console.error("zPhotoZoom is a class and can only be called with the keyword 'new'");
    }
    if (object) {
      if (typeof object === "object") {
        applyProcess.call(this, object, context);
      }
      if (typeof object.el === "string") {
        initialize.call(this);
      }
    }
  }
  /**
   * Stop all interactions
   */
  stop() {
    this._process.flags.stoped = true;
  }
  /**
   * Resume interactions
   */
  resume() {
    this._process.flags.stoped = false;
  }
  /**
   * Reset image to original state
   */
  reset() {
    if (this._process.preview) {
      restoreOriginStatus.call(this);
    }
  }
  /**
   * Close the viewer
   */
  close() {
    if (this._process.preview) {
      closeViewer.call(this);
    }
  }
  /**
   * Update image scale
   */
  update() {
    const process = this._process;
    if (process.preview) {
      updateScaleImage.call(this, process.currentImage.factor, {
        x: process.currentImage.x / process.currentImage.factor,
        y: process.currentImage.y / process.currentImage.factor
      });
    }
  }
  /**
   * Change selector
   */
  change(targets) {
    const process = this._process;
    if (typeof targets === "string") {
      if (process.preview) {
        closeViewer.call(this);
      }
      for (let i = 0; i < process.images.length; i++) {
        initViewerEvent.call(this, process.images[i], true);
      }
      process.selector = targets;
      process.images = [];
      initImages.call(this);
    }
  }
  /**
   * Register onOpen callback
   */
  onOpen(callback, remove) {
    const process = this._process;
    if (typeof callback === "function") {
      if (remove) {
        for (let i = process.eventsOpen.length - 1; i >= 0; i--) {
          if (process.eventsOpen[i] === callback) {
            process.eventsOpen.splice(i, 1);
          }
        }
      } else {
        process.eventsOpen.push(callback);
      }
    }
  }
  /**
   * Register onClose callback
   */
  onClose(callback, remove) {
    const process = this._process;
    if (typeof callback === "function") {
      if (remove) {
        for (let i = process.eventsClose.length - 1; i >= 0; i--) {
          if (process.eventsClose[i] === callback) {
            process.eventsClose.splice(i, 1);
          }
        }
      } else {
        process.eventsClose.push(callback);
      }
    }
  }
}
export {
  zPhotoZoom as default,
  zPhotoZoom
};
//# sourceMappingURL=zphotozoom.esm.js.map
