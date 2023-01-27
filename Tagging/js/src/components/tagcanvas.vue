<template>
  <div id='canvasblock' :class="{full_screen_mode : full_screen_mode === true, original : full_screen_mode === false}">
    <div id="canvaspanel" ref="canvaspanel"
        @mousedown.middle='onDownMiddle'
        @mousemove='onMoveMiddle'
        @mouseup.middle='onUpMiddle'>

      <navarrow class="arrow" dir="back"/>
        <div id="canvas-wrapper" @wheel.ctrl.prevent="zoomImage" ref="wrapper">
          <div class="pad"/>

          <div class="mask-wrapper" v-if='current_task===TASK_ID.SEGMENTATION'>
            <img v-if="hasImage" class="canvas" ref="canvas" :src="imageUrl" :style="canvasStyle">
            <seg-mask class="mask"  ref="segmask"
              :style="canvasStyle"
              @statusOfMask="statusOfMask"
              :select-mode="show_selected_anno"></seg-mask>
          </div>

          <div class="mask-wrapper" v-else-if='current_task===TASK_ID.DETECTION'>
            <img v-if="hasImage" class="canvas" ref="canvas" :src="imageUrl" :style="canvasStyle">
            <detect-mask class="mask" ref="detectmask"
              :style="canvasStyle"
              :select-mode="show_selected_anno"></detect-mask>

          </div>

          <div class="pad"/>
        </div>
        <transition name="fade">
          <div id="zoom-button" >
            <div id="zoom-out-button" @click="onZoomOutButton">
              <i class="fa fa-plus" aria-hidden="true"></i>
            </div>
            <div id="zoom-reset-button" @click="onZoomResetButton">
              <i class="fa fa-expand" aria-hidden="true"></i>
            </div>
            <div id="expand-wide" @click="toFullScreenMode">
              <i class="fa fa-arrows-alt" aria-hidden="true"></i>
            </div>
            <div id="zoom-in-button" @click="onZoomInButton">
              <i class="fa fa-minus" aria-hidden="true"></i>
            </div>
          </div>
        </transition>
      <navarrow class="arrow" dir="forward"/>
    </div>
    <p id="demo"></p>
    <div>
      <div id='imageinfo' class="row">
        <div class="col-md-3  clear-padding ">
          <h4 class="shortcut-text-title">【Shortcut keys】</h4>
          <ul class="shortcut-text-list">
            <li class="shortcut-text-item">Ctrl+d: Hide/show unselected boxes</li>
            <li class="shortcut-text-item">Ctrl+w: Full-screen mode</li>
            <li class="shortcut-text-item">Space: Save changes</li>
          </ul>
        </div>
        <div class="col-md-1 row  clear-padding "></div>
        <div class="col-md-5 row  clear-padding comment-wrapper">
          <div class="comment-area col-md-6" :class="{active_textarea: is_admin, inactive_textarea: !is_admin}">
            <span>admin >> </span>
            <textarea class="form-control"  v-model="active_image_comment_admin" :readonly="!is_admin"></textarea>
          </div>
          <div class="comment-area col-md-6" :class="{active_textarea: !is_admin, inactive_textarea: is_admin}">
            <span>user >></span>
            <textarea class="form-control" v-model="active_image_comment_subord" :readonly="is_admin"></textarea>
          </div>
        </div>
        <div class= "col-md-3 row clear-padding">
          <div class="col-md-4 clear-padding toggle-wrapper">
            <div id='toggle'>
              <label class="switch">
                <input type="checkbox" :class="{checked : show_selected_anno}">
                <span class="slider" v-on:click="toShowSelectedBoxes"></span>
              </label>
            </div>
            <p class="switch-explain-text">Hide boxes</p>
          </div>
          <div class="col-md-8 clear-padding">
            <div id='buttons' class="row">
              <p class="imgFilename_wrapper">
              <span class="col-md-10 text-left clear-padding" :class="{imgFilename_long_txt: isLongFileName}" style="margin: 0px;">{{imgFilename}}</span>
              </p>
              <div class="col-md-10 clear-padding" style="margin:10px 0px 0px;">
                  <div v-if="is_admin" class="btn-wrp">
                    <p v-if="canBeSaved && active_image_review_result !== 'ng'"
                          class="img-btn   float-left  ng-button"
                          @click="setReviewResult({result:'ng'})">
                          NG
                    </p>
                    <p v-else-if="canBeSaved && active_image_review_result === 'ng'"
                          class="img-btn   float-left  ng-button ng-button-push"
                          @click="setReviewResult({result:'ng'})">
                      NG
                    </p>
                    <p v-else class="img-btn-disabled   float-left ng-button">
                      NG
                    </p>
                    <p v-if="canBeSaved && active_image_review_result !== 'ok'"
                          class="img-btn   float-right ok-button"
                          :class="{review_checked: active_image_review_result === 'ok'}"
                          @click="setReviewResult({result:'ok'})">
                      OK
                    </p>
                    <p v-else-if="canBeSaved && active_image_review_result === 'ok'"
                          class="img-btn   float-right ok-button ok-button-push"
                          @click="setReviewResult({result:'ok'})">
                      OK
                    </p>
                    <p v-else class="img-btn-disabled   float-right ok-button">
                      OK
                    </p>
                  </div>
              </div>
              <div class="col-md-10 clear-padding" style="margin:3px 0px 0px;">
                <div v-if="canBeSaved" id="save_xml_btn"
                  class="float-left"
                  @click='applyAnnotation'>
                  Save
                </div>
                <div v-else id="save_xml_btn_disabled"
                  class="float-left">
                  Save
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import NavArrow from "@/components/navarrow";
import { mapState, mapMutations, mapActions } from "vuex";
import * as utils from "@/utils";
import SegMask from "./segmask.vue";
import DetectMask from "./detectmask.vue";
import { ERROR, IMG_STATUS, NOTICE, TASK_ID } from "@/const.js";

