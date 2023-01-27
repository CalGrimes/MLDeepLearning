<template>
  <header>
    <div id="menu-title">
      <img id="hanburger-menu" :src="Menu" @click='toggleMenuVisible' aria-hidden='true'>
      <div id="tool-name">
        <span class="renom">ReNomTAG</span>
        <span v-if="is_admin" class="current-page"> &gt; {{username}} &gt; Admin</span>
        <span v-else class="current-page"> &gt; {{username}} &gt; Main</span>
      </div>
    </div>
    <div id="task-buttons">
      <div id="detection-button"
        :class='{selectedTask: current_task===TASK_ID.DETECTION}'
        @click='setCurrentTask(TASK_ID.DETECTION); initClient();'>
        Detection
      </div>
      <div id="segmentation-button"
        :class='{selectedTask: current_task===TASK_ID.SEGMENTATION}'
        @click='setCurrentTask(TASK_ID.SEGMENTATION); initClient();'>
        Segmentation
      </div>
    </div>
  </header>
</template>

<script>
import { mapMutations, mapState, mapActions } from "vuex";
import { ERROR, IMG_STATUS, NOTICE, TASK_ID } from "@/const.js";

export default {
  name: "AppHeader",
  data: function() {
    return {
      TASK_ID,
      Menu: require("../assets/images/han.png")
    };
  },
  computed: {
    ...mapState(["is_admin", "username", "current_task"])
  },

  methods: {
    ...mapActions(["initClient"]),
    ...mapMutations(["setMainMenuVisible", "setCurrentTask"]),

    toggleMenuVisible: function() {
      let cur = this.$store.state.main_menu_visible;
      this.setMainMenuVisible({ visible: !cur });
    }
  }
};
</script>

<style lang='scss'>
header {
  box-sizing: border-box;
  height: $application-header-hight;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: $content-header-color;
  align-items: center;
  font-family: $header-product-name-font-family;
  font-size: $font-size;
  display: flex !important;
  flex-flow: row nowrap;
  justify-content: space-between;

  #menu-title {
    height: 100%;
    width: 40%;
    display: flex;
    align-items: center;
    margin: 0;

    #hanburger-menu {
      display: flex;
      margin-left: $component-inner-horizontal-margin;
      cursor: pointer;
      height: 40%;
    }
    #tool-name {
      height: 100%;

      .renom,
      .current-page {
        line-height: $application-header-hight;
        vertical-align: middle;
      }
      .renom {
        margin-left: $content-top-heder-horizonral-margin;
        font-family: $header-product-name-font-family;
        font-size: $header-product-name-font-size;
      }
      .current-page {
        font-family: $header-title-font-family;
        font-size: $header-title-font-size;
      }
    }
  }

  #task-buttons {
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 14.4px;
    font-weight: bold;
    // margin: 0 $header-title-margin-left 0 0 ;
    margin: 0;

    div {
      margin-right: $header-title-margin-left;
      cursor: pointer;
    }
    div:hover {
      color: gray;
    }
    .selectedTask {
      border-bottom: solid 1.5px white;
    }
    .selectedTask:hover {
      border-bottom: solid 1.5px gray;
    }
  }
}
</style>
