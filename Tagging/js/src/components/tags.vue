<template>
<div id="tags">
  <form v-if="is_admin" id="add-new-label-form">
    <div v-if='errormsg' class='label_errormsg'>{{errormsg}}</div>
    <div class="add-new-label-input-area">
      <input  type="text"
              class="label-text"
              v-model='label'
              placeholder="tag name...">

        <input
          type="text"
          class="label-shortcut"
          v-model='shortcut'
          @keydown='keydown'
          @keyup='setShortcutKey'
          placeholder="key...">
    </div>
    <div class="add-new-label-btn-wrapper">
      <button
        @click.prevent.stop="addNewLabel"
        class="add-new-label-btn"
        :disabled="!isValidLabel"
      >
      Add New Tag
      </button>
    </div>
  </form>
  <div class="title" :class="{ 'top' : !is_admin}">
      <div class="title-text">
        Tag List
        <span v-if="is_delete_mode">【delete mode】</span>
    </div>
  </div>
    <div id="tag-tree">
      <ul class="tag-list">
        <li
          v-for="(data, key) in labels"
          class="tag-list-item"
          @click="onClick"
          :key="key"
          :data-label="data.label"
          :data-key="key"
        >
          <div class="label-color" :style="{ background: getLabelColor(key)}"></div>
          <input
            v-if="edit_target[0] === data.label && edit_mode === true"
            type="text"
            class="label-text-update"
            v-model="edit_label"
            placeholder="label name..."
            :readonly="!is_admin"
            @keyup="sendToUpdateLabel"
          >
            <div v-else class="label-text">{{getTagName(data.label)}}</div>
          <input
            v-if="edit_target[0] === data.label && edit_mode === true"
            type="text"
            class="label-shortcut-update"
            v-model="edit_shortcut"
            @keydown.stop.prevent.self="sendToUpdateLabel"
            @keyup.stop.prevent.self="updateShortcutKey"
            placeholder="key..."
          >
          <div v-else-if="data.shortcut" class="label-shortcut">{{data.shortcut}}</div>
          <div v-if="is_delete_mode">
            <input
              type="checkbox"
              :value="{name:data.label,key:key}"
              class="label-check-box"
              v-model="delete_item_list"
            >
          </div>
          <div v-else>
            <img
              v-if="edit_target[0] === data.label && edit_mode === true"
              @click="sendToUpdateLabel('edit_off')"
              @click.stop.prevent="editMode(key, data.label, data.shortcut), editToggle()"
              class="tag_list_icon"
              :src="tag_list_icon"
            >
            <img
              v-else
              @click.stop.prevent="editMode(key, data.label, data.shortcut), editToggle()"
              class="tag_list_icon"
              :src="tag_list_icon"
            >
          </div>
        </li>
        <div v-if="updateErrormsg" class="label_errormsg">{{updateErrormsg}}</div>
      </ul>
    </div>

    <div v-if="is_admin">
      <div v-if="!is_delete_mode">
        <button
          id="modify-mode-button"
          class="button"
          @click="is_delete_mode=true"
        >Delete Tag List</button>
    </div>
      <div v-else>
        <button
          class="button"
          @click="show_delete_dialog=true"
          :disabled="delete_item_list.length == 0"
        >
        Delete
      </button>

        <button class="button" @click="is_delete_mode=false">Cancel</button>
      </div>
    </div>

    <modal-box
      v-if="show_delete_dialog"
      @ok="deleteTags(delete_item_list)"
      @cancel="show_delete_dialog=false"
    >
      <div class="modal-title" slot="contents">
        <p>Are you sure you want to delete this item(s)?</p>
        <ul>
          <li v-for="delete_item in delete_item_list">{{delete_item.name}}</li>
        </ul>
      </div>
      <span slot="okbutton">
        <button
          id="delete_labels_button"
          class="modal-default-button"
          @click="
        deleteTags(delete_item_list)"
        >
        <fa-icon icon="fas fa-trash-alt" />
        Delete
        </button>
    </span>
  </modal-box>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import ModalBox from "@/components/modalbox";
import * as utils from "@/utils";
import { TASK_ID } from "@/const.js";

