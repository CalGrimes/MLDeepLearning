import { ERROR, IMG_STATUS, NOTICE } from "@/const.js";

var API_SERVER = ""; // process.env.api_server || "";

export function buildApiUrl(path) {
  if (API_SERVER.length) {
    return API_SERVER + path;
  } else {
    return path;
  }
}

export function getLabelColor(state_labels, labels_color, label) {
  var label_id = null;
  if (typeof label === "string") {
    let label_name = label;
    for (const key in state_labels) {
      if (state_labels[key].label === label_name) {
        label_id = key;
        break;
      }
    }
  } else if (typeof label === "number") {
    label_id = label;
  }

  var label_color = labels_color[label_id % 10];

  return label_color;
}

export function min(a, b) {
  return a < b ? a : b;
}

export function max(a, b) {
  return a > b ? a : b;
}

export function clientToNode(node, points) {
  const rc = node.getBoundingClientRect();
  const ret = [];
  for (let [x, y] of points) {
    ret.push([x - rc.left + node.scrollLeft, y - rc.top + node.scrollTop]);
  }
  return ret;
}

export function normalizeRect(rect) {
  let [l, t, r, b] = rect;
  let ret = [min(l, r), min(t, b), max(l, r), max(t, b)];
  return ret;
}

export function ptInRect(rect, x, y) {
  // calculate the border of canvas (the area of active_image)
  const [l, t, r, b] = normalizeRect(rect);
  return x >= l && x < r && y >= t && y < b;
}

// https://stackoverflow.com/questions/3393686/
// Use in tagcanvas.vue -> addEventListenerOnce(document, "mouseup", this.endDrag, true);
export function addEventListenerOnce(target, type, listener, useCapture) {
  // 2) When "mouseup" is occured, remove itself and listen to listerner: "this.endDrag".
  function fn(event) {
    target.removeEventListener(type, fn, useCapture);
    listener(event);
  }
  // 1) Prepare the listener: "fn()" for the event type = "mouseup".
  target.addEventListener(type, fn, useCapture);
}

export function makeMessageUndefImgList(undef_filename_list) {
  let undef_message = ERROR.UNDEF_FILE.message;
  let length = Math.min(3, undef_filename_list.length);

  for (let i = 0; i < length; i++) {
    undef_message = undef_message.concat(undef_filename_list[i]);
    if (i != length - 1) {
      undef_message = undef_message.concat(", \n");
    }
    if (length === 3 && i === length - 1) {
      undef_message = undef_message.concat("\netc...");
    }
  }
  return undef_message;
}

export function makeMessageDupImgList(dup_filename_list) {
  let dup_message = ERROR.DUP_FILE.message;
  let length = Math.min(3, dup_filename_list.length);

  for (let i = 0; i < length; i++) {
    dup_message = dup_message.concat(dup_filename_list[i]);
    if (i != length - 1) {
      dup_message = dup_message.concat(", \n");
    }
    if (length === 3 && i === length - 1) {
      dup_message = dup_message.concat("\netc...");
    }
  }
  return dup_message;
}

export function selectMessageMakeDir(result) {
  let notice = null;
  let error = null;

  if (result === NOTICE.MAKE_DIR.INITIAL.code) {
    notice = NOTICE.MAKE_DIR.INITIAL;
  }
  if (result === ERROR.MAKE_DIR.NG_PATH.code) {
    error = ERROR.MAKE_DIR.NG_PATH;
  }
  if (result === ERROR.MAKE_DIR.NG_USERNAME.code) {
    error = ERROR.MAKE_DIR.NG_USERNAME;
  }
  if (result === NOTICE.MAKE_DIR.SUCCESS.code) {
    notice = NOTICE.MAKE_DIR.SUCCESS;
  }

  return { notice, error };
}
/* \
 |*|
 |*|  :: cookies.js ::
 |*|
 |*|  A complete cookies reader/writer framework with full unicode support.
 |*|
 |*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
 |*|
 |*|  Syntaxes:
 |*|
 |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
 |*|  * docCookies.getItem(name)
 |*|  * docCookies.removeItem(name[, path])
 |*|  * docCookies.hasItem(name)
 |*|  * docCookies.keys()
 |*|
 \ */

/* eslint-disable */

export const cookies = {
  getItem: function(sKey) {
    if (!sKey || !this.hasItem(sKey)) {
      return null; }
    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
  },
  setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toGMTString();
          break;
      }
    }
    document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
  },
  removeItem: function(sKey, sPath) {
    if (!sKey || !this.hasItem(sKey)) {
      return; }
    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
  },
  hasItem: function(sKey) {
    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function() {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = unescape(aKeys[nIdx]); }
    return aKeys;
  }
};

// 0) Not useing currently but maight use sometime
//
// export function nodeToClient(node, points) {
//   const rc = node.getBoundingClientRect();
//   const ret = [];
//   for (let [x, y] of points) {
//     ret.push([x + rc.left - node.scrollLeft, y + rc.top - node.scrollTop]);
//   }
//   return ret;
// }
// export function clientToNodeRect(node, rect) {
//   const [l, t, r, b] = rect;
//   let [[nl, nt], [nr, nb]] = clientToNode(node, [[l, t], [r, b]]);
//   return [nl, nt, nr, nb];
// }
