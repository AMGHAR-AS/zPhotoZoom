/**
 * zPhotoZoom v2.0.0
 * A modern TypeScript library for interactive image zoom
 *
 * @license MIT
 * @author AMGHAR Abdeslam
 * @repository https://github.com/AMGHAR-AS/zPhotoZoom
 */
var __defProp$7 = Object.defineProperty;
var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$7 = (obj, key, value) => __defNormalProp$7(obj, typeof key !== "symbol" ? key + "" : key, value);
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
  thisInstance._callPluginHook("beforeClose", {
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
  thisInstance._callPluginHook("afterClose", {
    preventDefault: () => {
    },
    stopPropagation: () => {
    },
    target: process.currentImage?.image.node || null,
    instance: thisInstance
  });
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
  thisInstance._callPluginHook("beforeOpen", {
    preventDefault: () => {
      prevent = true;
    },
    stopPropagation: () => {
      stop = true;
    },
    target: image.node,
    instance: thisInstance
  });
  if (prevent) return;
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
  thisInstance._callPluginHook("afterOpen", {
    preventDefault: () => {
    },
    stopPropagation: () => {
    },
    target: image.node,
    instance: thisInstance
  });
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
    __publicField$7(this, "_process");
    __publicField$7(this, "_plugins", /* @__PURE__ */ new Map());
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
  // ============================================================================
  // Plugin System
  // ============================================================================
  /**
   * Register a plugin
   */
  registerPlugin(plugin) {
    if (this._plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already registered`);
      return;
    }
    const api = {
      getImageState: () => this.getImageState(),
      setImageTransform: (scale, x, y, animate) => this.setImageTransform(scale, x, y, animate),
      centerImage: (options) => this.centerImageWithOptions(options),
      resetImage: () => this.reset(),
      getCurrentImageElement: () => this.getCurrentImageElement(),
      getPreviewContainer: () => this.getPreviewContainer(),
      isViewerOpen: () => this.isViewerOpen(),
      closeViewer: () => this.close()
    };
    this._plugins.set(plugin.name, { plugin, api });
    plugin.initialize(this, api);
    if (plugin.onRegister) {
      plugin.onRegister();
    }
  }
  /**
   * Unregister a plugin
   */
  unregisterPlugin(name) {
    const entry = this._plugins.get(name);
    if (!entry) {
      console.warn(`Plugin "${name}" is not registered`);
      return;
    }
    if (entry.plugin.onDestroy) {
      entry.plugin.onDestroy();
    }
    if (entry.plugin.destroy) {
      entry.plugin.destroy();
    }
    this._plugins.delete(name);
  }
  /**
   * Get registered plugin by name
   */
  getPlugin(name) {
    return this._plugins.get(name)?.plugin;
  }
  /**
   * Call plugin hooks
   * @private
   */
  _callPluginHook(hookName, ...args) {
    this._plugins.forEach(({ plugin }) => {
      const hook = plugin[hookName];
      if (typeof hook === "function") {
        hook.apply(plugin, args);
      }
    });
  }
  // ============================================================================
  // Plugin API Methods
  // ============================================================================
  /**
   * Get current image state (for plugins)
   */
  getImageState() {
    const process = this._process;
    if (!process.currentImage) {
      return null;
    }
    return {
      scale: process.currentImage.scale,
      x: process.currentImage.x,
      y: process.currentImage.y,
      minScale: process.currentImage.minScale,
      maxScale: process.currentImage.maxScale
    };
  }
  /**
   * Set image transformation (for plugins)
   */
  setImageTransform(scale, x, y, animate) {
    const process = this._process;
    if (!process.preview || !process.currentImage) {
      return;
    }
    process.currentImage.scale = scale;
    process.currentImage.factor = scale;
    process.currentImage.x = x;
    process.currentImage.y = y;
    updateScaleImage.call(this, scale, {
      x: x / scale,
      y: y / scale
    }, animate);
    this._callPluginHook("onTransformChange", this.getImageState());
  }
  /**
   * Center image with custom options (for plugins)
   */
  centerImageWithOptions(options) {
    const process = this._process;
    if (!process.preview || !process.currentImage) {
      return;
    }
    const containerTarget = getContainerTarget.call(this);
    let container = containerTarget.nf;
    if (options?.reservedSpaces) {
      const { top = 0, bottom = 0, left = 0, right = 0 } = options.reservedSpaces;
      const newWidth = container.width - left - right;
      const newHeight = container.height - top - bottom;
      container = {
        ...container,
        width: newWidth,
        height: newHeight,
        x: container.x + left,
        y: container.y + top,
        // Recalculate center based on reserved spaces
        cx: container.x + left + newWidth / 2,
        cy: container.y + top + newHeight / 2,
        top: container.top + top,
        left: container.left + left
      };
    }
    const marginPercent = options?.marginPercent ?? 0.05;
    if (marginPercent > 0) {
      const marginWidth = container.width * marginPercent;
      const marginHeight = container.height * marginPercent;
      const newWidth = container.width - marginWidth * 2;
      const newHeight = container.height - marginHeight * 2;
      container = {
        ...container,
        width: newWidth,
        height: newHeight,
        x: container.x + marginWidth,
        y: container.y + marginHeight,
        // Recalculate center based on margins
        cx: container.x + marginWidth + newWidth / 2,
        cy: container.y + marginHeight + newHeight / 2,
        top: container.top + marginHeight,
        left: container.left + marginWidth
      };
    }
    const image = process.currentImage.image;
    const nf = centerImage(image, container, process.scaleLimit.min, process.scaleLimit.max);
    if (!options?.allowUpscale) {
      const maxScale = Math.min(image.width / nf.width, image.height / nf.height);
      if (nf.scale > maxScale) {
        nf.scale = maxScale;
        nf.width = image.width * nf.scale;
        nf.height = image.height * nf.scale;
        nf.x = (container.width - nf.width) / 2;
        nf.y = (container.height - nf.height) / 2;
      }
    }
    process.currentImage.origin = nf;
    this.setImageTransform(nf.scale, nf.x, nf.y, false);
  }
  /**
   * Get current image element (for plugins)
   */
  getCurrentImageElement() {
    return this._process.currentImage?.imageNode || null;
  }
  /**
   * Get preview container element (for plugins)
   */
  getPreviewContainer() {
    return this._process.preview?.container || null;
  }
  /**
   * Check if viewer is open (for plugins)
   */
  isViewerOpen() {
    return !!this._process.preview;
  }
}
var __defProp$6 = Object.defineProperty;
var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$6 = (obj, key, value) => __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
/**
 * Keyboard Navigation Component for zPhotoZoom Carousel
 *
 * @module carousel/KeyboardNav
 * @license MIT
 */
const KEYBOARD_MAPPINGS = {
  ArrowLeft: "previous",
  ArrowRight: "next",
  Escape: "close",
  Home: "first",
  End: "last",
  Space: "togglePlay"
};
class KeyboardNav {
  constructor(options) {
    __publicField$6(this, "options");
    __publicField$6(this, "enabled");
    __publicField$6(this, "boundHandler", null);
    this.options = options;
    this.enabled = options.enabled;
    if (this.enabled) {
      this.enable();
    }
  }
  /**
   * Enable keyboard navigation
   */
  enable() {
    if (this.enabled && this.boundHandler) {
      return;
    }
    this.enabled = true;
    this.boundHandler = this.handleKeyDown.bind(this);
    document.addEventListener("keydown", this.boundHandler);
  }
  /**
   * Disable keyboard navigation
   */
  disable() {
    if (!this.enabled || !this.boundHandler) {
      return;
    }
    this.enabled = false;
    document.removeEventListener("keydown", this.boundHandler);
    this.boundHandler = null;
  }
  /**
   * Destroy the keyboard navigation (cleanup)
   */
  destroy() {
    this.disable();
  }
  /**
   * Handle keyboard events
   */
  handleKeyDown(e) {
    if (!this.enabled) {
      return;
    }
    const target = e.target;
    const interactiveElements = ["INPUT", "TEXTAREA", "SELECT", "BUTTON"];
    if (interactiveElements.includes(target.tagName) || target.isContentEditable || target.closest('[contenteditable="true"]')) {
      return;
    }
    const action = KEYBOARD_MAPPINGS[e.key];
    if (!action) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    switch (action) {
      case "next":
        this.options.onNext();
        break;
      case "previous":
        this.options.onPrevious();
        break;
      case "close":
        this.options.onClose();
        break;
      case "first":
        this.options.onFirst();
        break;
      case "last":
        this.options.onLast();
        break;
      case "togglePlay":
        if (this.options.onTogglePlay) {
          this.options.onTogglePlay();
        }
        break;
    }
  }
}
var __defProp$5 = Object.defineProperty;
var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$5 = (obj, key, value) => __defNormalProp$5(obj, typeof key !== "symbol" ? key + "" : key, value);
/**
 * Image Preloader Component for zPhotoZoom Carousel
 *
 * @module carousel/Preloader
 * @license MIT
 */
class Preloader {
  constructor(options) {
    __publicField$5(this, "options");
    __publicField$5(this, "images");
    __publicField$5(this, "loadingQueue", /* @__PURE__ */ new Set());
    __publicField$5(this, "loadedIndices", /* @__PURE__ */ new Set());
    this.options = options;
    this.images = options.images || [];
    if (!Array.isArray(this.images)) {
      console.error("zPhotoCarousel: Preloader requires an array of images");
      this.images = [];
      return;
    }
    if (this.options.preloadAll && this.images.length > 0) {
      this.preloadAll().catch((err) => {
        console.warn("zPhotoCarousel: Error preloading all images:", err);
      });
    }
  }
  /**
   * Preload a specific image by index
   */
  async preloadImage(index) {
    if (index < 0 || index >= this.images.length) {
      return Promise.reject(new Error(`Invalid index: ${index}`));
    }
    const imageData = this.images[index];
    if (!imageData) {
      return Promise.reject(new Error(`Image data not found at index: ${index}`));
    }
    if (imageData.loaded || this.loadedIndices.has(index)) {
      return Promise.resolve();
    }
    if (this.loadingQueue.has(index)) {
      return this.waitForLoad(index);
    }
    this.loadingQueue.add(index);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        imageData.imageNode = img;
        imageData.loaded = true;
        imageData.width = img.naturalWidth;
        imageData.height = img.naturalHeight;
        imageData.prop = img.naturalWidth / img.naturalHeight;
        imageData.landscape = img.naturalWidth >= img.naturalHeight;
        this.loadedIndices.add(index);
        this.loadingQueue.delete(index);
        resolve();
      };
      img.onerror = () => {
        console.warn(`zPhotoCarousel: Failed to load image at index ${index}:`, imageData.src);
        imageData.imageNode = img;
        imageData.loaded = true;
        imageData.failed = true;
        this.loadedIndices.add(index);
        this.loadingQueue.delete(index);
        resolve();
      };
      img.src = imageData.src;
    });
  }
  /**
   * Preload adjacent images (previous and next)
   */
  async preloadAdjacent(currentIndex) {
    if (!this.options.preloadAdjacent) {
      return Promise.resolve();
    }
    const totalImages = this.images.length;
    if (totalImages === 0 || currentIndex < 0 || currentIndex >= totalImages) {
      return Promise.resolve();
    }
    const toPreload = [];
    const nextIndex = (currentIndex + 1) % totalImages;
    const nextImage = this.images[nextIndex];
    if (nextImage && !nextImage.loaded && !this.loadedIndices.has(nextIndex)) {
      toPreload.push(nextIndex);
    }
    const prevIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
    const prevImage = this.images[prevIndex];
    if (prevImage && !prevImage.loaded && !this.loadedIndices.has(prevIndex)) {
      toPreload.push(prevIndex);
    }
    try {
      await Promise.all(toPreload.map((index) => this.preloadImage(index)));
    } catch (error) {
      console.warn("zPhotoCarousel: Some adjacent images failed to preload", error);
    }
  }
  /**
   * Preload all images in the collection
   */
  async preloadAll() {
    if (!this.options.preloadAll) {
      return Promise.resolve();
    }
    const toPreload = [];
    for (let i = 0; i < this.images.length; i++) {
      const img = this.images[i];
      if (img && !img.loaded && !this.loadedIndices.has(i)) {
        toPreload.push(i);
      }
    }
    const batchSize = 3;
    for (let i = 0; i < toPreload.length; i += batchSize) {
      const batch = toPreload.slice(i, i + batchSize);
      try {
        await Promise.all(batch.map((index) => this.preloadImage(index)));
      } catch (error) {
        console.warn("zPhotoCarousel: Some images failed to preload in batch", error);
      }
    }
  }
  /**
   * Wait for an image that's currently loading
   */
  waitForLoad(index) {
    return new Promise((resolve) => {
      let timeoutHandle;
      const checkInterval = setInterval(() => {
        if (!this.loadingQueue.has(index)) {
          clearInterval(checkInterval);
          clearTimeout(timeoutHandle);
          resolve();
        }
      }, 50);
      timeoutHandle = setTimeout(() => {
        clearInterval(checkInterval);
        console.warn(`zPhotoCarousel: Preload timeout for image at index ${index}`);
        resolve();
      }, 1e4);
    });
  }
  /**
   * Get loading statistics
   */
  getStats() {
    const total = this.images.length;
    const loaded = this.loadedIndices.size;
    return {
      loaded,
      total,
      percentage: total > 0 ? Math.round(loaded / total * 100) : 0
    };
  }
}
var __defProp$4 = Object.defineProperty;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
/**
 * Swipe Detection Component for zPhotoZoom Carousel
 *
 * @module carousel/SwipeDetector
 * @license MIT
 */
class SwipeDetector {
  constructor(options) {
    __publicField$4(this, "options");
    __publicField$4(this, "element");
    __publicField$4(this, "startPoint", null);
    __publicField$4(this, "enabled", true);
    __publicField$4(this, "boundTouchStart", null);
    __publicField$4(this, "boundTouchMove", null);
    __publicField$4(this, "boundTouchEnd", null);
    this.options = options;
    this.element = options.element;
    this.enable();
  }
  /**
   * Enable swipe detection
   */
  enable() {
    if (this.boundTouchStart) {
      return;
    }
    this.enabled = true;
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
    this.element.addEventListener("touchstart", this.boundTouchStart, { passive: false });
    this.element.addEventListener("touchmove", this.boundTouchMove, { passive: false });
    this.element.addEventListener("touchend", this.boundTouchEnd, { passive: false });
  }
  /**
   * Disable swipe detection
   */
  disable() {
    if (!this.boundTouchStart) {
      return;
    }
    this.enabled = false;
    this.element.removeEventListener("touchstart", this.boundTouchStart);
    this.element.removeEventListener("touchmove", this.boundTouchMove);
    this.element.removeEventListener("touchend", this.boundTouchEnd);
    this.boundTouchStart = null;
    this.boundTouchMove = null;
    this.boundTouchEnd = null;
  }
  /**
   * Destroy swipe detector (cleanup)
   */
  destroy() {
    this.disable();
  }
  /**
   * Handle touch start
   */
  handleTouchStart(e) {
    if (!this.enabled || !this.options.isEnabled()) {
      return;
    }
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (touch) {
        this.startPoint = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      }
    } else {
      this.startPoint = null;
    }
  }
  /**
   * Handle touch move
   */
  handleTouchMove(e) {
    if (!this.enabled || !this.startPoint || !this.options.isEnabled()) {
      return;
    }
    if (e.touches.length > 1) {
      this.startPoint = null;
    }
  }
  /**
   * Handle touch end
   */
  handleTouchEnd(e) {
    if (!this.enabled || !this.startPoint || !this.options.isEnabled()) {
      this.startPoint = null;
      return;
    }
    const touch = e.changedTouches[0];
    if (!touch) {
      this.startPoint = null;
      return;
    }
    const endPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    this.detectSwipe(this.startPoint, endPoint);
    this.startPoint = null;
  }
  /**
   * Detect and process swipe gesture
   */
  detectSwipe(start, end) {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const deltaTime = end.time - start.time;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    if (absDeltaX <= absDeltaY) {
      return;
    }
    if (absDeltaX < this.options.threshold) {
      return;
    }
    if (deltaTime > 300) {
      return;
    }
    if (deltaX > 0) {
      this.options.onSwipeRight();
    } else {
      this.options.onSwipeLeft();
    }
  }
}
var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
/**
 * Thumbnail Bar Component for zPhotoZoom Carousel
 *
 * @module carousel/ThumbnailBar
 * @license MIT
 */
class ThumbnailBar {
  constructor(options) {
    __publicField$3(this, "options");
    __publicField$3(this, "container", null);
    __publicField$3(this, "track", null);
    __publicField$3(this, "thumbnails", []);
    __publicField$3(this, "currentIndex");
    this.options = options;
    this.currentIndex = options.currentIndex;
  }
  /**
   * Render the thumbnail bar
   */
  render() {
    this.container = document.createElement("div");
    this.container.className = `zpz-thumbnail-bar zpz-tb-${this.options.position}`;
    this.container.style.height = `${this.options.height}px`;
    const wrapper = document.createElement("div");
    wrapper.className = "zpz-tb-container";
    this.container.appendChild(wrapper);
    this.track = document.createElement("div");
    this.track.className = "zpz-tb-track";
    wrapper.appendChild(this.track);
    this.options.images.forEach((image, index) => {
      const thumbnailEl = this.createThumbnail(image, index);
      this.thumbnails.push(thumbnailEl);
      this.track.appendChild(thumbnailEl);
    });
    this.setActive(this.currentIndex);
    return this.container;
  }
  /**
   * Create a single thumbnail element
   */
  createThumbnail(image, index) {
    const item = document.createElement("div");
    item.className = "zpz-tb-item";
    item.setAttribute("data-index", index.toString());
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `View image ${index + 1}`);
    const isHorizontal = this.options.position === "top" || this.options.position === "bottom";
    if (isHorizontal) {
      item.style.height = "100%";
    } else {
      item.style.width = "100%";
    }
    const img = document.createElement("img");
    img.src = image.thumbnailSrc || image.src;
    img.alt = `Thumbnail ${index + 1}`;
    img.draggable = false;
    img.style.pointerEvents = "none";
    item.appendChild(img);
    item.addEventListener("click", () => {
      this.options.onThumbnailClick(index);
    });
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.options.onThumbnailClick(index);
      }
    });
    return item;
  }
  /**
   * Set the active thumbnail
   */
  setActive(index) {
    if (index < 0 || index >= this.thumbnails.length) {
      return;
    }
    if (this.currentIndex >= 0 && this.currentIndex < this.thumbnails.length) {
      const currentThumb = this.thumbnails[this.currentIndex];
      if (currentThumb) {
        currentThumb.classList.remove("zpz-tb-active");
        currentThumb.setAttribute("aria-selected", "false");
      }
    }
    const newThumb = this.thumbnails[index];
    if (newThumb) {
      newThumb.classList.add("zpz-tb-active");
      newThumb.setAttribute("aria-selected", "true");
    }
    this.currentIndex = index;
    this.scrollToActive();
  }
  /**
   * Scroll to the active thumbnail using native smooth scroll
   */
  scrollToActive() {
    if (!this.track || !this.container || this.currentIndex < 0) {
      return;
    }
    const activeThumbnail = this.thumbnails[this.currentIndex];
    if (!activeThumbnail) {
      return;
    }
    activeThumbnail.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }
  /**
   * Update the thumbnail bar with new images
   */
  update(images) {
    if (!this.track) {
      return;
    }
    this.track.innerHTML = "";
    this.thumbnails = [];
    images.forEach((image, index) => {
      const thumbnailEl = this.createThumbnail(image, index);
      this.thumbnails.push(thumbnailEl);
      this.track.appendChild(thumbnailEl);
    });
    this.setActive(0);
  }
  /**
   * Destroy the thumbnail bar
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.track = null;
    this.thumbnails = [];
  }
}
var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
/**
 * Navigation Arrows Component for zPhotoZoom Carousel
 *
 * @module carousel/NavigationArrows
 * @license MIT
 */
class NavigationArrows {
  constructor(onPrevious, onNext, position = "center") {
    this.onPrevious = onPrevious;
    this.onNext = onNext;
    this.position = position;
    __publicField$2(this, "container", null);
    __publicField$2(this, "prevButton", null);
    __publicField$2(this, "nextButton", null);
  }
  /**
   * Render the navigation arrows
   */
  render() {
    this.container = document.createElement("div");
    this.container.className = `zpz-nav-arrows zpz-arrows-${this.position}`;
    this.prevButton = this.createArrowButton("prev", this.onPrevious);
    this.container.appendChild(this.prevButton);
    this.nextButton = this.createArrowButton("next", this.onNext);
    this.container.appendChild(this.nextButton);
    return this.container;
  }
  /**
   * Create an arrow button
   */
  createArrowButton(direction, onClick) {
    const button = document.createElement("button");
    button.className = `zpz-arrow zpz-arrow-${direction}`;
    button.setAttribute("aria-label", direction === "prev" ? "Previous image" : "Next image");
    button.type = "button";
    const svg = this.createArrowIcon(direction);
    button.appendChild(svg);
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
    return button;
  }
  /**
   * Create arrow SVG icon
   */
  createArrowIcon(direction) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "28");
    svg.setAttribute("height", "28");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    if (direction === "prev") {
      const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path1.setAttribute("d", "M15 18l-6-6 6-6");
      svg.appendChild(path1);
      const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path2.setAttribute("d", "M19 18l-6-6 6-6");
      path2.setAttribute("opacity", "0.5");
      svg.appendChild(path2);
    } else {
      const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path1.setAttribute("d", "M9 18l6-6-6-6");
      svg.appendChild(path1);
      const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path2.setAttribute("d", "M5 18l6-6-6-6");
      path2.setAttribute("opacity", "0.5");
      svg.appendChild(path2);
    }
    return svg;
  }
  /**
   * Update disabled state based on current position
   */
  updateDisabledState(currentIndex, totalImages, loop) {
    if (!this.prevButton || !this.nextButton) {
      return;
    }
    if (loop) {
      this.prevButton.disabled = false;
      this.nextButton.disabled = false;
    } else {
      this.prevButton.disabled = currentIndex === 0;
      this.nextButton.disabled = currentIndex === totalImages - 1;
    }
  }
  /**
   * Destroy the navigation arrows
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.prevButton = null;
    this.nextButton = null;
  }
}
var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
/**
 * Counter Component for zPhotoZoom Carousel
 *
 * @module carousel/Counter
 * @license MIT
 */
class Counter {
  constructor(position = "top-right") {
    this.position = position;
    __publicField$1(this, "container", null);
    __publicField$1(this, "currentSpan", null);
    __publicField$1(this, "totalSpan", null);
  }
  /**
   * Render the counter
   */
  render() {
    this.container = document.createElement("div");
    this.container.className = `zpz-counter zpz-counter-${this.position}`;
    this.container.setAttribute("aria-live", "polite");
    this.container.setAttribute("aria-atomic", "true");
    this.currentSpan = document.createElement("span");
    this.currentSpan.className = "zpz-counter-current";
    this.currentSpan.textContent = "1";
    const separator = document.createElement("span");
    separator.className = "zpz-counter-separator";
    separator.textContent = "/";
    this.totalSpan = document.createElement("span");
    this.totalSpan.className = "zpz-counter-total";
    this.totalSpan.textContent = "1";
    this.container.appendChild(this.currentSpan);
    this.container.appendChild(separator);
    this.container.appendChild(this.totalSpan);
    return this.container;
  }
  /**
   * Update the counter display
   */
  update(current, total) {
    if (!this.currentSpan || !this.totalSpan) {
      return;
    }
    this.currentSpan.textContent = current.toString();
    this.totalSpan.textContent = total.toString();
    if (this.container) {
      this.container.setAttribute(
        "aria-label",
        `Image ${current} of ${total}`
      );
    }
  }
  /**
   * Destroy the counter
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.currentSpan = null;
    this.totalSpan = null;
  }
}
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const injectCarouselStyles = () => {
  if (document.getElementById("z-photo-carousel-styles")) {
    return;
  }
  const styleElement = document.createElement("style");
  styleElement.id = "z-photo-carousel-styles";
  styleElement.textContent = `
    /* Carousel main container modifications */
    .ZPhotoZoom.zpz-carousel-mode {
      display: flex;
      flex-direction: column;
    }

    .zpz-main-image-container {
      position: relative;
      flex: 1;
      overflow: hidden;
    }

    .zpz-slides-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      will-change: transform;
    }

    .zpz-slides-wrapper.zpz-transitioning {
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .zpz-slide {
      position: relative;
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }

    .zpz-slide.zpz-slide-active {
      opacity: 1;
    }

    .zpz-slide.zpz-slide-entering {
      animation: slideEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes slideEnter {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .zpz-slide img {
      position: absolute;
      max-width: 100%;
      max-height: 100%;
    }

    /* Navigation Arrows */
    .zpz-nav-arrows {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 999;
    }

    .zpz-arrow {
      pointer-events: auto;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%);
      backdrop-filter: blur(15px);
      border: 2px solid rgba(255, 255, 255, 0.15);
      width: 56px;
      height: 56px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      outline: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .zpz-arrow:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(76, 96, 204, 0.8) 100%);
      border-color: rgba(102, 126, 234, 1);
      transform: translateY(-50%) scale(1.15);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .zpz-arrow:hover:not(:disabled) svg {
      transform: scale(1.1);
    }

    .zpz-arrow:active:not(:disabled) {
      transform: translateY(-50%) scale(0.95);
    }

    .zpz-arrow:disabled {
      opacity: 0.25;
      cursor: not-allowed;
      background: rgba(0, 0, 0, 0.3);
    }

    .zpz-arrow:focus-visible {
      outline: 3px solid #667eea;
      outline-offset: 3px;
    }

    .zpz-arrow-prev {
      left: 24px;
    }

    .zpz-arrow-next {
      right: 24px;
    }

    .zpz-arrow svg {
      width: 28px;
      height: 28px;
      fill: none;
      transition: transform 0.2s ease;
    }

    /* Counter */
    .zpz-counter {
      position: absolute;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      padding: 8px 16px;
      border-radius: 20px;
      color: white;
      font-size: 16px;
      font-weight: 500;
      z-index: 1000;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .zpz-counter-top-left {
      top: 20px;
      left: 20px;
    }

    .zpz-counter-top-right {
      top: 20px;
      right: 20px;
    }

    .zpz-counter-bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .zpz-counter-bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .zpz-counter-separator {
      margin: 0 8px;
      opacity: 0.6;
    }

    /* Thumbnail Bar */
    .zpz-thumbnail-bar {
      position: absolute;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 100%);
      backdrop-filter: blur(20px);
      z-index: 1000;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .zpz-tb-bottom {
      bottom: 0;
      left: 0;
      right: 0;
    }

    .zpz-tb-top {
      top: 0;
      left: 0;
      right: 0;
      border-top: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .zpz-tb-left {
      left: 0;
      top: 0;
      bottom: 0;
      border-top: none;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .zpz-tb-right {
      right: 0;
      top: 0;
      bottom: 0;
      border-top: none;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    .zpz-tb-container {
      width: 100%;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 8px 16px;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }

    .zpz-tb-left .zpz-tb-container,
    .zpz-tb-right .zpz-tb-container {
      overflow-x: hidden;
      overflow-y: auto;
    }

    /* Custom scrollbar for webkit browsers */
    .zpz-tb-container::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }

    .zpz-tb-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .zpz-tb-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    .zpz-tb-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .zpz-tb-track {
      display: flex;
      gap: 10px;
      height: 100%;
      align-items: center;
      min-width: min-content;
    }

    .zpz-tb-bottom .zpz-tb-track,
    .zpz-tb-tb-top .zpz-tb-track {
      flex-direction: row;
    }

    .zpz-tb-left .zpz-tb-track,
    .zpz-tb-right .zpz-tb-track {
      flex-direction: column;
    }

    .zpz-tb-item {
      flex: 0 0 auto;
      cursor: pointer;
      border: 2px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .zpz-tb-item::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .zpz-tb-item:hover {
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    }

    .zpz-tb-item:hover::after {
      opacity: 1;
    }

    .zpz-tb-item:focus-visible {
      outline: 3px solid #667eea;
      outline-offset: 3px;
    }

    .zpz-tb-item.zpz-tb-active {
      border-color: #667eea;
      border-width: 3px;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2),
                  0 4px 20px rgba(102, 126, 234, 0.6);
      transform: scale(1.1);
    }

    .zpz-tb-item.zpz-tb-active::after {
      opacity: 0;
    }

    .zpz-tb-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .zpz-tb-bottom,
      .zpz-tb-top {
        height: 80px !important;
      }

      .zpz-arrow {
        width: 48px;
        height: 48px;
      }

      .zpz-arrow svg {
        width: 24px;
        height: 24px;
      }

      .zpz-arrow-prev {
        left: 12px;
      }

      .zpz-arrow-next {
        right: 12px;
      }

      .zpz-counter {
        font-size: 14px;
        padding: 6px 12px;
      }
    }

    /* Extra small screens */
    @media (max-width: 480px) {
      .zpz-arrow {
        width: 44px;
        height: 44px;
      }

      .zpz-arrow svg {
        width: 22px;
        height: 22px;
      }

      .zpz-arrow-prev {
        left: 8px;
      }

      .zpz-arrow-next {
        right: 8px;
      }
    }
  `;
  document.head.appendChild(styleElement);
};
class zPhotoCarousel extends zPhotoZoom {
  constructor(options, context) {
    injectCarouselStyles();
    super(options, context);
    __publicField(this, "_carouselState");
    __publicField(this, "_carouselOptions");
    __publicField(this, "_thumbnailBar");
    __publicField(this, "_keyboardNav");
    __publicField(this, "_preloader");
    __publicField(this, "_swipeDetector");
    __publicField(this, "_navigationArrows");
    __publicField(this, "_counter");
    __publicField(this, "_navigateCallbacks", []);
    __publicField(this, "_slideChangeCallbacks", []);
    __publicField(this, "_mainImageContainer");
    __publicField(this, "_slidesWrapper");
    __publicField(this, "_slides", /* @__PURE__ */ new Map());
    __publicField(this, "_clickHandlers", /* @__PURE__ */ new Map());
    __publicField(this, "_hoverHandlers", null);
    __publicField(this, "_originalEventHandlers", /* @__PURE__ */ new Map());
    __publicField(this, "_imageStates", /* @__PURE__ */ new Map());
    this._carouselOptions = {
      ...options,
      carousel: options.carousel !== false,
      loop: options.loop !== false,
      startIndex: options.startIndex || 0,
      enableThumbnails: options.enableThumbnails !== false,
      thumbnailHeight: options.thumbnailHeight || 120,
      thumbnailPosition: options.thumbnailPosition || "bottom",
      thumbnailsVisible: options.thumbnailsVisible || 5,
      enableKeyboard: options.enableKeyboard !== false,
      enableArrows: options.enableArrows !== false,
      arrowPosition: options.arrowPosition || "center",
      enableSwipe: options.enableSwipe !== false,
      transition: options.transition || "slide",
      transitionDuration: options.transitionDuration || 400,
      autoPlay: options.autoPlay || false,
      autoPlayInterval: options.autoPlayInterval || 3e3,
      pauseOnHover: options.pauseOnHover !== false,
      preloadAdjacent: options.preloadAdjacent !== false,
      preloadAll: options.preloadAll || false,
      showCounter: options.showCounter !== false,
      counterPosition: options.counterPosition || "top-right"
    };
    this._carouselState = {
      currentIndex: this._carouselOptions.startIndex,
      totalImages: this.process.images.length,
      isPlaying: false,
      playTimer: null,
      isTransitioning: false,
      direction: null
    };
    this.initializeCarousel();
  }
  // Helper to access parent's private _process (type assertion)
  get process() {
    return this._process;
  }
  /**
   * Initialize carousel components
   */
  initializeCarousel() {
    if (!this._carouselOptions.carousel) {
      return;
    }
    this.process.images.forEach((img, index) => {
      img.index = index;
    });
    if (this._carouselOptions.preloadAdjacent || this._carouselOptions.preloadAll) {
      this._preloader = new Preloader({
        images: this.process.images,
        preloadAdjacent: this._carouselOptions.preloadAdjacent,
        preloadAll: this._carouselOptions.preloadAll
      });
    }
    this.process.images.forEach((img, index) => {
      if (img.evener) {
        this._originalEventHandlers.set(img.node, { evener: img.evener });
        img.evener.remove();
      }
      const existingHandler = this._clickHandlers.get(img.node);
      if (existingHandler) {
        img.node.removeEventListener("click", existingHandler);
      }
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openCarouselAt(index);
      };
      this._clickHandlers.set(img.node, clickHandler);
      img.node.addEventListener("click", clickHandler);
    });
  }
  /**
   * Open carousel at specific index
   */
  openCarouselAt(index) {
    this._carouselState.currentIndex = index;
    const image = this.process.images[index];
    this.openCarouselViewer(image);
  }
  /**
   * Open viewer in carousel mode (override)
   */
  openCarouselViewer(image) {
    let prevent = false;
    for (let i = 0; i < this.process.eventsOpen.length; i++) {
      const event = {
        preventDefault: () => {
          prevent = true;
        },
        stopPropagation: () => {
        },
        target: image.node,
        instance: this
      };
      this.process.eventsOpen[i](event);
      if (prevent) return;
    }
    this.createCarouselStructure();
    this.setupCarouselComponents();
    this.displayImage(this._carouselState.currentIndex, false);
    if (this._preloader) {
      this._preloader.preloadAdjacent(this._carouselState.currentIndex);
    }
    if (this._carouselOptions.autoPlay) {
      this.play();
    }
  }
  /**
   * Create carousel DOM structure
   */
  createCarouselStructure() {
    if (!this.process.preview) {
      const containerPreview = this.getContainerPreview();
      this.process.preview = containerPreview;
      this.process.preview.apply();
      this.process.preview.evener();
    }
    const container = this.process.preview.container;
    container.classList.add("zpz-carousel-mode");
    if (!this._mainImageContainer || !this._mainImageContainer.parentNode) {
      this._mainImageContainer = document.createElement("div");
      this._mainImageContainer.className = "zpz-main-image-container";
      container.appendChild(this._mainImageContainer);
    } else {
      this._mainImageContainer.innerHTML = "";
      this._slides.clear();
    }
    this._slidesWrapper = document.createElement("div");
    this._slidesWrapper.className = "zpz-slides-wrapper";
    this._mainImageContainer.appendChild(this._slidesWrapper);
  }
  /**
   * Setup carousel UI components
   */
  setupCarouselComponents() {
    const container = this.process.preview.container;
    if (this._carouselOptions.enableArrows) {
      this._navigationArrows = new NavigationArrows(
        () => this.previous(),
        () => this.next(),
        this._carouselOptions.arrowPosition
      );
      this._mainImageContainer.appendChild(this._navigationArrows.render());
      this._navigationArrows.updateDisabledState(
        this._carouselState.currentIndex,
        this._carouselState.totalImages,
        this._carouselOptions.loop
      );
    }
    if (this._carouselOptions.showCounter) {
      this._counter = new Counter(this._carouselOptions.counterPosition);
      this._mainImageContainer.appendChild(this._counter.render());
      this._counter.update(
        this._carouselState.currentIndex + 1,
        this._carouselState.totalImages
      );
    }
    if (this._carouselOptions.enableThumbnails) {
      this._thumbnailBar = new ThumbnailBar({
        images: this.process.images,
        position: this._carouselOptions.thumbnailPosition,
        height: this._carouselOptions.thumbnailHeight,
        visibleCount: this._carouselOptions.thumbnailsVisible,
        currentIndex: this._carouselState.currentIndex,
        onThumbnailClick: (index) => this.goTo(index)
      });
      container.appendChild(this._thumbnailBar.render());
    }
    if (this._carouselOptions.enableKeyboard) {
      this._keyboardNav = new KeyboardNav({
        onNext: () => this.next(),
        onPrevious: () => this.previous(),
        onClose: () => this.close(),
        onFirst: () => this.first(),
        onLast: () => this.last(),
        onTogglePlay: () => this.togglePlay(),
        enabled: true
      });
    }
    if (this._carouselOptions.enableSwipe && this._mainImageContainer) {
      this._swipeDetector = new SwipeDetector({
        element: this._mainImageContainer,
        threshold: 50,
        onSwipeLeft: () => this.next(),
        onSwipeRight: () => this.previous(),
        isEnabled: () => {
          return this.process.currentImage?.scale === this.process.currentImage?.origin.scale;
        }
      });
    }
    if (this._carouselOptions.pauseOnHover && this._carouselOptions.autoPlay) {
      this.setupPauseOnHover(container);
    }
  }
  /**
   * Create or get slide for image
   */
  getOrCreateSlide(index) {
    let slide = this._slides.get(index);
    if (!slide) {
      slide = document.createElement("div");
      slide.className = "zpz-slide";
      slide.setAttribute("data-index", index.toString());
      this._slides.set(index, slide);
    }
    return slide;
  }
  /**
   * Prepare slide with image and transformations
   */
  async prepareSlide(index) {
    const image = this.process.images[index];
    if (!image) return;
    if (!image.loaded && this._preloader) {
      await this._preloader.preloadImage(index);
    }
    const imageNode = image.imageNode;
    if (!imageNode) return;
    const slide = this.getOrCreateSlide(index);
    slide.innerHTML = "";
    slide.appendChild(imageNode);
    if (index === this._carouselState.currentIndex) {
      this.updateCurrentImage(image);
    }
  }
  /**
   * Display image at index with horizontal slide system
   */
  async displayImage(index, withTransition = true) {
    const image = this.process.images[index];
    if (!image) {
      console.error("zPhotoCarousel: Invalid image index:", index);
      return;
    }
    await this.prepareSlide(index);
    const prevIndex = this.getPreviousIndex();
    const nextIndex = this.getNextIndex();
    if (prevIndex !== index) {
      this.prepareSlide(prevIndex).catch(() => {
      });
    }
    if (nextIndex !== index) {
      this.prepareSlide(nextIndex).catch(() => {
      });
    }
    this._slidesWrapper.innerHTML = "";
    if (prevIndex !== index) {
      const prevSlide = this.getOrCreateSlide(prevIndex);
      prevSlide.classList.remove("zpz-slide-active", "zpz-slide-entering");
      this._slidesWrapper.appendChild(prevSlide);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "zpz-slide";
      this._slidesWrapper.appendChild(placeholder);
    }
    const currentSlide = this.getOrCreateSlide(index);
    currentSlide.classList.remove("zpz-slide-active", "zpz-slide-entering");
    this._slidesWrapper.appendChild(currentSlide);
    if (nextIndex !== index) {
      const nextSlide = this.getOrCreateSlide(nextIndex);
      nextSlide.classList.remove("zpz-slide-active", "zpz-slide-entering");
      this._slidesWrapper.appendChild(nextSlide);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "zpz-slide";
      this._slidesWrapper.appendChild(placeholder);
    }
    if (withTransition && this.process.currentImage) {
      this._slidesWrapper.classList.remove("zpz-transitioning");
      this._slidesWrapper.style.transform = "translateX(-100%)";
      void this._slidesWrapper.offsetHeight;
      this._slidesWrapper.classList.add("zpz-transitioning");
      requestAnimationFrame(() => {
        currentSlide.classList.add("zpz-slide-entering");
        setTimeout(() => {
          currentSlide.classList.remove("zpz-slide-entering");
          currentSlide.classList.add("zpz-slide-active");
        }, 500);
      });
    } else {
      this._slidesWrapper.classList.remove("zpz-transitioning");
      this._slidesWrapper.style.transform = "translateX(-100%)";
      requestAnimationFrame(() => {
        currentSlide.classList.add("zpz-slide-entering");
        setTimeout(() => {
          currentSlide.classList.remove("zpz-slide-entering");
          currentSlide.classList.add("zpz-slide-active");
        }, 500);
      });
    }
    this.updateCurrentImage(image);
  }
  /**
   * Get center image options for current carousel configuration
   */
  getCenterImageOptions() {
    const options = {
      marginPercent: 0.05,
      // 5% margins around image
      allowUpscale: false,
      // Never upscale small images
      reservedSpaces: {}
    };
    if (this._carouselOptions.enableThumbnails) {
      const tbHeight = this._carouselOptions.thumbnailHeight;
      const tbPosition = this._carouselOptions.thumbnailPosition;
      if (tbPosition === "bottom") {
        options.reservedSpaces.bottom = tbHeight;
      } else if (tbPosition === "top") {
        options.reservedSpaces.top = tbHeight;
      } else if (tbPosition === "left") {
        options.reservedSpaces.left = tbHeight;
      } else if (tbPosition === "right") {
        options.reservedSpaces.right = tbHeight;
      }
    }
    return options;
  }
  /**
   * Update current image reference and apply zoom
   * Implements state persistence: first view uses calculated origin, revisits restore saved state
   */
  updateCurrentImage(image) {
    const imageNode = image.imageNode;
    const imageIndex = image.index;
    setTimeout(() => {
      const containerRect = this._mainImageContainer.getBoundingClientRect();
      let availableWidth = containerRect.width;
      let availableHeight = containerRect.height;
      let offsetX = 0;
      let offsetY = 0;
      if (this._carouselOptions.enableThumbnails) {
        const tbHeight = this._carouselOptions.thumbnailHeight;
        const tbPosition = this._carouselOptions.thumbnailPosition;
        if (tbPosition === "bottom") {
          availableHeight -= tbHeight;
        } else if (tbPosition === "top") {
          availableHeight -= tbHeight;
          offsetY = tbHeight;
        } else if (tbPosition === "left") {
          availableWidth -= tbHeight;
          offsetX = tbHeight;
        } else if (tbPosition === "right") {
          availableWidth -= tbHeight;
        }
      }
      const centerX = containerRect.left + offsetX + availableWidth / 2;
      const centerY = containerRect.top + offsetY + availableHeight / 2;
      this.process.currentImage = {
        image,
        imageNode,
        animate: false,
        factor: 1,
        distanceFactor: 1,
        scale: 1,
        origin: { width: 0, height: 0, x: 0, y: 0, scale: 1, min: 0.3, max: 5 },
        center: {
          x: centerX,
          // Use calculated center of available space
          y: centerY
          // Use calculated center of available space
        },
        minScale: 0.3,
        maxScale: 5,
        x: 0,
        y: 0,
        width: () => this.process.currentImage.imageNode.offsetWidth,
        height: () => this.process.currentImage.imageNode.offsetHeight
      };
      const savedState = this._imageStates.get(imageIndex);
      if (savedState && savedState.visited) {
        this.setImageTransform(savedState.scale, savedState.x, savedState.y, false);
      } else {
        this.centerImageWithOptions(this.getCenterImageOptions());
        const state = this.getImageState();
        if (state) {
          this._imageStates.set(imageIndex, {
            scale: state.scale,
            x: state.x,
            y: state.y,
            visited: true
          });
        }
      }
      if (image.loaded && image.evener) {
        image.evener.apply();
      }
      this.setupStateTracking(imageIndex);
    }, 0);
  }
  /**
   * Setup tracking of zoom/pan changes to persist them
   */
  setupStateTracking(imageIndex) {
    let saveTimeout;
    const saveState = () => {
      const currentImage = this.process.currentImage;
      if (!currentImage || currentImage.image.index !== imageIndex) {
        return;
      }
      const state = this.getImageState();
      if (state) {
        this._imageStates.set(imageIndex, {
          scale: state.scale,
          x: state.x,
          y: state.y,
          visited: true
        });
      }
    };
    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveState, 300);
    };
    const container = this._mainImageContainer;
    const handlers = {
      wheel: debouncedSave,
      mouseup: debouncedSave,
      touchend: debouncedSave
    };
    const cleanup = () => {
      clearTimeout(saveTimeout);
      container.removeEventListener("wheel", handlers.wheel);
      container.removeEventListener("mouseup", handlers.mouseup);
      container.removeEventListener("touchend", handlers.touchend);
    };
    if (container.__stateTrackingCleanup) {
      container.__stateTrackingCleanup();
    }
    container.addEventListener("wheel", handlers.wheel, { passive: true });
    container.addEventListener("mouseup", handlers.mouseup);
    container.addEventListener("touchend", handlers.touchend);
    container.__stateTrackingCleanup = cleanup;
  }
  // ========================================================================
  // Public Navigation API
  // ========================================================================
  /**
   * Navigate to next image
   */
  next() {
    if (this._carouselState.isTransitioning) {
      return;
    }
    const nextIndex = this.getNextIndex();
    if (nextIndex === this._carouselState.currentIndex) {
      return;
    }
    this.navigateTo(nextIndex, "forward");
  }
  /**
   * Navigate to previous image
   */
  previous() {
    if (this._carouselState.isTransitioning) {
      return;
    }
    const prevIndex = this.getPreviousIndex();
    if (prevIndex === this._carouselState.currentIndex) {
      return;
    }
    this.navigateTo(prevIndex, "backward");
  }
  /**
   * Go to specific index
   */
  goTo(index) {
    if (this._carouselState.isTransitioning || index < 0 || index >= this._carouselState.totalImages || index === this._carouselState.currentIndex) {
      return;
    }
    const direction = index > this._carouselState.currentIndex ? "forward" : "backward";
    this.navigateTo(index, direction);
  }
  /**
   * Go to first image
   */
  first() {
    this.goTo(0);
  }
  /**
   * Go to last image
   */
  last() {
    this.goTo(this._carouselState.totalImages - 1);
  }
  /**
   * Navigate to index with direction
   */
  async navigateTo(index, direction) {
    const fromIndex = this._carouselState.currentIndex;
    const image = this.process.images[index];
    let prevent = false;
    const navigateEvent = {
      from: fromIndex,
      to: index,
      direction,
      image,
      instance: this,
      preventDefault: () => {
        prevent = true;
      },
      stopPropagation: () => {
      }
    };
    for (const callback of this._navigateCallbacks) {
      callback(navigateEvent);
      if (prevent) return;
    }
    this._carouselState.currentIndex = index;
    this._carouselState.direction = direction;
    await this.displayImage(index, true);
    this.updateUIComponents();
    const slideChangeEvent = {
      index,
      image,
      total: this._carouselState.totalImages,
      instance: this
    };
    for (const callback of this._slideChangeCallbacks) {
      callback(slideChangeEvent);
    }
    if (this._preloader) {
      this._preloader.preloadAdjacent(index);
    }
  }
  /**
   * Update UI components after navigation
   */
  updateUIComponents() {
    const index = this._carouselState.currentIndex;
    if (this._counter) {
      this._counter.update(index + 1, this._carouselState.totalImages);
    }
    if (this._thumbnailBar) {
      this._thumbnailBar.setActive(index);
    }
    if (this._navigationArrows) {
      this._navigationArrows.updateDisabledState(
        index,
        this._carouselState.totalImages,
        this._carouselOptions.loop
      );
    }
  }
  /**
   * Get next index (with loop support)
   */
  getNextIndex() {
    const current = this._carouselState.currentIndex;
    const total = this._carouselState.totalImages;
    if (current === total - 1) {
      return this._carouselOptions.loop ? 0 : current;
    }
    return current + 1;
  }
  /**
   * Get previous index (with loop support)
   */
  getPreviousIndex() {
    const current = this._carouselState.currentIndex;
    const total = this._carouselState.totalImages;
    if (current === 0) {
      return this._carouselOptions.loop ? total - 1 : current;
    }
    return current - 1;
  }
  // ========================================================================
  // Slideshow API
  // ========================================================================
  /**
   * Start slideshow
   */
  play() {
    if (this._carouselState.isPlaying) {
      return;
    }
    this._carouselState.isPlaying = true;
    this._carouselState.playTimer = setInterval(() => {
      this.next();
    }, this._carouselOptions.autoPlayInterval);
  }
  /**
   * Pause slideshow
   */
  pause() {
    if (!this._carouselState.isPlaying) {
      return;
    }
    this._carouselState.isPlaying = false;
    if (this._carouselState.playTimer) {
      clearInterval(this._carouselState.playTimer);
      this._carouselState.playTimer = null;
    }
  }
  /**
   * Toggle slideshow play/pause
   */
  togglePlay() {
    if (this._carouselState.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
  // ========================================================================
  // State API
  // ========================================================================
  /**
   * Get current image index
   */
  getCurrentIndex() {
    return this._carouselState.currentIndex;
  }
  /**
   * Get total number of images
   */
  getTotalImages() {
    return this._carouselState.totalImages;
  }
  /**
   * Get all images
   */
  getImages() {
    return this.process.images;
  }
  /**
   * Check if slideshow is playing
   */
  isPlaying() {
    return this._carouselState.isPlaying;
  }
  // ========================================================================
  // Event API
  // ========================================================================
  /**
   * Register navigate event callback
   */
  onNavigate(callback, remove) {
    if (typeof callback !== "function") {
      return;
    }
    if (remove) {
      const index = this._navigateCallbacks.indexOf(callback);
      if (index > -1) {
        this._navigateCallbacks.splice(index, 1);
      }
    } else {
      this._navigateCallbacks.push(callback);
    }
  }
  /**
   * Register slide change event callback
   */
  onSlideChange(callback, remove) {
    if (typeof callback !== "function") {
      return;
    }
    if (remove) {
      const index = this._slideChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this._slideChangeCallbacks.splice(index, 1);
      }
    } else {
      this._slideChangeCallbacks.push(callback);
    }
  }
  /**
   * Setup pause on hover functionality
   */
  setupPauseOnHover(container) {
    let wasPausedManually = false;
    const handleMouseEnter = () => {
      if (this._carouselState.isPlaying) {
        wasPausedManually = false;
        this.pause();
      } else {
        wasPausedManually = true;
      }
    };
    const handleMouseLeave = () => {
      if (!wasPausedManually && this._carouselOptions.autoPlay) {
        this.play();
      }
    };
    this._hoverHandlers = {
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseLeave
    };
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
  }
  /**
   * Cleanup pause on hover listeners
   */
  cleanupPauseOnHover() {
    if (!this._hoverHandlers) {
      return;
    }
    const container = this.process.preview?.container;
    if (container) {
      container.removeEventListener("mouseenter", this._hoverHandlers.mouseenter);
      container.removeEventListener("mouseleave", this._hoverHandlers.mouseleave);
    }
    this._hoverHandlers = null;
  }
  // ========================================================================
  // Cleanup
  // ========================================================================
  /**
   * Override close to cleanup carousel components and reset all state
   */
  close() {
    this.pause();
    if (this._mainImageContainer && this._mainImageContainer.__stateTrackingCleanup) {
      this._mainImageContainer.__stateTrackingCleanup();
      delete this._mainImageContainer.__stateTrackingCleanup;
    }
    this._imageStates.clear();
    this._thumbnailBar?.destroy();
    this._thumbnailBar = void 0;
    this._keyboardNav?.destroy();
    this._keyboardNav = void 0;
    this._swipeDetector?.destroy();
    this._swipeDetector = void 0;
    this._navigationArrows?.destroy();
    this._navigationArrows = void 0;
    this._counter?.destroy();
    this._counter = void 0;
    this.cleanupClickHandlers();
    this.cleanupPauseOnHover();
    if (this._mainImageContainer) {
      this._mainImageContainer.innerHTML = "";
    }
    super.close();
  }
  /**
   * Clean up carousel click handlers and restore parent handlers
   */
  cleanupClickHandlers() {
    this._clickHandlers.forEach((handler, node) => {
      node.removeEventListener("click", handler);
    });
    this._clickHandlers.clear();
    this._originalEventHandlers.forEach((handlers, _node) => {
      if (handlers.evener) {
        handlers.evener.apply();
      }
    });
    this._originalEventHandlers.clear();
  }
  /**
   * Get container preview with carousel support
   */
  getContainerPreview() {
    const thisInstance = this;
    const process = this.process;
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
    function mousemove(_e) {
      if (process.flags.isMoved || interaction) {
        moved = true;
      }
    }
    function mouseup(e) {
      const body2 = process.context.body || process.context.getElementsByTagName("body")[0];
      if ((this === e.target || !body2) && !moved && interaction) {
        try {
          thisInstance.close();
        } catch (_err) {
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
}
export {
  zPhotoZoom as default,
  zPhotoCarousel,
  zPhotoZoom
};
//# sourceMappingURL=zphotozoom.esm.js.map
