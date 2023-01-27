import axios from "axios";
import * as utils from "@/utils";
import { ERROR, IMG_STATUS, NOTICE, TASK_ID } from "@/const.js";

async function asyncFunc(context, f) {
  let ret;
  try {
    ret = await f();
  } catch (error) {
    context.commit("setErrorStatus", {
      error_status: ERROR.SERVER_CONNECTION
    });
    console.error(error);
    throw error;
  }

  return ret;
}

async function loadImagefileList(context) {
  context.commit("setImageStatus", {
    image_status: IMG_STATUS.LOADING
  });
  let response = await asyncFunc(context, () =>
    axios.post(utils.buildApiUrl("/api/get_filename_obj"), {
      username: context.state.username,
      task_id: context.state.current_task
    })
  );
  // folder_files -> { imgname: xmlinfo, ... }
  context.commit("setFolderFiles", {
    folder_files: response.data.filename_obj
  });
  // console.log(context.state.folder_files);

  if (response.data.undef_img_list.length > 0) {
    let undef_message = utils.makeMessageUndefImgList(
      response.data.undef_img_list
    );
    context.commit("setErrorStatus", {
      code: ERROR.UNDEF_FILE.code,
      message: undef_message
    });
  }

  if (response.data.dup_img_list.length > 0) {
    let dup_message = utils.makeMessageDupImgList(response.data.dup_img_list);
    context.commit("setErrorStatus", {
      code: ERROR.DUP_FILE.code,
      message: dup_message
    });
  }

  if (context.state.filtered_imagelist.length > 0) {
    context.dispatch("loadCurrentImage", context.state.filtered_imagelist[0]);
  }
}

async function loadLabelCandidatesDict(context) {
  let response = await asyncFunc(context, () =>
    axios.post(utils.buildApiUrl("/api/load_label_candidates_dict"), {
      username: context.state.username,
      task_id: context.state.current_task
    })
  );

  context.commit("setLabels", response.data);
}

async function loadTaggedImages(context) {
  let response = await asyncFunc(context, () =>
    axios.post(utils.buildApiUrl("/api/load_annotated_images"), {
      username: context.state.username,
      task_id: context.state.current_task
    })
  );

  // ret.data -> {result: [{ filename:_ , boxes:_ , ... } ,{}, ...]}
  context.commit("setTaggedImages", response.data.result);
}

async function loadNextImage(context) {
  let target_filename = context.state.active_image_filename;
  let idx = 0;
  for (const file of context.state.filtered_imagelist) {
    if (target_filename === file) {
      break;
    }
    idx += 1;
  }

  if (idx < context.state.filtered_imagelist.length - 1) {
    idx += 1;
  } else {
    idx -= 1;
  }

  if (idx >= 0) {
    context.dispatch("loadCurrentImage", context.state.filtered_imagelist[idx]);
  } else {
    context.commit("setActiveImage", { filename: "none" });
  }
}

export function objectForSaveAnnotation(context, value) {
  let state = context.state;
  if (!value) {
    value = {
      annotation: {
        path: state.active_image_filename,
        source: {
          database: "Unknown",
          reviewresult: null,
          comment: {
            admin: null,
            subord: null
          }
        },
        size: {
          width: state.active_image_width,
          height: state.active_image_height,
          depth: 3
        },
        segments: 0,
        objects: []
      }
    };
  }
  value.annotation.source.reviewresult = state.active_image_review_result;
  value.annotation.source.comment.admin = state.active_image_comment_admin;
  value.annotation.source.comment.subord = state.active_image_comment_subord;

  value.annotation.objects = [];
  if (state.current_task === TASK_ID.DETECTION) {
    for (let box of state.active_image_tag_boxes) {
      let o = {
        object: {
          name: box.label,
          pose: "Unspecified",
          truncated: 0,
          difficult: 0,
          bndbox: {
            xmin: box.left,
            xmax: box.right,
            ymin: box.top,
            ymax: box.bottom
          }
        }
      };
      value.annotation.objects.push(o);
    }
  } else if (state.current_task === TASK_ID.SEGMENTATION) {
    for (let polygon of state.active_image_tag_polygons) {
      let o = {
        object: {
          name: polygon.label,
          labelid: polygon.label_id,
          pose: "Unspecified",
          truncated: 0,
          difficult: 0,
          points: polygon.points
        }
      };
      value.annotation.objects.push(o);
    }
  }
  return value;
}