export default {
  components: {
    navarrow: NavArrow,
    "seg-mask": SegMask,
    "detect-mask": DetectMask
  },
  data: function() {
    return {
      TASK_ID,
      show_selected_anno: false,
      mask_status: "",
      has_tags_initially: false,
      zoom_x: 0, // The coordinate x the image
      zoom_y: 0,
      zoom_scale: 1.0,
      image_drag_status: false,
      image_dragform_x: 0,
      image_dragform_y: 0
    };
  },
  created: function() {
    window.addEventListener("keyup", this.onKeyup);
  },

  beforeDestroy: function() {
    window.removeEventListener("keyup", this.onKeyup);
  },
  mounted: function() {
    this.has_tags_initially = this.hasTagsInitially();
  },
  computed: {
    ...mapState([
      "full_screen_mode",
      "is_admin",
      "current_task",
      "tagged_images",

      "active_image",
      "active_image_filename",
      "active_image_height",
      "active_image_width",
      "active_image_review_result",

      "active_image_tag_boxes",
      "active_image_tag_polygons"
    ]),
    imageUrl: function() {
      return this.active_image;
    },
    hasImage: function() {
      return Boolean(this.active_image_filename);
    },
    imgFilename: function() {
      let idx = this.active_image_filename.search(/[/\\]/);
      return this.active_image_filename.slice(idx + 1);
    },
    canBeSaved: function() {
      if (this.current_task === this.TASK_ID.DETECTION) {
        // tagをもともと持っていた場合はboxesが0でもsaveの対象とする
        if (
          this.active_image_tag_boxes &&
          this.active_image_tag_boxes.length === 0 &&
          !this.has_tags_initially
        ) {
          return false;
        }
        for (let box of this.active_image_tag_boxes) {
          if (!box.label) {
            return false;
          }
        }
        return true;
      } else if (this.current_task === this.TASK_ID.SEGMENTATION) {
        if (
          this.active_image_tag_polygons &&
          this.active_image_tag_polygons.length === 0 &&
          !this.has_tags_initially
        ) {
          return false;
        }
        if (
          this.mask_status !== "fixed" &&
          this.mask_status !== "modi-haslabel"
        ) {
          return false;
        }
        return true;
      }
    },
    active_image_comment_admin: {
      get() {
        return this.$store.state.active_image_comment_admin;
      },
      set(value) {
        if (value) {
          this.setCommentAdmin({ comment: value });
        } else {
          this.setCommentAdmin({ comment: value });
        }
      }
    },
    active_image_comment_subord: {
      get() {
        return this.$store.state.active_image_comment_subord;
      },
      set(value) {
        if (value) {
          this.setCommentSubord({ comment: value });
        } else {
          this.setCommentSubord({ comment: value });
        }
      }
    },
    canvasStyle: function() {
      const imgrc = this.$refs.wrapper;
      let parent_top = 0;
      let parent_left = 0;
      if (imgrc) {
        const rect = imgrc.getBoundingClientRect();
        parent_top = rect.top;
        parent_left = rect.left;
      }
      const z = this.zoom_scale;
      return {
        width: 100.0 * z + "%",
        height: 95.0 * z + "%",
        top: this.zoom_y + "px",
        left: this.zoom_x + "px"
      };
    },
    isLongFileName: function() {
      // 10なのは暫定的な数値です
      return this.active_image_filename.length > 10;
    }
  },
  watch: {
    active_image_filename: function() {
      this.has_tags_initially = this.hasTagsInitially();
    }
  },
  methods: {
    ...mapMutations([
      "setReviewResult",
      "setCommentAdmin",
      "setCommentSubord",
      "setFullScreenMode",
      "setTaggedImages",

      "setCopyBoxes"
    ]),
    ...mapActions(["saveAnnotation", "deleteAnnotation"]),

    statusOfMask: function(status) {
      //  TODO muraishi : Can add for DETECTION here. if unnecessary, no need to.
      if (this.current_task === this.TASK_ID.SEGMENTATION) {
        this.mask_status = status;
      }
    },

    hasTagsInitially: function() {
      let has_tag = false;
      let tag = null;
      if (this.current_task === this.TASK_ID.DETECTION) {
        tag = this.active_image_tag_boxes.map(function(item) {
          return item;
        });
      } else if (this.current_task === this.TASK_ID.SEGMENTATION) {
        tag = this.active_image_tag_polygons.map(function(item) {
          return item;
        });
      }

      if (tag && tag.length !== 0) {
        has_tag = true;
      }
      return has_tag;
    },

    toFullScreenMode: function() {
      let temp = this.mask_status;
      let shift = !this.full_screen_mode;
      this.setFullScreenMode({ full_screen_mode: shift });

      // after rendering the full_screen_mode, input the previous status in the original mode.
      if (this.current_task === this.TASK_ID.SEGMENTATION) {
        this.$refs.segmask._data.status = temp;
      }
    },
    canWheel: function() {
      utils.addEventListenerOnce(document, "mouseup", this.endDrag, true);
    },
    _zoom: function(x, y, scale_delt, in_out) {
      let z = 0;
      if (in_out > 0) {
        this.zoom_scale -= scale_delt;
        if (this.zoom_scale >= 0.5) {
          z = -scale_delt;
        } else {
          this.zoom_scale = 0.5;
        }
      } else {
        this.zoom_scale += scale_delt;
        if (this.zoom_scale <= 1.5) {
          z = scale_delt;
        } else {
          this.zoom_scale = 1.5;
        }
      }
      let candidate_x = this.zoom_x;
      let candidate_y = this.zoom_y;
      // const [_, rect] = this.calcImageRect();
      const imgrc = this.$refs.canvas.getBoundingClientRect();
      const wrapper = this.$refs.wrapper.getBoundingClientRect();

      let deltX =
        (x - imgrc.left) /
        (imgrc.right - imgrc.left) *
        (wrapper.right - wrapper.left);
      let deltY =
        (y - imgrc.top) /
        (imgrc.bottom - imgrc.top) *
        (wrapper.bottom - wrapper.top);
      candidate_x -= deltX * z;
      candidate_y -= deltY * z;
      this.zoom_y = candidate_y;
      this.zoom_x = candidate_x;

      this.$nextTick(() => {
        if (this.current_task === this.TASK_ID.DETECTION) {
          this.$refs.detectmask.arrangeBoxes();
        } else if (this.current_task === this.TASK_ID.SEGMENTATION) {
          this.$refs.segmask.arrangePolySVG();
        }
      });
    },

    onZoomOutButton: function() {
      const rect = this.$refs.canvaspanel.getBoundingClientRect();
      this._zoom(rect.right / 2, rect.bottom / 2, 0.05, false);
    },

    onZoomResetButton: function() {
      this.zoom_y = 0;
      this.zoom_x = 0;
      this.zoom_scale = 1.0;
      this.$nextTick(() => {
        if (this.current_task === this.TASK_ID.DETECTION) {
          this.$refs.detectmask.arrangeBoxes();
        } else if (this.current_task === this.TASK_ID.SEGMENTATION) {
          this.$refs.segmask.arrangePolySVG();
        }
      });
    },

    onZoomInButton: function() {
      const rect = this.$refs.canvaspanel.getBoundingClientRect();
      this._zoom(rect.right / 2, rect.bottom / 2, 0.05, true);
    },
    zoomImage: function(e) {
      this._zoom(e.clientX, e.clientY, 0.05, e.deltaY > 0);
    },

    toShowSelectedBoxes: function() {
      this.show_selected_anno = !this.show_selected_anno;
      this.$nextTick(() => {
        if (this.current_task === this.TASK_ID.DETECTION) {
          this.$refs.detectmask.arrangeBoxes();
        } else if (this.current_task === this.TASK_ID.SEGMENTATION) {
          this.$refs.segmask.arrangePolySVG();
        }
      });
    },
    applyAnnotation: function() {
      if (this.current_task === this.TASK_ID.DETECTION) {
        if (this.active_image_tag_boxes.length === 0) {
          this.deleteAnnotation();
        } else {
          let saved_pre_tag_boxes_set = this.active_image_tag_boxes.map(box => {
            let { bottom, top, left, right, label } = { ...box };
            // 座標は比率で保存する
            // (100,200,100,50) => (0.4, 0.1, 0.4, 0.8)という風に
            let normed_bottom = bottom / this.active_image_height;
            let normed_top = top / this.active_image_height;
            let normed_left = left / this.active_image_width;
            let normed_right = right / this.active_image_width;
            return [
              normed_bottom,
              normed_top,
              normed_left,
              normed_right,
              label
            ];
          });
          this.setCopyBoxes(saved_pre_tag_boxes_set);
          this.saveAnnotation();
          let payload = {
            filename: this.active_image_filename,
            width: this.active_image_width,
            height: this.active_image_height,
            image: this.active_image,
            boxes: this.active_image_tag_boxes
          };
          this.setTaggedImages(payload);
        }
      } else if (this.current_task === this.TASK_ID.SEGMENTATION) {
        // TODO muraishi: 4. paste the revious image's boxes
        if (this.active_image_tag_polygons.length === 0) {
          this.deleteAnnotation();
        } else {
          this.saveAnnotation();
          let payload = {
            filename: this.active_image_filename,
            width: this.active_image_width,
            height: this.active_image_height,
            image: this.active_image,
            polygons: this.active_image_tag_polygons
          };
          this.setTaggedImages(payload);
        }
      }
    },
    onKeyup: function(event) {
      if (event.target.nodeName === "BODY") {
        if (event.ctrlKey === true && event.key === "w") {
          this.toFullScreenMode();
        }
        if (event.key === " ") {
          if (this.canBeSaved) {
            this.applyAnnotation();
            event.preventDefault();
            event.stopPropagation();
          }
          return false;
        }
      }
    },
    calcImageRect: function() {
      const imgrc = this.$refs.canvas.getBoundingClientRect();
      const orgwidth = this.active_image_width;
      const orgheight = this.active_image_height;

      const ratio1 = imgrc.width / orgwidth;
      const ratio2 = imgrc.height / orgheight;

      const ratio = utils.min(ratio1, ratio2);
      const margin_width = utils.max(0, (imgrc.width - orgwidth * ratio) / 2);
      const margin_height = utils.max(0, (imgrc.height - orgheight * ratio) / 2);

      const left = imgrc.left + margin_width;
      const right = left + orgwidth * ratio;
      const top = imgrc.top + margin_height;
      const bottom = top + orgheight * ratio;
      return [ratio, [left, top, right, bottom]];
    },
    onDownMiddle: function(e) {
      this.image_drag_status = true;
      this.image_dragform_x = e.clientX;
      this.image_dragform_y = e.clientY;
    },
    onMoveMiddle: function(e) {
      if (this.image_drag_status) {
        const [ratio, rect] = this.calcImageRect();
        const imgrc = this.$refs.canvas.getBoundingClientRect();
        const wrapper = this.$refs.wrapper.getBoundingClientRect();
        const candidate_x = this.zoom_x + (e.clientX - this.image_dragform_x);
        const candidate_y = this.zoom_y + (e.clientY - this.image_dragform_y);
        const candidate_imgrc_x = rect[0] + (e.clientX - this.image_dragform_x);
        const candidate_imgrc_y = rect[1] + (e.clientY - this.image_dragform_y);
        const movable = 300;
        const will_out_side_left = candidate_imgrc_x + movable > wrapper.right;
        const will_out_side_right =
          candidate_imgrc_x + rect[2] - rect[0] - movable < wrapper.left;
        const will_out_side_top = candidate_imgrc_y + movable > wrapper.bottom;
        const will_out_side_bottom =
          candidate_imgrc_y + rect[3] - rect[1] - movable < wrapper.top;
        this.image_dragform_x = e.clientX;
        this.image_dragform_y = e.clientY;

        if (will_out_side_left || will_out_side_right) {
          this.zoom_y = candidate_y;
        } else if (will_out_side_top || will_out_side_bottom) {
          this.zoom_x = candidate_x;
        } else {
          this.zoom_y = candidate_y;
          this.zoom_x = candidate_x;
        }

        this.$nextTick(() => {
          if (this.current_task === this.TASK_ID.DETECTION) {
            this.$refs.detectmask.arrangeBoxes();
          } else if (this.current_task === this.TASK_ID.SEGMENTATION) {
            this.$refs.segmask.arrangePolySVG();
          }
        });
      }
    },
    onUpMiddle: function(e) {
      this.image_drag_status = false;
    }
  }
};
</script>

