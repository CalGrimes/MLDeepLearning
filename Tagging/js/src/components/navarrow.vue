<template>
<div class='navarrow' @click="onClick">
  <div v-if='nextFile' :class="['arrow', dir+'_arrow']"></div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "NavArrow",
  props: ["dir"],
  created() {
    window.addEventListener("keydown", this.onKeydown);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.onKeydown);
  },
  computed: {
    ...mapState([
      "filtered_imagelist",
      "active_image_filename",
      "active_boxid"
    ]),
    nextFile: function() {
      if (this.dir === "back") {
        return this.getBackName();
      } else {
        return this.getForeName();
      }
    }
  },
  methods: {
    ...mapActions(["loadCurrentImage"]),
    getBackName() {
      const idx = this.filtered_imagelist.indexOf(this.active_image_filename);
      if (idx > 0) {
        return this.filtered_imagelist[idx - 1];
      }
    },

    getForeName() {
      const idx = this.filtered_imagelist.indexOf(this.active_image_filename);
      if (idx !== -1 && idx < this.filtered_imagelist.length - 1) {
        return this.filtered_imagelist[idx + 1];
      }
    },

    onClick: function(event) {
      const next = this.nextFile;
      if (next) {
        this.loadCurrentImage(next);
      }
    },
    onKeydown: function(event) {
      if (this.active_boxid === null) {
        switch (event.key) {
          case "ArrowLeft":
            const back = this.getBackName();
            if (back) {
              this.loadCurrentImage(back);
            }
            break;
          case "ArrowRight":
            const fore = this.getForeName();
            if (fore) {
              this.loadCurrentImage(fore);
            }
            break;
        }
      }
    }
  }
};
</script>

<style lang='scss'>
.navarrow {
  position: relative;
  width: 30px;
  height: 60px;
  flex-grow: 0;
  flex-shrink: 0;

  cursor: pointer;

  .arrow {
    position: relative;
    display: inline-block;
    padding-left: 0px;
    bottom: 0;

    &:before {
      content: "";
      width: 25px;
      height: 25px;
      border: 0;

      position: absolute;
      top: 50%;
      left: 0px;
      margin-top: -4px;
    }
  }

  .forward_arrow::before {
    border-top: solid 2px #c2c2c2;
    border-right: solid 2px #c2c2c2;
    -ms-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    left: -10px;
  }

  .back_arrow::before {
    margin-left: 10px;

    border-top: solid 2px #c2c2c2;
    border-left: solid 2px #c2c2c2;
    -ms-transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
  }
}
</style>
border