export default {
  async loadUserList(context) {
    let response = await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/userlist"), {
        username: context.state.username
      })
    );
    if (response.data.result === 1) {
      context.commit("setUserList", {
        user_list: response.data.user_list
      });
    } else if (response.data.result === 0) {
      context.commit("setNoticeStatus", {
        notice_status: NOTICE.MAKE_DIR.INITIAL
      });
    }
  },

  async initClient(context, payload) {
    // "loadUserList" loads user_list.
    await context.dispatch("loadUserList");

    // "set_folder" raises error when folder is not in user_list.
    let username;
    if (payload) {
      username = payload;
    } else {
      username = utils.cookies.getItem("tags-username");
    }
    context.commit("setUsername", username);

    context.commit("setActiveImage", { filename: "none" });
    context.commit("setFolderFiles", { folder_files: {} });
    context.commit("setTaggedImages", null);
    loadLabelCandidatesDict(context);
    loadImagefileList(context);
    loadTaggedImages(context);

    utils.cookies.setItem("tags-username", username, Infinity);
  },

  async makeDir(context) {
    let response = await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/make_dir"), {
        username: context.state.new_user
      })
    );

    if (response.data.result !== null) {
      // console.log(response.data.result);

      let { notice, error } = utils.selectMessageMakeDir(response.data.result);
      if (notice) {
        context.commit("setNoticeStatus", { notice_status: notice });
      } else if (error) {
        context.commit("setErrorStatus", { error_status: error });
      }
    }
  },

  async loadCurrentImage(context, filename) {
    let response = await asyncFunc(context, () =>
      axios.get(
        utils.buildApiUrl(
          "/api/get_raw_img/" + context.state.username + "/" + filename
        )
      )
    );
    context.commit("setActiveImage", {
      filename: filename,
      width: response.data.width,
      height: response.data.height,
      image: "data:image;base64," + response.data.img
    });
  },

  async addLabelToJson(context, payload) {
    context.commit("addLabelToState", payload);

    await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/save_label_candidates_dict"), {
        username: context.state.username,
        labels: context.state.labels,
        task_id: context.state.current_task
      })
    );
  },

  async deleteTaglist(context, payload) {
    let labels = context.state.labels;
    for (let key in payload.delete_item_obj) {
      delete labels[key];
    }
    let filtered_labels = {};
    let new_key = 0;
    Object.values(labels).forEach(value => {
      filtered_labels[new_key] = value;
      new_key += 1;
    });

    context.commit("setLabels", filtered_labels);
    await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/save_label_candidates_dict"), {
        username: context.state.username,
        labels: context.state.labels,
        task_id: context.state.current_task
      })
    );
  },

  async updateLabel(context, payload) {
    let state_labels = context.state.labels;

    for (let key in state_labels) {
      if (state_labels[key].label === payload.edit_target[0]) {
        state_labels[key].label = payload.dist_label;
        state_labels[key].shortcut = payload.dist_shortcut;
      }
    }
    context.commit("setLabels", state_labels);
    await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/save_label_candidates_dict"), {
        username: context.state.username,
        labels: context.state.labels,
        task_id: context.state.current_task
      })
    );
  },

  async deleteAnnotation(context) {
    let target_filename = context.state.active_image_filename;
    let task_id = context.state.current_task;
    let response = await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/delete_annotation"), {
        username: context.state.username,
        target_filename: target_filename,
        task_id: task_id
      })
    );

    let successed = false;

    if (task_id === TASK_ID.DETECTION) {
      if (response.data.result === ERROR.DELETION.XML.code) {
        // console.log("result : ", ERROR.DELETION.XML.message);
        context.commit("setErrorStatus", {
          error_status: ERROR.DELETION.XML
        });
      } else {
        successed = true;
        // console.log("result : ", NOTICE.DELETION.XML.SUCCESS.message);
      }
    } else if (task_id === TASK_ID.SEGMENTATION) {
      if (
        response.data.xml_result === ERROR.DELETION.XML.code ||
        response.data.png_result === ERROR.DELETION.PNG.code
      ) {
        if (response.data.xml_result === ERROR.DELETION.XML.code) {
          // console.log("xml_result : ", ERROR.DELETION.XML.message);
          context.commit("setErrorStatus", {
            error_status: ERROR.DELETION.XML
          });
        }
        if (response.data.png_result === ERROR.DELETION.PNG.code) {
          // console.log("png_result : ", ERROR.DELETION.PNG.message);
          context.commit("setErrorStatus", {
            error_status: ERROR.DELETION.PNG
          });
        }
      } else {
        successed = true;
        // console.log("xml_result : ", NOTICE.DELETION.XML.SUCCESS.message);
        // console.log("png_result : ", NOTICE.DELETION.PNG.SUCCESS.message);
      }
    }

    if (successed) {
      // since deliting the xml sucessed, delete the filename from state.tagged_images
      context.commit("deleteTaggedImage", {
        filename: target_filename
      });

      // load next image
      loadNextImage(context);

      // update image data
      context.commit("updateFolderFile", {
        filename: target_filename,
        info: null
      });
    }
  },

  async saveAnnotation(context) {
    let task_id = context.state.current_task;
    let value = null;
    const cur_filename = context.state.active_image_filename;

    value = context.state.folder_files[cur_filename];
    value = objectForSaveAnnotation(context, value);
    const ret = await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/save_annotation"), {
        username: context.state.username,
        task_id: task_id,
        value
      })
    );

    // load next image
    loadNextImage(context);

    // update image data
    context.commit("updateFolderFile", {
      filename: cur_filename,
      info: ret.data.result
    });
  }
};
