import { ERROR, IMG_STATUS, NOTICE, TASK_ID } from "@/const.js";
import axios from "axios";
import { mapMutations, mapState, mapActions } from "vuex";

function _updateTagbox(state, payload) {
  const pri = state.active_image_tag_boxes.slice(0, payload.boxid);
  const follow = state.active_image_tag_boxes.slice(
    payload.boxid + 1,
    state.active_image_tag_boxes.length
  );

  state.active_image_tag_boxes = [...pri, payload.box, ...follow];
}
function _updateTagPolygon(state, payload) {
  let pri = state.active_image_tag_polygons.slice(0, Number(payload.polyid));
  let follow = state.active_image_tag_polygons.slice(
    Number(payload.polyid) + 1,
    state.active_image_tag_polygons.length
  );

  state.active_image_tag_polygons = [...pri, payload.polygon, ...follow];
}

function selectFiles(state) {
  let tag_preds = [];
  if (state.tag_filter.indexOf("hastags") !== -1) {
    tag_preds.push(x => hasAnnotation(state, x));
  }
  if (state.tag_filter.indexOf("notags") !== -1) {
    tag_preds.push(x => !hasAnnotation(state, x));
  }

  let review_preds = [];
  if (state.review_filter.indexOf("ok") !== -1) {
    review_preds.push(x => getReviewResult(x) == "ok");
  }
  if (state.review_filter.indexOf("ng") !== -1) {
    review_preds.push(x => getReviewResult(x) == "ng");
  }
  if (state.review_filter.indexOf("notreviewed") !== -1) {
    review_preds.push(x => getReviewResult(x) == "notreviewed");
  }

  function any(preds, f) {
    for (let pred of preds) {
      if (pred(f)) {
        return true;
      }
    }
    return false;
  }

  const filtered_imagelist = [];
  for (let filename of Object.keys(state.folder_files)) {
    const fileinfo = state.folder_files[filename];
    if (!any(tag_preds, fileinfo)) {
      continue;
    }
    if (!any(review_preds, fileinfo)) {
      continue;
    }
    filtered_imagelist.push(filename);
  }
  filtered_imagelist.sort();
  state.filtered_imagelist = filtered_imagelist;
  // console.log("sucessed loding filename_obj!!!");

  if (!state.filtered_imagelist || state.filtered_imagelist.length === 0) {
    state.image_status = IMG_STATUS.NO_IMG;
  }
}

export function hasAnnotation(state, d) {
  if (!d) {
    return false;
  }
  const ann = d.annotation;
  if (!ann) {
    return false;
  }

  // if (state.current_task === TASK_ID.DETECTION) {
  const objects = ann.objects;
  if (!objects) {
    return false;
  }
  if (!objects.length) {
    return false;
  }
  // }
  // else if (state.current_task === TASK_ID.SEGMENTATION) {
  //   // const segments = ann.segments;
  //   const segments = ann;
  //   if (!segments){
  //     return false;
  //   }
  //   if (!segments.length){
  //     return false;
  //   }
  // }
  return true;
}

export function getReviewResult(d) {
  if (!d) {
    return "notreviewed";
  }
  const ann = d.annotation;
  if (!ann) {
    return "notreviewed";
  }
  const source = ann.source;
  if (!source) {
    return "notreviewed";
  }
  const review = source.reviewresult;
  if (!review) {
    return "notreviewed";
  }
  return review;
}

export function setAnnotations(state, filename) {
  const data = state.folder_files[filename];

  if (state.current_task === TASK_ID.DETECTION) {
    const boxes = [];
    if (data) {
      for (const obj of data.annotation.objects) {
        let box = obj.object;
        boxes.push({
          label: box.name,
          left: box.bndbox.xmin,
          right: box.bndbox.xmax,
          top: box.bndbox.ymin,
          bottom: box.bndbox.ymax
        });
      }
    }
    state.active_image_tag_boxes = boxes;
  }

  if (state.current_task === TASK_ID.SEGMENTATION) {
    // input png_path
    const polygons = [];
    if (data) {
      for (const obj of data.annotation.objects) {
        let poly = obj.object;
        polygons.push({
          label: poly.name,
          label_id: poly.labelid,
          points: poly.points
        });
      }
    }
    state.active_image_tag_polygons = polygons;
  }
  state.active_image_review_result = data.annotation.source.reviewresult;
  state.active_image_comment_admin = data.annotation.source.comment.admin;
  state.active_image_comment_subord = data.annotation.source.comment.subord;
}

export function makeSegTaggedImages(state, payload) {
  return false;
}

export function makeDetecTaggedImages(state, payload) {
  var tagged_imgs = [];
  if (payload.hasOwnProperty("filename")) {
    // When adding one info by saving annotation
    tagged_imgs = [payload];
  } else {
    tagged_imgs = payload;
  }
  const MAX_WIDTH = 10000;
  const IMAGE_HEIGHT = 125;

  let width = 0;
  for (const img of state.tagged_images) {
    if (img.filename !== payload.filename) {
      tagged_imgs.push(img);
    }
    width += img.width * (IMAGE_HEIGHT / img.height);
    if (width > MAX_WIDTH) {
      break;
    }
  }
  return tagged_imgs;
}

