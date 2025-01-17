// Copyright 2023 Jo Bates. All rights reserved. MIT license.

const core = globalThis.Deno.core;
const ops = core.ops;
import * as webgpu from "ext:deno_webgpu/01_webgpu.js";
import * as webidl from "ext:deno_webidl/00_webidl.js";

const _wid = Symbol("wid");
const _gpuSurface = Symbol("gpuSurface");

const windows = new Map();

function convertPosition(prefix, args) {
  if (args.length >= 2) {
    const x = webidl.converters["long"](args[0], {
      prefix,
      context: "Argument 1",
    });
    const y = webidl.converters["long"](args[1], {
      prefix,
      context: "Argument 2",
    });
    return [x, y];
  } else {
    webidl.requiredArguments(args.length, 1, { prefix });
    const position = webidl.converters["WSIPosition"](args[0], {
      prefix,
      context: "Argument 1",
    });
    checkPosition(prefix, position);
    return position;
  }
}

function checkPosition(prefix, position) {
  if (position.length != 2) {
    throw new DOMException(
      `${prefix}: position.length must equal 2.`,
      "OperationError",
    );
  }
}

function convertSize(prefix, args, nullable = false) {
  if (args.length >= 2) {
    const width = webidl.converters["unsigned long"](args[0], {
      prefix,
      context: "Argument 1",
    });
    const height = webidl.converters["unsigned long"](args[1], {
      prefix,
      context: "Argument 2",
    });
    return [width, height];
  } else {
    webidl.requiredArguments(args.length, 1, { prefix });
    if (nullable && args[0] === null) {
      return null;
    } else {
      const size = webidl.converters["WSISize"](args[0], {
        prefix,
        context: "Argument 1",
      });
      checkSize(prefix, size);
      return size;
    }
  }
}

function checkSize(prefix, size) {
  if (size.length != 2) {
    throw new DOMException(
      `${prefix}: size.length must equal 2.`,
      "OperationError",
    );
  }
}

class WSI {
  [webidl.brand] = webidl.brand;

  constructor() {
    webidl.illegalConstructor();
  }

  async nextEvent() {
    webidl.assertBranded(this, WSIPrototype);

    const event = await core.opAsync("op_wsi_next_event");
    if (event.window != null) {
      event.window = windows.get(event.window);
    }
    return event;
  }

  setDeviceEventFilter(filter) {
    webidl.assertBranded(this, WSIPrototype);
    const prefix = "Failed to execute 'setDeviceEventFilter' on 'WSI'";

    webidl.requiredArguments(arguments.length, 1, { prefix });
    filter = webidl.converters["WSIDeviceEventFilter"](filter, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_set_device_event_filter(filter);
  }

  createWindow(options) {
    webidl.assertBranded(this, WSIPrototype);
    const prefix = "Failed to execute 'createWindow' on 'WSI'";

    if (options !== undefined) {
      options = webidl.converters["WSICreateWindowOptions"](options, {
        prefix,
        context: "Argument 1",
      });
      if (options.position != null) {
        checkPosition(prefix, options.position);
      }
      if (options.innerSize != null) {
        checkSize(prefix, options.innerSize);
      }
      if (options.minInnerSize != null) {
        checkSize(prefix, options.minInnerSize);
      }
      if (options.maxInnerSize != null) {
        checkSize(prefix, options.maxInnerSize);
      }
      if (options.resizeIncrements != null) {
        checkSize(prefix, options.resizeIncrements);
      }
    }

    const wid = ops.op_wsi_create_window(options);
    const window = webidl.createBranded(WSIWindow);
    windows.set(wid, window);
    window[_wid] = wid;
    return window;
  }
}
const WSIPrototype = WSI.prototype;

class WSIModifierKey {
  constructor() {
    webidl.illegalConstructor();
  }

  static get SHIFT() {
    return 0o0004;
  }
  static get CTRL() {
    return 0o0040;
  }
  static get ALT() {
    return 0o0400;
  }
  static get GUI() {
    return 0o4000;
  }
}

function assertWindow(window, { prefix, context }) {
  const wid = window[_wid];
  if (wid === undefined) {
    throw new DOMException(
      `${prefix}: ${context} references an invalid or destroyed window.`,
      "OperationError",
    );
  }
  return wid;
}

class WSIWindow {
  [_wid];
  [_gpuSurface];

