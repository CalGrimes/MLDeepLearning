<template>
  <div id='left-menu'  v-bind:class='{ open: main_menu_visible || (username === undefined) }' @click='closeMenu'>
    <div class='left-menu-bar'>
      <button class='bar-button'>
        <i class="fa fa-object-group fa-fw" aria-hidden="true"></i>
        <span class='menu-text'>Labels</span>
      </button>

      <hr>

      <div id="button-container">
        <button v-for="name in user_list" :key="name"
          class='bar-button'
          :data-username='name'
          @click='selectUser(name)'>
          <i v-if="username === name" class="fa fa-folder-open" aria-hidden="true"></i>
          <i v-if="username !== name" class="fa fa-folder" aria-hidden="true"></i>
          <span class='menu-text'>{{name}}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import * as utils from "@/utils";

export default {
  computed: {
    ...mapState(["main_menu_visible", "username", "user_list"])
  },
  methods: {
    ...mapMutations(["setMainMenuVisible"]),
    ...mapActions(["initClient"]),
    closeMenu: function() {
      this.setMainMenuVisible({ visible: false });
    },
    selectUser: function(username) {
      this.initClient(username);
      this.closeMenu();
    }
  }
};
</script>

<style lang='scss'>
#left-menu {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.3);
  display: None;
  width: 100%;
  left: 0;
  height: calc(100% - #{$application-header-hight});
  z-index: 9997;
  &.open {
    width: 100%;
    display: block;
  }
  .left-menu-bar {
    background-color: #1e264d;
    width: 300px;
    height: 100%;
  }

  #button-container {
    width: 100%;
    height: 92%;
    overflow: auto;
  }

  .bar-button {
    width: 100%;
    height: 45px;
    position: relative;
    $bg_color: #1e264d;
    text-align: left;
    margin: 0;
    color: #b7b7b7;
    background-color: $bg_color;
    outline: none;

    &:hover {
      color: #fff;
      background-color: lighten($bg_color, 15%);
    }
  }
}
</style>
