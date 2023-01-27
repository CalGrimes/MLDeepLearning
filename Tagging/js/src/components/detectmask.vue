<template>
  <div id="detect-mask" ref="detectmask"
    @mousedown.left.stop='onClick'
    @mousemove.left.stop.prevent='onMousemove'
    @dragstart.left.stop.prevent='onDragStart'>

    <div class="mask-canvas">
      <div v-if="isCreatingNewbox()" id="newtag" :style="newtagStyle()" />
      <div v-for="(tagstyle, idx) in filterSelectedBoxes" :key="idx"
          :style='tagstyle'
          class='box-border'
          :data-boxid='idx' @mousedown.left.stop.prevent='onBoxClick'
          @mousemove.left='onBoxMousemove'>
          <div v-if="tagstyle!=null"
          :class="['box', isActivebox(idx) ? 'box-active':'']"
          :style="{'border-color':getLabelColorbyBoxlabel(idx)}">
            <div class='taglabel'
            :style="{'background-color':getLabelColorbyBoxlabel(idx)}">
              {{getBoxLabel(idx)}}
            </div>
          </div>
     </div>
    </div>

 </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from "vuex";
import * as utils from "@/utils";

export default {
  name: "DetectMask",
  data: function() {
    return {
      BOX_MARGIN: 2, // margin between box and box-border
      BOX_BORDER: 3, // width of border of box
      status: "", // one of 'new', 'moving', 'n', 'nw', ...

      dragfrom_x: null, // x pos in client coord
      dragfrom_y: null, // y pos in client coord

      newbox_rect: null, // rect of new box in client coord
      org_boxrc: null,
      boxes: null,
      pre_boxes_state: [],
      copy_target_box: null,

      label_names: []
    };
  },
  created: function() {
    window.addEventListener("resize", this.onResize);
    window.addEventListener("keyup", this.onKeyup);
    window.addEventListener("keydown", this.onKeydown);
    // box色とlabelの色を紐付けるための処理
    Object.keys(this.labels).forEach(key => {
      this.label_names.push(this.labels[key].label);
    });
  },

  beforeDestroy: function() {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("keyup", this.onKeyup);
    window.removeEventListener("keydown", this.onKeydown);
  },
  mounted: function() {
    setTimeout(this.arrangeBoxes, 10);
    this.$on("arrangeBoxes", this.arrangeBoxes);
  },
  computed: {
    ...mapState([
      "active_image_height",
      "active_image_width",
      "active_image_tag_boxes",
      "active_boxid",
      "labels",
      "labels_color",
      "saved_pre_tag_boxes"
    ]),
    selectMode: function() {
      return this.$parent.show_selected_anno;
    },
    filterSelectedBoxes: function() {
      if (!this.boxes) {
        return false;
      }
      var id = 0;
      var size_style_boxes = [];

      if (this.selectMode === true) {
        for (let box of this.boxes) {
          if (box.selected) {
            size_style_boxes[`${id}`] = box.size_style;
          } else {
            size_style_boxes[`${id}`] = null;
          }
          id = id + 1;
        }
        return size_style_boxes;
      } else if (this.selectMode === false) {
        for (let box of this.boxes) {
          size_style_boxes[`${id}`] = box.size_style;
          id = id + 1;
        }
        return size_style_boxes;
      }
    }
  },
  watch: {
    active_image_tag_boxes: function() {
      this.$nextTick(() => {
        this.copy_target_box = null;
        this.arrangeBoxes();
      });
    },
    boxes: function() {
      // コピペショートカットキー用の処理
      if (this.active_image_tag_boxes) {
        let target_boxid = this.active_boxid;
        let target = this.active_image_tag_boxes[target_boxid];
        // タグ付けしていない画像だとエラーが発生したので、そのための処理
        if (target === undefined) {
          return false;
        }
      }
    },
    // labelの内容が変わっても、tag色とlabelが紐づくように監視
    labels: function() {
      // 初期化
      this.label_names = [];
      Object.keys(this.labels).forEach(k => {
        this.label_names.push(this.labels[k].label);
      });
    }
  },
  methods: {
    ...mapMutations([
      "setActiveBoxid",
      "setTagboxes",
      "removeTagbox",
      "addNewTagbox",
      "updateTagbox",
      "applyPreBoxes",
      "setActiveboxLabel"
    ]),
    isCreatingNewbox: function() {
      return this.status === "new";
    },
    isActivebox: function(idx) {
      return this.active_boxid === idx;
    },
    newtagStyle: function() {
      let ret = this.toCanvasRect(this.newbox_rect);
      return this.sizeStyle(ret).size_style;
    },
    getLabelColorbyBoxlabel: function(idx) {
      let labelName = this.getBoxLabel(idx);
      if (labelName === undefined) {
        return false;
      }
      return utils.getLabelColor(this.labels, this.labels_color, labelName);
    },
    initSelectedFlag: function(boxes) {
      for (let box of boxes) {
        box.selected = false;
      }
      return boxes;
    },
    _deleteBoxesInSelectedMode: function(active_boxid) {
      let pri = this.boxes.slice(0, active_boxid);
      let follow = this.boxes.slice(active_boxid + 1);
      this.boxes = [...pri, ...follow];
    },
    // when(selected-mode) once the box became "active" store the id sothat fefer as "selected : true"
    _setFlagInSelectedMode: function(active_boxid, boxes) {
      // new box
      if (active_boxid != null && active_boxid === this.boxes.length) {
        boxes[active_boxid].selected = true;
      }

      if (active_boxid === null || active_boxid < 0) {
        return boxes;
      }

      // refer privious state of this.box.selected
      for (var i = 0; i < this.boxes.length; i++) {
        if (this.boxes[i] && boxes[i]) {
          // This is patch.
          boxes[i].selected = this.boxes[i].selected;
        }
      }
      return boxes;
    },
    // when(original-mode to selected-mode) toggle is one to chatch thi function.
    _setFlagInOriginalMode: function(active_boxid, boxes) {
      if (boxes[active_boxid]) {
        for (let box of boxes) {
          box.selected = false;
          if (box === boxes[active_boxid]) {
            box.selected = true;
          }
        }
      }
      return boxes;
    },
    getBoxObj: function(id) {
      if (!this.active_image_tag_boxes[id] || !this.boxes[id]) {
        return false;
      }
      return this.active_image_tag_boxes[id];
    },
    getBoxLabel: function(id) {
      if (!this.active_image_tag_boxes[id] || !this.boxes[id]) {
        return false;
      }
      return this.getBoxObj(id).label;
    },
    sizeStyle: function(rc) {
      const size_style = {};
      size_style.left = `${rc[0]}px`;
      size_style.top = `${rc[1]}px`;
      size_style.width = `${rc[2] - rc[0]}px`;
      size_style.height = `${rc[3] - rc[1]}px`;
      return { size_style };
    },

    boxToClient: function(box) {
      // convert the box cooridinates to client based
      let [ratio, imgrc] = this.$parent.calcImageRect();
      const l = box.left * ratio + imgrc[0];
      const t = box.top * ratio + imgrc[1];
      const r = box.right * ratio + imgrc[0];
      const b = box.bottom * ratio + imgrc[1];
      return [l, t, r, b];
    },
    clientToBox: function(rect) {
      // convert the box cooridinates to image based
      let [left, top, right, bottom] = utils.normalizeRect(rect);
      let [ratio, imgrc] = this.$parent.calcImageRect();
      left = (left - imgrc[0]) / ratio;
      top = (top - imgrc[1]) / ratio;
      right = (right - imgrc[0]) / ratio;
      bottom = (bottom - imgrc[1]) / ratio;
      return { left, top, right, bottom };
    },
    toCanvasRect: function(rc) {
      // convert the box cooridinates to node based (for zoom, expand)
      let [l, t, r, b] = utils.normalizeRect(rc);

      [[l, t], [r, b]] = utils.clientToNode(this.$parent.$refs.canvas, [
        [l, t],
        [r, b]
      ]);
      return [l, t, r, b];
    },
    arrangeBoxes: function() {
      // arrange how and which boxes would be shown
      if (!this.$parent.$refs.canvas || !this.active_image_tag_boxes) {
        return false;
      }
      let boxes = [];
      for (let box of this.active_image_tag_boxes) {
        const rc = this.toCanvasRect(this.boxToClient(box));
        boxes.push(
          this.sizeStyle([
            rc[0] - this.BOX_MARGIN,
            rc[1] - this.BOX_MARGIN,
            rc[2] + this.BOX_MARGIN,
            rc[3] + this.BOX_MARGIN
          ])
        );
      }
      if (this.boxes === null) {
        boxes = this.initSelectedFlag(boxes);
        this.boxes = boxes;
      } else {
        if (this.selectMode) {
          boxes = this._setFlagInSelectedMode(this.active_boxid, boxes);
          this.boxes = boxes;
        } else {
          if (this.active_boxid != null) {
            boxes = this._setFlagInOriginalMode(this.active_boxid, boxes);
          } else {
            boxes = this.initSelectedFlag(boxes);
          }
          this.boxes = boxes;
        }
      }
    },
    _cleanBoxes: function() {
      const tagboxes = [];
      for (const [i, box] of this.active_image_tag_boxes.entries()) {
        if (box.label) {
          tagboxes.push(box);
        } else {
          this._deleteBoxesInSelectedMode(i);
        }
      }
      this.setTagboxes({ tagboxes });
    },
    boxGetCursorType: function(box_border, x, y) {
      const rect = box_border.getBoundingClientRect();
      const margin = this.BOX_MARGIN * 2 + this.BOX_BORDER;
      if (x - rect.left <= margin) {
        if (y - rect.top <= margin) {
          return "nw";
        } else if (rect.bottom - y <= margin) {
          return "sw";
        }
        return "w";
      }

      if (rect.right - x <= margin) {
        if (y - rect.top <= margin) {
          return "ne";
        } else if (rect.bottom - y <= margin) {
          return "se";
        }
        return "e";
      }
      if (y - rect.top <= margin) {
        return "n";
      }
      if (rect.bottom - y <= margin) {
        return "s";
      }
      return "";
    },
    dirToCursor(dir) {
      const cursor_map = {
        n: "ns-resize",
        nw: "nwse-resize",
        ne: "nesw-resize",
        w: "ew-resize",
        e: "ew-resize",
        s: "ns-resize",
        sw: "nesw-resize",
        se: "nwse-resize"
      };
      return cursor_map[dir];
    },
    onResize: function() {
      setTimeout(this.arrangeBoxes, 10);
    },
    onKeyup: function(event) {
      if (event.target.nodeName === "BODY") {
        if (this.$parent.hasImage && this.active_boxid !== null) {
          if (event.key === "Delete" || event.key === "Backspace") {
            this._deleteBoxesInSelectedMode(this.active_boxid);

            this.removeTagbox({ boxid: this.active_boxid });
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
        // ショートカット系のイベントの記載
        if (event.ctrlKey) {
          switch (event.key) {
            case "b":
              if (this.saved_pre_tag_boxes == 0) {
                alert("There is no target image to copy");
              }
              let saved_boxes = this.saved_pre_tag_boxes.map(norm_box => {
                let bottom, top, left, right, label;
                [bottom, top, left, right, label] = [...norm_box];
                let normed_bottom = bottom * this.active_image_height;
                let normed_top = top * this.active_image_height;
                let normed_left = left * this.active_image_width;
                let normed_right = right * this.active_image_width;
                return {
                  bottom: normed_bottom,
                  top: normed_top,
                  left: normed_left,
                  right: normed_right,
                  label: label
                };
              });
              let box_dataset = [
                ...this.active_image_tag_boxes,
                ...saved_boxes
              ];
              this.applyPreBoxes(box_dataset);
              break;
            case "d":
              this.$parent.toShowSelectedBoxes();
              break;
            case "z":
              this.applyPreBoxes(this.pre_boxes_state);
              break;
            case "c":
              let cpbox = this.active_image_tag_boxes.filter((b, i) =>
                this.isActivebox(i)
              );
              if (cpbox.length > 0) {
                this.copy_target_box = cpbox[0];
              } else {
                this.copy_target_box = null;
              }
              break;
            case "v":
              if (this.copy_target_box === null) {
                break;
              }
              //　それぞれの数字0.02なのは感覚的なものです、深い意味はないです
              let height_diff =
                // 上ではみ出しそうならば、逆にずらす処理
                this.copy_target_box.top > 0
                  ? this.active_image_height * 0.02
                  : this.active_image_height * -0.02;
              let width_diff =
                // 左ではみ出しそうならば、逆にずらす処理
                this.copy_target_box.left - this.active_image_width * 0.02 < 0
                  ? -this.active_image_width * 0.02
                  : this.active_image_width * 0.02;

              // 選択ボックスの幅が大きく画面からはみ出す場合ずらさずに貼り付ける
              // 選択ボックスの幅が大きく画面からはみ出す場合ずらさずに貼り付ける上下での処理
              let target_box_height =
                this.copy_target_box.bottom -
                this.copy_target_box.top +
                this.active_image_height * 0.02;
              if (target_box_height > this.active_image_height) {
                height_diff = 0;
              }
              // 選択ボックスの幅が大きく画面からはみ出す場合ずらさずに貼り付ける左右での処理
              let target_box_width =
                this.copy_target_box.right -
                this.copy_target_box.left +
                this.active_image_width * 0.02;
              if (target_box_width > this.active_image_width) {
                width_diff = 0;
              }

              let box = {
                label: this.copy_target_box.label,
                bottom: this.copy_target_box.bottom - height_diff,
                left: this.copy_target_box.left - width_diff,
                right: this.copy_target_box.right - width_diff,
                top: this.copy_target_box.top - height_diff
              };
              if (box) {
                this.$store.commit("addNewTagbox", { box });
              }
              break;
          }
        }
      }
    },
    onKeydown: function(event) {
      if (event.target.nodeName === "BODY") {
        if (this.$parent.hasImage && this.active_boxid !== null) {
          if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
          ) {
            let boxid = this.active_boxid;
            let box = this.getBoxObj(boxid);
            box.top = parseInt(box.top);
            box.bottom = parseInt(box.bottom);
            box.right = parseInt(box.right);
            box.left = parseInt(box.left);

            switch (event.key) {
              case "ArrowUp":
                if (box.top > 0) {
                  box.top -= 1;
                  box.bottom -= 1;
                }
                break;
              case "ArrowDown":
                if (this.active_image_height > box.bottom) {
                  box.top += 1;
                  box.bottom += 1;
                }
                break;
              case "ArrowLeft":
                if (box.left > 0) {
                  box.left -= 1;
                  box.right -= 1;
                }
                break;
              case "ArrowRight":
                if (box.right < this.active_image_width) {
                  box.left += 1;
                  box.right += 1;
                }
                break;
              default:
                return;
            }
            this.updateTagbox({
              boxid: boxid,
              box: box
            });
          } else if (!event.ctrlKey) {
            for (let key in this.labels) {
              if (this.labels[key].shortcut == event.key) {
                this.setActiveboxLabel(this.labels[key]);
                event.preventDefault();
                event.stopPropagation();
                return false;
              }
            }
          }
        }
      }
    },
    onClick: function(event) {
      if (!this.$parent.hasImage) {
        return;
      }
      const [, rc] = this.$parent.calcImageRect();
      // rc[2] = rc[2] - 1;
      if (!utils.ptInRect(rc, event.clientX, event.clientY)) {
        return;
      }
      this._cleanBoxes();

      if (this.active_boxid != null) {
        this.setActiveBoxid({
          boxid: null
        });
      }

      this.dragfrom_y = event.clientY;
      this.dragfrom_x = event.clientX;
      this.status = "new";

      // creating new box
      this.newbox_rect = [
        this.dragfrom_x,
        this.dragfrom_y,
        this.dragfrom_x,
        this.dragfrom_y
      ];
      utils.addEventListenerOnce(document, "mouseup", this.endDrag, true);
    },
    onBoxClick: function(event) {
      // ctrl+z用のための処理
      this.pre_boxes_state = this.active_image_tag_boxes;
      // const boxid = event.currentTarget.dataset.boxid;
      const boxid = event.currentTarget.dataset.boxid;

      if (boxid !== this.active_boxid) {
        this._cleanBoxes();
      }
      const tag = this.getBoxObj(boxid);
      if (!tag) {
        return;
      }
      const resize = this.boxGetCursorType(
        event.currentTarget,
        event.clientX,
        event.clientY
      );
      if (resize === "") {
        this.status = "dragging";
      } else {
        this.status = resize;
      }
      this.setActiveBoxid({ boxid: parseInt(boxid) });
      const box = this.getBoxObj(this.active_boxid);
      this.org_boxrc = this.boxToClient(box);
      [this.dragfrom_x, this.dragfrom_y] = [event.clientX, event.clientY];

      utils.addEventListenerOnce(document, "mouseup", this.endDrag, true);
    },
    onBoxMousemove: function(event) {
      let status = this.status;
      if (!status) {
        status = this.boxGetCursorType(
          event.currentTarget,
          event.clientX,
          event.clientY
        );
      }
      let cursor = this.dirToCursor(status);
      if (!cursor) {
        cursor = "move";
      }
      event.target.style.cursor = cursor;
    },
    onMousemove: function(event) {
      if (!this.$parent.hasImage) {
        return;
      }
      let [, imgrc] = this.$parent.calcImageRect();
      let x = utils.min(utils.max(imgrc[0], event.clientX), imgrc[2]);
      let y = utils.min(utils.max(imgrc[1], event.clientY), imgrc[3]);

      if (this.status === "new") {
        // resize newly created box
        let [l, t] = this.newbox_rect;
        this.newbox_rect = [l, t, x, y];
      } else if (this.status) {
        const rc = this.org_boxrc.slice();

        let diff_x = x - this.dragfrom_x;
        let diff_y = y - this.dragfrom_y;
        if (this.status === "dragging") {
          // move box
          // check if the box going out of bounds
          if (rc[0] - imgrc[0] + diff_x < 0) {
            diff_x = (rc[0] - imgrc[0]) * -1;
          }
          if (rc[2] + diff_x > imgrc[2]) {
            diff_x = imgrc[2] - rc[2];
          }
          if (rc[1] - imgrc[1] + diff_y < 0) {
            diff_y = (rc[1] - imgrc[1]) * -1;
          }
          if (rc[3] + diff_y > imgrc[3]) {
            diff_y = imgrc[3] - rc[3];
          }
          rc[0] += diff_x;
          rc[2] += diff_x;
          rc[1] += diff_y;
          rc[3] += diff_y;
        } else {
          if (this.status.indexOf("n") !== -1) {
            rc[1] = utils.min(utils.max(imgrc[1], rc[1] + diff_y), rc[3] - 1);
          }
          if (this.status.indexOf("s") !== -1) {
            rc[3] = utils.min(utils.max(rc[1], rc[3] + diff_y), imgrc[3]);
          }
          if (this.status.indexOf("w") !== -1) {
            rc[0] = utils.min(utils.max(imgrc[0], rc[0] + diff_x), rc[2] - 1);
          }
          if (this.status.indexOf("e") !== -1) {
            rc[2] = utils.min(utils.max(rc[0], rc[2] + diff_x), imgrc[2] - 1);
          }
        }
        const curbox = this.getBoxObj(this.active_boxid);
        const newbox = { ...curbox, ...this.clientToBox(rc) };
        // ctrl+z用、コピペのための処理
        this.pre_box_data = this.active_image_tag_boxes;
        this.updateTagbox({
          boxid: this.active_boxid,
          box: newbox
        });
      }
    },
    onDragStart: function(idx) {
      // does nothing
      return false;
    },
    endDrag: function() {
      if (this.status === "new") {
        const box = this.clientToBox(this.newbox_rect);
        if (box.left !== box.right && box.top !== box.bottom) {
          this.addNewTagbox({ box });
          this.setActiveBoxid({
            boxid: this.active_image_tag_boxes.length - 1
          });
        } else {
          this.setActiveBoxid({
            boxid: null
          });
        }
      }

      this.status = "";
    }
  }
};
</script>
<style lang='scss' scoped>
#detect-mask {
  flex-grow: 1;
  display: flex;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;

  .mask-canvas {
    height: 100%;
    width: 100%;
    display: block;
    position: relative;

    .box-border {
      box-sizing: border-box;
      position: absolute;

      $BOX_MARGIN: 2px;

      .taglabel {
        position: absolute;
        right: 0;
        top: 0;
        color: white;
        background-color: #73dd00;
      }
      .box {
        position: absolute;
        border: solid #73dd00 1px;
        left: $BOX_MARGIN;
        top: $BOX_MARGIN;
        right: $BOX_MARGIN;
        bottom: $BOX_MARGIN;
      }
      .box-active {
        border-color: red;
        background-color: rgba(255, 255, 255, 0.5);

        .taglabel {
          background-color: red;
        }
      }
    }

    #newtag {
      box-sizing: border-box;
      position: absolute;
      border: solid red 1px;
    }
  }
}
</style>