export default {
  // 1) Screen state
  setFullScreenMode(state, payload) {
    state.full_screen_mode = payload.full_screen_mode;
  },
  setMainMenuVisible(state, payload) {
    state.main_menu_visible = payload.visible;
  },

  setCurrentTask(state, payload) {
    state.current_task = payload;
  },

  // 2) Notifications
  setErrorStatus(state, payload) {
    if (payload.hasOwnProperty("code")) {
      state.error_status.code = payload.code;
      state.error_status.message = payload.message;
    }
    if (payload.hasOwnProperty("error_status")) {
      state.error_status = payload.error_status;
    }
  },
  setNoticeStatus(state, payload) {
    if (payload.hasOwnProperty("code")) {
      state.notice_status.code = payload.code;
      state.notice_status.message = payload.message;
    }
    if (payload.hasOwnProperty("notice_status")) {
      state.notice_status = payload.notice_status;
    }
  },
  setImageStatus(state, payload) {
    state.image_status = payload.image_status;
  },

  // 3) Directories
  setUsername(state, payload) {
    if (state.user_list.includes(payload)) {
      state.username = payload;
    } else {
      throw new URIError("Username " + payload + " does not exist.");
    }
  },
  addNewUser(state, payload) {
    state.new_user = payload.new_user;
  },
  setUserList(state, payload) {
    state.user_list = payload.user_list;
  },

  // 4) Data in the user directory
  setFolderFiles(state, payload) {
    state.folder_files = payload.folder_files;
    state.imagelist_max_display = 100;

    selectFiles(state);
  },
  updateFolderFile(state, payload) {
    if (payload.info) {
      // if (payload.info == "reset") {
      //   state.folder_files[payload.filename] = "";
      // } else {
      state.folder_files[payload.filename] = payload.info;
      // }
    } else {
      delete state.folder_files[payload.filename];
    }
    selectFiles(state);
  },
  setFilter(state, payload) {
    switch (payload) {
      case "All":
        state.tag_filter = ["hastags", "notags"];
        state.review_filter = ["ok", "ng", "notreviewed"];
        break;
      case "NeedReview":
        state.tag_filter = ["hastags"];
        state.review_filter = ["notreviewed"];
        break;
      case "NoTags":
        state.tag_filter = ["notags"];
        state.review_filter = ["notreviewed"];
        break;
      case "CHECK_OK":
        state.tag_filter = ["hastags"];
        state.review_filter = ["ok"];
        break;
      case "CHECK_NG":
        state.tag_filter = ["hastags"];
        state.review_filter = ["ng"];
        break;
      default:
        state.tag_filter = ["hastags", "notags"];
        state.review_filter = ["ok", "ng", "notreviewed"];
        break;
    }
    state.filter_method = payload;
    selectFiles(state);
  },
  setImagelistMaxDisplay(state, payload) {
    state.imagelist_max_display = payload.max_display;
  },

  // 5) About the image showing now
  setActiveImage(state, payload) {
    let filename = payload.filename;
    if (filename === null || filename === undefined) {
      return false;
      // const data = state.folder_files[`${filename}`];
    }
    state.active_boxid = null;
    state.active_image_tag_boxes = [];

    state.active_polygonid = null;
    state.active_image_tag_polygons = [];

    state.active_image_review_result = null;
    state.active_image_comment_admin = null;
    state.active_image_comment_subord = null;

    if (filename === "none") {
      state.active_image_filename = null;
      state.active_image_width = null;
      state.active_image_height = null;
      state.active_image = null;
    } else {
      state.active_image_filename = filename;
      state.active_image_width = payload.width;
      state.active_image_height = payload.height;
      state.active_image = payload.image;

      if (state.folder_files[filename]) {
        setAnnotations(state, filename);
      }
    }
  },

  // 6-1) The information of annotation boxes in a certain active_image
  setActiveBoxid(state, payload) {
    state.active_boxid = payload.boxid;
  },
  setTagboxes(state, payload) {
    state.active_image_tag_boxes = payload.tagboxes;
  },
  updateTagbox(state, payload) {
    _updateTagbox(state, payload);
  },
  setActiveboxLabel(state, payload) {
    // payload : values (label and sortcutkey) of lables object (no keys)
    if (state.active_boxid === null) {
      return false;
    }
    const boxid = state.active_boxid;
    if (boxid === null) {
      return;
    }
    const box = state.active_image_tag_boxes[boxid];
    const newbox = Object.assign(box, { label: payload.label });

    _updateTagbox(state, { boxid, box: newbox });
  },
  addNewTagbox(state, payload) {
    state.active_image_tag_boxes = [
      ...state.active_image_tag_boxes,
      payload.box
    ];
  },
  removeTagbox(state, payload) {
    const pri = state.active_image_tag_boxes.slice(0, payload.boxid);
    const follow = state.active_image_tag_boxes.slice(payload.boxid + 1);

    state.active_image_tag_boxes = [...pri, ...follow];
    state.active_boxid = null;
  },

  // 6-2) The information of annotation polygons in a certain active_image
  setActivePolygonid(state, payload) {
    state.active_polygonid = payload.polygonid;
  },
  // setTagPolygons(state, payload) {
  //   state.active_image_tag_polygons = payload.polygons;
  // },
  updateTagPolygon(state, payload) {
    _updateTagPolygon(state, payload);
  },
  setActivePolyLabel(state, payload) {
    if (state.active_polygonid === null) {
      return false;
    }
    const polyid = state.active_polygonid;
    if (polyid === null && polyid >= state.active_image_tag_polygons.length) {
      return;
    }
    const poly = state.active_image_tag_polygons[polyid];
    const newpoly = Object.assign(poly, {
      label_id: payload.key,
      label: payload.label
    });
    _updateTagPolygon(state, { polyid: polyid, polygon: newpoly });
  },
  addNewPolygon(state, paylaod) {
    state.active_image_tag_polygons = [
      ...state.active_image_tag_polygons,
      paylaod.polygon
    ];
  },
  removeTagPolygon(state, payload) {
    const pri = state.active_image_tag_polygons.slice(0, payload.polygonid);
    const follow = state.active_image_tag_polygons.slice(
      payload.polygonid + 1,
      state.active_image_tag_polygons.length
    );

    state.active_image_tag_polygons = [...pri, ...follow];
  },
  setReviewResult(state, payload) {
    if (state.is_admin) {
      state.active_image_review_result = payload.result;
    }
  },
  setCommentAdmin(state, payload) {
    state.active_image_comment_admin = payload.comment;
  },
  setCommentSubord(state, payload) {
    state.active_image_comment_subord = payload.comment;
  },

  // Others)
  setLabels(state, payload) {
    // paylaod is label_info object responsed from server
    state.labels = payload;
  },
  setObservedEvent(state, payload) {
    state.observed_event = payload;
  },
  addLabelToState(state, payload) {
    let ids = Object.keys(state.labels);
    let new_label_value = payload;

    if (ids.length !== 0) {
      // check if the last index and key's name are same
      if (ids.length - 1 === Number(ids[ids.length - 1])) {
        let next_id = ids.length;
        state.labels[next_id] = new_label_value;
      }
    } else {
      // initial label.
      // if current_task=DETECTION, label_id starts from 0 .
      // if current_task=SEGMENTATION, since id:0 is for background, starts from 1.
      if (state.current_task === TASK_ID.DETECTION) {
        state.labels[0] = new_label_value;
      } else if (state.current_task === TASK_ID.SEGMENTATION) {
        state.labels[0] = { label: "background", shortcut: "" };
        state.labels[1] = new_label_value;
      }
    }
  },
  setTaggedImages(state, payload) {
    if (payload) {
      // state.tagged_images = makeTaggedImages(state, payload);
      if (state.current_task === TASK_ID.DETECTION) {
        state.tagged_images = makeDetecTaggedImages(state, payload);
      } else if (state.current_task === TASK_ID.SEGMENTATION) {
        // TODO muraishi : 5. tagged images shown below the app. Create makeSegTaggedImages()
        state.tagged_images = makeDetecTaggedImages(state, payload);
      }
    } else {
      state.tagged_images = [];
    }
  },
  deleteTaggedImage(state, payload) {
    const imgs = [];
    for (const img of state.tagged_images) {
      // push objects except the target filename
      if (img.filename !== payload.filename) {
        imgs.push(img);
      }
    }
    state.tagged_images = imgs;
  },

  setCopyBoxes(state, payload) {
    state.saved_pre_tag_boxes = [];
    state.saved_pre_tag_boxes = payload;
  },
  // applyPreBoxes
  applyPreBoxes(state, payload) {
    state.active_image_tag_boxes = payload;
  }

  // 0) Not useing currently but maight use sometime
  //
  // toggleTagFilter(state, payload) {
  //   const idx = state.tag_filter.indexOf(payload.filter);
  //   if (idx === -1) {
  //     state.tag_filter.push(payload.filter);
  //   } else {
  //     if (state.tag_filter.length > 1) {
  //       state.tag_filter.splice(idx, 1);
  //     }
  //   }
  //   selectFiles(state);
  // },
  // toggleReviewFilter(state, payload) {
  //   const idx = state.review_filter.indexOf(payload.filter);
  //   if (idx === -1) {
  //     state.review_filter.push(payload.filter);
  //   } else {
  //     if (state.review_filter.length > 1) {
  //       state.review_filter.splice(idx, 1);
  //     }
  //   }
  //   selectFiles(state);
  // },
  // removeImage(state, payload) {
  //   const filtered_imagelist = [];
  //   for (const file of state.filtered_imagelist) {
  //     if (payload.filename !== file) {
  //       filtered_imagelist.push(file);
  //     }
  //   }
  //   state.filtered_imagelist = filtered_imagelist;
  // },
};