  constructor() {
    webidl.illegalConstructor();
  }

  setContentProtected(contentProtected = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setContentProtected' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    contentProtected = webidl.converters["boolean"](contentProtected, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_content_protected(wid, contentProtected);
  }

  setCursorGrabMode(mode) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setCursorGrabMode' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    webidl.requiredArguments(arguments.length, 1, { prefix });
    mode = webidl.converters["WSICursorGrabMode"](mode, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_cursor_grab_mode(wid, mode);
  }

  setCursorHitTestEnabled(enabled = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setCursorHitTestEnabled' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    enabled = webidl.converters["boolean"](enabled, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_cursor_hit_test_enabled(wid, enabled);
  }

  setCursorIcon(icon) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setCursorIcon' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    webidl.requiredArguments(arguments.length, 1, { prefix });
    icon = webidl.converters["WSICursorIcon"](icon, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_cursor_icon(wid, icon);
  }

  setCursorPosition() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setCursorPosition' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    const position = convertPosition(prefix, arguments);

    return ops.op_wsi_window_set_cursor_position(wid, position);
  }

  setCursorVisible(visible = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setCursorVisible' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    visible = webidl.converters["boolean"](visible, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_cursor_visible(wid, visible);
  }

  isDecorated() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'isDecorated' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_is_decorated(wid);
  }

  setDecorated(decorated = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setDecorated' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    decorated = webidl.converters["boolean"](decorated, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_decorated(wid, decorated);
  }

  getEnabledButtons() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'getEnabledButtons' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_get_enabled_buttons(wid);
  }

  setEnabledButtons(buttons) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setEnabledButtons' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    webidl.requiredArguments(arguments.length, 1, { prefix });
    buttons = webidl.converters["unsigned long"](buttons, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_enabled_buttons(wid, buttons);
  }

  hasFocus() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'hasFocus' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_has_focus(wid);
  }

  takeFocus() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'takeFocus' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_take_focus(wid);
  }

  isFullscreen() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'isFullscreen' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_is_fullscreen(wid);
  }

  setFullscreen(fullscreen = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setFullscreen' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    fullscreen = webidl.converters["boolean"](fullscreen, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_fullscreen(wid, fullscreen);
  }

  getGPUSurface() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'getGPUSurface' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    if (this[_gpuSurface] != null) {
      return this[_gpuSurface];
    } else {
      const rid = ops.op_wsi_window_create_gpu_surface(wid);
      return this[_gpuSurface] = webgpu.createGPUSurface(rid);
    }
  }

  setIMEAllowed(allowed = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setIMEAllowed' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    allowed = webidl.converters["boolean"](allowed, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_ime_allowed(wid, allowed);
  }

  setIMEPosition() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setIMEPosition' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    const position = convertPosition(prefix, arguments);

    return ops.op_wsi_window_set_ime_position(wid, position);
  }

  setIMEPurpose(purpose) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setIMEPurpose' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    webidl.requiredArguments(arguments.length, 1, { prefix });
    purpose = webidl.converters["WSIIMEPurpose"](purpose, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_ime_purpose(wid, purpose);
  }

  getInnerPosition() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'getInnerPosition' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_get_inner_position(wid);
  }

  getOuterPosition() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'getOuterPosition' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_get_outer_position(wid);
  }

  setOuterPosition() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setOuterPosition' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    const position = convertPosition(prefix, arguments);

    return ops.op_wsi_window_set_outer_position(wid, position);
  }

  getInnerSize() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'getInnerSize' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_get_inner_size(wid);
  }

  getOuterSize() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'getOuterSize' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_get_outer_size(wid);
  }

  setInnerSize() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setInnerSize' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    const size = convertSize(prefix, arguments);

    return ops.op_wsi_window_set_inner_size(wid, size);
  }

  setMinInnerSize() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setMinInnerSize' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    const nullable = true;
    const size = convertSize(prefix, arguments, nullable);

    return ops.op_wsi_window_set_min_inner_size(wid, size);
  }

  setMaxInnerSize() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setMaxInnerSize' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    const nullable = true;
    const size = convertSize(prefix, arguments, nullable);

    return ops.op_wsi_window_set_max_inner_size(wid, size);
  }

  setLevel(level) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setLevel' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    webidl.requiredArguments(arguments.length, 1, { prefix });
    level = webidl.converters["WSIWindowLevel"](level, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_level(wid, level);
  }

  isMinimized() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'isMinimized' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_is_minimized(wid);
  }

  setMinimized(minimized = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setMinimized' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    minimized = webidl.converters["boolean"](minimized, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_minimized(wid, minimized);
  }

  isMaximized() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'isMaximized' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_is_maximized(wid);
  }

  setMaximized(maximized = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setMaximized' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    maximized = webidl.converters["boolean"](maximized, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_maximized(wid, maximized);
  }

  isResizable() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'isResizable' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_is_resizable(wid);
  }

  setResizable(resizable = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setResizable' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    resizable = webidl.converters["boolean"](resizable, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_resizable(wid, resizable);
  }

  getResizeIncrements() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'getResizeIncrements' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_get_resize_increments(wid);
  }

  setResizeIncrements() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setResizeIncrements' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    const nullable = true;
    const size = convertSize(prefix, arguments, nullable);

    return ops.op_wsi_window_set_resize_increments(wid, size);
  }

  getScaleFactor() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'getScaleFactor' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_get_scale_factor(wid);
  }

  getTheme() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'getTheme' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_get_theme(wid);
  }

  setTheme(theme) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setTheme' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    webidl.requiredArguments(arguments.length, 1, { prefix });
    if (theme !== null) {
      theme = webidl.converters["WSIWindowTheme"](theme, {
        prefix,
        context: "Argument 1",
      });
    }

    return ops.op_wsi_window_set_theme(wid, theme);
  }

  getTitle() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'getTitle' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_get_title(wid);
  }

  setTitle(title) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setTitle' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    webidl.requiredArguments(arguments.length, 1, { prefix });
    title = webidl.converters["DOMString"](title, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_title(wid, title);
  }

  setTransparent(transparent = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setTransparent' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    transparent = webidl.converters["boolean"](transparent, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_transparent(wid, transparent);
  }

  isVisible() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'isVisible' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_is_visible(wid);
  }

  setVisible(visible = true) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'setVisible' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    visible = webidl.converters["boolean"](visible, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_set_visible(wid, visible);
  }

  beginDragMove() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'beginDragMove' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_begin_drag_move(wid);
  }

  beginDragResize(direction) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'beginDragResize' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    webidl.requiredArguments(arguments.length, 1, { prefix });
    direction = webidl.converters["WSIResizeDirection"](direction, {
      prefix,
      context: "Argument 1",
    });

    return ops.op_wsi_window_begin_drag_resize(wid, direction);
  }

  requestRedraw() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'requestRedraw' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    return ops.op_wsi_window_request_redraw(wid);
  }

  requestUserAttention(type) {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'requestUserAttention' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    webidl.requiredArguments(arguments.length, 1, { prefix });
    if (type !== null) {
      type = webidl.converters["WSIUserAttentionType"](type, {
        prefix,
        context: "Argument 1",
      });
    }

    return ops.op_wsi_window_request_user_attention(wid, type);
  }

  destroy() {
    webidl.assertBranded(this, WSIWindowPrototype);
    const prefix = "Failed to execute 'destroy' on 'WSIWindow'";
    const wid = assertWindow(this, { prefix, context: "this" });

    if (this[_gpuSurface] != null) {
      webgpu.destroyGPUSurface(this[_gpuSurface]);
      this[_gpuSurface] = undefined;
    }

    ops.op_wsi_window_destroy(wid);
    windows.delete(wid);
    this[_wid] = undefined;
  }
}
const WSIWindowPrototype = WSIWindow.prototype;

class WSIWindowButton {
  constructor() {
    webidl.illegalConstructor();
  }

  static get CLOSE() {
    return 0b001;
  }
  static get MINIMIZE() {
    return 0b010;
  }
  static get MAXIMIZE() {
    return 0b100;
  }
}

const wsi = webidl.createBranded(WSI);
export { WSI, wsi, WSIModifierKey, WSIWindow, WSIWindowButton };