<style lang='scss' scoped>
.original {
  // #canvasblock
  flex-grow: 1;
  background: #fff;
  padding: 5px 15px;

  .clear-padding {
    padding-left: 0;
    padding-right: 0;
  }
  #canvaspanel {
    flex-grow: 1;
    display: flex;
    position: relative;
    height: calc(100% - 150px + calc(#{$component-margin-top}));
    .arrow {
      margin-top: 25%;
    }
    #canvas-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      .pad {
        width: 100%;
        height: $component-margin-top * 0.5;
      }
      .mask-wrapper {
        .canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
          margin: auto;
          flex-grow: 0;
          flex-shrink: 0;
          object-fit: contain;
          max-width: none;
        }
        .mask {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 2;
        }
      }
    }
    #zoom-button {
      display: flex;
      flex-wrap: wrap;
      position: absolute;
      width: 120px;
      height: 30px;
      top: calc(95% - 20px);
      left: calc(50% - 60px);
      #zoom-out-button {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }
      #zoom-in-button {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
      }
      div {
        display: flex;
        width: 25%;
        justify-content: center;
        align-items: center;
        color: white;
        background-color: #00000088;
        &:hover {
          cursor: pointer;
          background-color: #00000033;
        }
      }
    }
  }

  #imageinfo {
    display: flex;
    color: #666;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: $component-margin-top 0 0;
    .shortcut-text-title {
      font-size: 0.75rem;
      color: #aaa;
      margin-bottom: 0;
    }
    .shortcut-text-list {
      font-size: 0.6rem;
      color: #aaa;
      list-style-type: disc;
    }

    .check-button {
      height: $panel-height;
      width: 38px;
      background: #fff;
      border-color: #000;
    }
    .comment-wrapper {
      margin: 0 5px;
      display: flex;
      font-size: 95%;
      position: relative;

      .comment-area {
        width: 100%;
        padding-right: 8px;
        padding-left: 0;
        .form-control {
          width: 100%;
          height: 80px;
          padding: 0 5px;
          margin: 3px 0 0;
          font-size: 90%;
          resize: none;
          border-radius: 0px;
          overflow-y: scroll;
        }
      }
      .active_textarea {
        order: 2;
        .form-control {
          cursor: pointer;
        }
      }
      .inactive_textarea {
        order: 1;
        .form-control {
          // border:none;
          background: #fff;
        }
        & :focus {
          box-shadow: none;
        }
      }
    }

    .review_checked {
      background-color: #a2c84a;
    }
    .align-bottom {
      display: inline-block;
      vertical-align: bottom;
    }
    .toggle-wrapper {
      position: relative;
      display: inline-block;
      #toggle {
        display: inline-block;
        height: calc(#{$panel-height} * 0.8);
        position: absolute;
        // 「Hide boxes」の大きさが0.6remなので、少し余白を開ける意味で0.8rem
        bottom: 0.8rem;
        right: 5px;
        .switch {
          height: calc(#{$panel-height} * 0.8);
          width: 55px;
          input[type="checkbox"] {
            line-height: calc(#{$panel-height} * 0.8);
            opacity: 0;
            width: 0;
            height: 0;
            &.checked + .slider {
              background-color: #006ea1;
              &:before {
                transform: translateX(26px);
              }
            }
          }
        }
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #999;
        transition: 0.4s;

        &:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
        }
      }
      .switch-explain-text {
        position: absolute;
        bottom: 0;
        right: 0;
        margin-bottom: 0;
        font-size: 0.6rem;
        color: #aaa;
      }
    }
    #buttons {
      width: 100%;
      margin: auto;
      .filename {
        text-align: right;
      }
      .btn-wrp {
        display: inline-block;
        width: calc(55px * 2);
      }
      .btn-wrp > p {
        display: inline-block;
        margin: 0px;
      }
      .ok-button {
        &:hover,
        &-push {
          background: #ff4949 !important;
        }
      }
      .ng-button {
        &:hover,
        &-push {
          background: #000 !important;
        }
      }
      .ng-button,
      .ok-button {
        cursor: pointer;
        background: #999;
        padding: 10px;
        color: #fff;
        width: 53px;
        font-size: 0.8rem;
        text-align: center;
        line-height: 5px;
      }

      .img-btn {
        height: 23px;
        cursor: pointer;
      }
      .img-btn-disabled {
        height: 23px;

        &:hover {
          cursor: not-allowed;
          background: #999 !important;
        }
      }
      #save_xml_btn {
        background-color: $panel-bg-color;
        color: #fff;
        height: calc(#{$panel-height} * 0.8);
        width: calc(55px * 2);
        line-height: calc(#{$panel-height} * 0.8);
        text-align: center;
        font-family: $content-top-header-font-family;
        font-size: $content-modellist-font-size;
        &:hover {
          background-color: $panel-bg-color-hover;
          cursor: pointer;
        }
      }
      #save_xml_btn_disabled {
        color: #fff;
        height: calc(#{$panel-height} * 0.8);
        width: calc(55px * 2);
        line-height: calc(#{$panel-height} * 0.8);
        text-align: center;
        background-color: $disabled-color;
        font-family: $content-top-header-font-family;
        font-size: $content-modellist-font-size;
        cursor: not-allowed;
      }
    }
    .imgFilename_wrapper {
      width: 6rem;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 0;
      font-size: 95%;
      .imgFilename_long_txt:hover {
        display: block;
        width: 100%;
        padding-right: 100%;
        overflow: show;
        animation: scrollAnime 5s linear infinite;
      }
      @keyframes scrollAnime {
        0% {
          transform: translateX(0);
        }
        //20remは暫定的な値です
        100% {
          transform: translateX(-20rem);
        }
      }
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
}
.full_screen_mode {
  // #canvasblock
  flex-grow: 1;
  background: #2e2f30;
  height: 100%;
  padding: 15px 30px;

  .clear-padding {
    padding-left: 0;
    padding-right: 0;
  }
  #canvaspanel {
    flex-grow: 1;
    display: flex;
    height: 100%;
    .arrow {
      margin-top: 25%;
    }
    #canvas-wrapper {
      display: inline-block;
      width: calc(100% - 60px);
      height: 100%;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      position: relative;

      .pad {
        width: 100%;
        height: $component-margin-top;
      }
      .mask-wrapper {
        .canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
          margin: auto;
          flex-grow: 0;
          flex-shrink: 0;
          object-fit: contain;
          max-width: none;
        }
        .mask {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 2;
        }
      }
    }
    #zoom-button {
      display: flex;
      flex-wrap: wrap;
      position: absolute;
      width: 120px;
      height: 30px;
      top: calc(100% - 30px);
      left: calc(50% - 60px);
      #zoom-out-button {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }
      #zoom-in-button {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
      }
      div {
        display: flex;
        width: 25%;
        justify-content: center;
        align-items: center;
        color: white;
        background-color: #00000088;
        &:hover {
          cursor: pointer;
          background-color: #00000033;
        }
      }
    }
  }
}
</style>
