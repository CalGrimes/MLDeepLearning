<template>
  <div id="page">

    <div id="all-elements" v-if="!isFullScreenMode">
      <app-header></app-header>
      <div id='main-container'>
        <left-menu></left-menu>
        <image-list class="folder-image" v-if="username"/>
        <tagcanvas v-if="active_image_filename != null" ></tagcanvas>
        <div v-else id="no_active_image" class="filler">
          <div id='loading' v-if='!username || !filtered_imagelist || filtered_imagelist.length === 0'>
            <div v-if='image_status == IMG_STATUS.NO_IMG' class="msg_no_image">
              {{image_status.message}}
            </div>
            <div v-else-if='image_status == IMG_STATUS.LOADING' class="msg_no_image">
              <div class="sk-wave">
                <div class="sk-rect sk-rect1"></div>
                <div class="sk-rect sk-rect2"></div>
                <div class="sk-rect sk-rect3"></div>
                <div class="sk-rect sk-rect4"></div>
                <div class="sk-rect sk-rect5"></div>
              </div>
            </div>
          </div>
        </div>
        <tags></tags>
      </div>
      <tagged-images class="row"/>
      <app-footer class="row" ></app-footer>
    </div>

    <transition name="fade">
      <div id="full-screen"  v-if="isFullScreenMode">
        <tagcanvas></tagcanvas>
      </div>
    </transition>

    <modal-box v-if='notice_status.message'>
      <div slot='contents' class='mkdir-msg' >
        {{notice_status.message}}
        <input v-model="setNewUser" v-if='make_dir_message_counter===1' class="modal__contents__input" type="text">
      </div>
      <div slot='okbutton'>
        <button v-if='make_dir_message_counter <= 1' @click='updateNoticeStatus()' class="ok-button">
          OK
        </button>
        <button v-if='make_dir_message_counter > 1' @click='updateNoticeStatus()' class="load-button">
          Load
        </button>
      </div>
      <div slot='cancelbutton'>
        <button v-if='make_dir_message_counter <= 1' @click='clearNoticeStatus()' class="cancel-button">
          Cancel
        </button>
      </div>
    </modal-box>

    <modal-box v-if='error_status.message'>
      <div slot='contents' class='error-msg'>
        {{error_status.message}}
      </div>
      <div slot='footer'>
        <button class='error-button' @click='clearErrorStatus()'>close</button>
      </div>
    </modal-box>
  </div>

</template>

<script>
import AppHeader from "./header.vue";
import LeftMenu from "./leftmenu.vue";
import ImageList from "@/components/imagelist";
import NavArrow from "@/components/navarrow";
import TagCanvas from "./tagcanvas.vue";
import Tags from "./tags.vue";
import TaggedImages from "./taggedimages.vue";
import ModalBox from "@/components/modalbox";
import * as utils from "@/utils";
import { mapActions, mapState, mapMutations } from "vuex";
import AppFooter from "./footer.vue";
import { ERROR, IMG_STATUS, NOTICE, TASK_ID } from "@/const";

export default {
  data: function() {
    return {
      make_dir_message_counter: 0,
      ERROR,
      IMG_STATUS,
      NOTICE
    };
  },
  components: {
    "modal-box": ModalBox,
    "app-header": AppHeader,
    "left-menu": LeftMenu,
    "image-list": ImageList,
    tagcanvas: TagCanvas,
    tags: Tags,
    "tagged-images": TaggedImages,
    navarrow: NavArrow,
    "app-footer": AppFooter
  },
  computed: {
    ...mapState([
      "full_screen_mode",
      "active_image_filename",
      "error_status",
      "notice_status",
      "username",
      "new_user",
      "image_status",
      "filtered_imagelist"
    ]),
    setNewUser: {
      get() {
        return this.new_user;
      },
      set(e) {
        this.addNewUser({ new_user: e });
      }
    },
    isFullScreenMode: function() {
      return (
        ![null, undefined].includes(this.active_image_filename) &&
        this.full_screen_mode
      );
    }
  },
  methods: {
    ...mapMutations(["setErrorStatus", "setNoticeStatus", "addNewUser"]),
    ...mapActions(["initClient", "makeDir"]),
    messageCounter: function() {
      let counter = this.make_dir_message_counter;
      counter = counter + 1;
      this.make_dir_message_counter = counter;
    },
    mkdir: function() {
      this.setNoticeStatus({
        code: 115,
        message: "NOTICE\n\nCreating directories..."
      });
      this.makeDir();
    },
    updateNoticeStatus: function() {
      let counter = this.make_dir_message_counter;
      if (counter === 0) {
        this.setNoticeStatus({
          code: 115,
          message: "NOTICE\n\nInput your username"
        });
        this.messageCounter();
      } else if (counter === 1) {
        this.mkdir();
        this.messageCounter();
      } else if (counter > 1) {
        location.reload();
      }
    },
    clearNoticeStatus: function() {
      this.setNoticeStatus({ code: null, message: "" });
      this.make_dir_message_counter = 0;
    },
    clearErrorStatus: function() {
      this.setErrorStatus({ code: null, message: "" });
    }
  },
  created: function() {
    this.initClient();
  }
};
</script>

<style lang='scss'>
#page {
  width: 100%;
  height: 100%;
  background: #2e2f30;
}

#all-elements {
  height: 100%;
  background: $body-color;
}
#full-screen {
  height: 100%;
  background: #2e2f30;
}
#main-container {
  display: flex;
  height: calc(100% - #{$application-header-hight} - #{$footer-height} - 125px);
}

.fade-enter-active {
  transition: all 0.4s ease-out;
}
.fade-leave-active {
  transition: all 0.4s ease;
}

#no_active_image {
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  flex-grow: 1;
  background: #fff;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  #loading {
    .msg_no_image {
      display: inline-block;
      width: 50px;
      height: 40px;
    }
  }
}

.left {
  text-align: center;
}
.right {
  text-align: center;
}
.modal__contents__input {
  display: block;
  margin: auto;
  text-align: center;
  width: 150px;
  height: 25px;
  margin-top: 8px;
}
.error-msg,
.mkdir-msg {
  white-space: pre-line;
  word-wrap: break-word;
  text-align: center;
  font-weight: bold;
  margin-bottom: 0;
}
.error-button,
.ok-button,
.load-button,
.cancel-button {
  margin-bottom: 0;
  text-align: right;
  font-weight: normal;
}
</style>