export default {
  components: {
    "modal-box": ModalBox
  },

  data: function() {
    return {
      TASK_ID,
      label: "", // add label
      shortcut: "", // add shortcut
      edit_label: "", // for update label
      edit_shortcut: "", // for update shortcut
      edit_target: "", // flags
      edit_mode: false,
      show_delete_dialog: false,
      add_new_tag_button: require("../assets/images/addnewtag.png"),
      add_new_tag_button_disabled: require("../assets/images/addnewtag_disabled.png"),
      tag_list_icon: require("../assets/images/taglistIcon.svg"),
      is_delete_mode: false,
      delete_item_list: []
    };
  },

  computed: {
    ...mapState([
      "labels",
      "current_task",
      "labels_color",
      "is_admin",
      "active_image_tag_polygons"
    ]),
    errormsg: function() {
      if (this.label.length) {
        if (!this.label.match("^[0-9a-z-A-Z]+$") || this.label.match(/-/)) {
          return "Class name must be alphanumeric single-byte.";
        }
      }
      for (let { label, shortcut } in Object.values(this.labels)) {
        if (label === this.label) {
          return "Please set unique label.";
        }
        if (this.shortcut && shortcut === this.shortcut) {
          return "Shortcut is already exists.";
        }
      }
      return "";
    },

    isValidLabel: function() {
      if (!this.label.length) {
        return false;
      }
      return this.errormsg === "";
    },

    updateErrormsg: function() {
      if (this.edit_label.length) {
        if (!this.edit_label.match("^[0-9a-z-A-Z]+$")) {
          return "Class name must be alphanumeric single-byte.";
        }
      }

      for (let key in this.labels) {
        if (this.edit_target[0] !== this.edit_label) {
          if (this.edit_label === this.labels[key].label) {
            if (this.edit_target !== "") {
              return "Please set unique label.";
            }
          }
        }
        if (this.edit_target[1] !== this.edit_shortcut) {
          if (this.edit_label === this.labels[key].shortcut) {
            if (this.edit_shortcut !== "" && this.edit_target !== "") {
              return "Shortcut is already exists.";
            }
          }
        }
      }
      return "";
    }
  },

  methods: {
    ...mapMutations([
      "current_task",
      "setActiveboxLabel",
      "setActivePolyLabel",
      "addLabelToState",
      "setObservedEvent"
    ]),
    ...mapActions(["addLabelToJson", "deleteTaglist", "updateLabel"]),
    addNewLabel: function() {
      this.addLabelToJson({
        label: this.label,
        shortcut: this.shortcut
      });
      // this.addLabelToJson();
      this.label = this.shortcut = "";
      document.body.focus();
    },
    isControlKey(k) {
      const keys = [
        13, // Enter(ten key)
        32, // Space
        8, // BackSpace
        9, // Tab
        46, // Delete
        37, // ←
        38, // →
        39, // ↑
        40 // ↓
      ];
      if (keys.indexOf(k) >= 0) {
        return true;
      } else {
        return false;
      }
    },

    keydown(event) {
      if (event.keyCode === 46 || event.keyCode === 8) {
        // delete or backspace
        this.shortcut = "";
        event.preventDefault();
        return;
      }
      if (!this.isControlKey(event.keyCode)) {
        event.preventDefault();
      }
      if (event.keyCode === 13) {
        if (this.errormsg === "") {
          this.addNewLabel();
        }
      }
    },

    setShortcutKey(event) {
      if (this.isControlKey(event.keyCode)) {
        return;
      }
      this.shortcut = event.key;
    },

    onClick(event) {
      const label = event.currentTarget.dataset.label;
      const key = event.currentTarget.dataset.key;
      if (this.current_task === this.TASK_ID.DETECTION) {
        this.setActiveboxLabel({ label });
      } else if (this.current_task === this.TASK_ID.SEGMENTATION) {
        this.setObservedEvent("set_label"); // for B-1. active_image_tag_polygons: in segmask.vue
        this.setActivePolyLabel({ key: key, label: label });
      }
    },
    editToggle() {
      this.edit_mode = !this.edit_mode;
    },
    editMode(index, tag, tag_shortcut) {
      let label = tag;
      let shortcut = tag_shortcut;
      let target = [label, shortcut, true];

      this.edit_label = label;
      this.edit_shortcut = shortcut;
      this.edit_target = target;
    },

    sendToUpdateLabel(event) {
      // if Enter
      if (event.keyCode === 13 || event == "edit_off") {
        if (this.updateErrormsg === "") {
          if (this.edit_label === "") {
            this.edit_label = this.edit_target[0];
          }
          this.updateLabel({
            // labels: this.labels,
            edit_target: this.edit_target,
            dist_label: this.edit_label,
            dist_shortcut: this.edit_shortcut
          });
          this.edit_target = "";
        }
        document.body.focus();
      }
    },

    updateShortcutKey(event) {
      if (event.keyCode === 46 || event.keyCode === 8) {
        // delete or backspace
        this.shortcut = "";
        this.edit_shortcut = "";
        event.preventDefault();
        return;
      } else if (this.isControlKey(event.keyCode)) {
        return;
      }
      this.edit_shortcut = event.key;
    },

    deleteTags(delete_item_list) {
      let delete_item_obj = {};

      delete_item_list.filter(element => {
        delete_item_obj[element.key] = element.name;
      });
      this.deleteTaglist({ delete_item_obj: delete_item_obj });
      this.delete_item_list = [];
      this.show_delete_dialog = false;
      this.is_delete_mode = false;
    },
    getTagName: function(tag_name) {
      let name_length = 12;
      if (tag_name.length > name_length) {
        return tag_name.slice(0, name_length) + "...";
      }
      return tag_name;
    },
    getLabelColor: function(key) {
      // this "key" is the key of labels object
      // conver to Number couse getLabelColor changes the action depending on the type of the third argument
      let id = Number(key);
      let label_color = utils.getLabelColor(this.labels, this.labels_color, id);
      return label_color;
    }
  }
};
</script>

<style lang='scss' scoped>
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: $body-color;
  border: none;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #aaa;
  border-radius: 4px;
  box-shadow: none;
}
#tags {
  box-sizing: border-box;
  width: 275px;
  height: 100%;
  flex-grow: 0;
  flex-shrink: 0;
  color: $font-color;
  padding: 0 25px;
  background-color: $body-color;

  .title {
    margin-top: $content-top-margin;
    height: calc(#{$panel-height} - 7px);
    background: $content-header-color;
    line-height: calc(#{$panel-height} - 7px);
    .title-text {
      margin-left: $content-margin;
      font-family: $content-top-header-font-family;
      font-size: $content-modellist-font-size;
    }
  }

  .top {
    margin-top: $component-margin-top;
    height: calc(#{$panel-height} - 7px);
    background: $content-header-color;
    line-height: calc(#{$panel-height} - 7px);
    .title-text {
      margin-left: $content-margin;
      font-family: $content-top-header-font-family;
      font-size: $content-modellist-font-size;
    }
  }

  #add-new-label-form {
    padding: 0;
    margin: 0;
    margin-top: $component-margin-top;
    background: none;
    border: none;
  }

  .add-new-label-input-area {
    display: flex;
    justify-content: space-between;
    border-color: #7d7d7d;
    margin: 0;

    &::-webkit-input-placeholder {
      color: #a6a6a6;
      font-size: 13px;
    }

    input {
      padding: 3px 7px;
      border-color: #7d7d7d;
      margin: 0;
      &::-webkit-input-placeholder {
        color: #a6a6a6;
        font-size: 13px;
      }
    }
    input.label-text {
      width: 130px;
      border-radius: 0;
    }
    input.label-shortcut {
      width: 62.5px;
      border-radius: 0;
    }
  }
  .add-new-label-btn-wrapper {
    display: inline-flex;
    width: 100%;
    align-items: middle;
    flex-direction: row;
  }
  .add-new-label-btn {
    color: #fff;
    margin: 10px 0 0 0;
    cursor: pointer;
    background-color: $panel-bg-color-hover;
    // background-color: #989898;
    width: 100%;
    padding: 10px;
    vertical-align: middle;
    text-align: center;
    &:before {
      display: inline-block;
      content: "＋";
      font-size: 1.2rem;
      line-height: 0;
      vertical-align: middle;
    }
    &:focus {
      outline: none;
    }
    &:disabled {
      background-color: $disabled-color;
      cursor: default;
    }
  }

  #tag-tree {
    height: calc(100% - 220px);
    overflow-y: auto;
    .tag-list {
      width: 100%;
      height: 100%;
      font-family: $content-inner-header-font-family;
      font-size: $content-modellist-font-size;
      box-sizing: border-box;
      list-style: none;
      padding: 0;
      margin: 0;
      border-style: none;
      padding-right: 10px;
    }
    input {
      padding: 3px 7px;
      border-color: #7d7d7d;
      margin: 0;
      &::-webkit-input-placeholder {
        color: #a6a6a6;
        font-size: 13px;
      }
    }
  }

  .tag-list-item {
    width: 100%;
    padding-right: 10px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    background-color: #fff;
    &:hover {
      background-color: $table-hover-color;
      cursor: pointer;
    }
    &:not(fast-child) {
      margin-top: 5px;
    }
    .label-color {
      width: 5px;
    }
    .label-text,
    .label-shortcut {
      padding: 0;
      margin: 0;
      outline: none;
      color: $font-color-label;
      line-height: $panel-height;
    }

    .label-text {
      flex: 1;
      margin-left: 10px;
    }
    .label-shortcut {
      text-align: center;
      margin-right: 5px;
    }

    input.label-text-update {
      width: 130px;
      height: 35px;
      border-radius: 0;
    }

    input.label-shortcut-update {
      width: 31.125px;
      height: 35px;
      border-radius: 0;
    }

    .tag_list_icon {
      margin-top: calc(18px * 0.5);
      height: 15px;
    }
    .label-check-box {
      height: 100%;
      width: auto;
      display: block;
      z-index: 10px;
      position: static;
      clip: rect(10 10 10 10);
      clip-path: inherit;
    }
  }
  .button {
    cursor: pointer;
    border: none;
    background-color: #fff;
    color: $font-color-label;
  }
  #modify-mode-button {
    width: 60%;
    text-align: center;
    font-family: $content-top-header-font-family;
    font-size: $content-modellist-font-size;
    cursor: pointer;
    border: none;
    background-color: #fff;
    color: $font-color-label;

    &:focus {
      outline: none;
    }
    &:hover {
      background-color: lighten(#ff1616, 10%);
      color: #fff;
    }
  }
  .label_errormsg {
    display: block;
    position: absolute;
    font-weight: bold;
    color: #ff1616;
    font-size: 10pt;
    z-index: 9999;
    background-color: $table-hover-color;
    margin: -5px;
    right: 20px;
    top: 42px;
  }
  #delete_labels_button {
    background-color: lighten(#ff1616, 10%);
  }

  .modal-title {
    color: #000;
  }
}
</style>
