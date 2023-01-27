<template>
  <div id="imagelistblock">
    <div class="title">
      <div class="title-text row">
        <span class="col-md-8 text">Images</span>
        <span v-if='username && (filtered_imagelist.length !== 0)' class="col number">{{filtered_imagelist.length}}</span>
        <span v-else class="col number">0</span>
      </div>
    </div>
    <div class="content">
      <div class="row clear-margin first-row">
        <div class="col-md-4 fillter-button left">
          <div :class='[{"image_pred_tagbutton_active" : isSelectedFilter("All")} ,
            {"off" : !isSelectedFilter("All")}]'
              @click='updateFilter("All")'>
              ALL
          </div>
        </div>
        <div class="col-md-8 fillter-button right">
          <div :class='[{"image_pred_tagbutton_active": isSelectedFilter("NeedReview")},
            { "off" : !isSelectedFilter("NeedReview")}]' @click='updateFilter("NeedReview")'>
            <img v-if='isSelectedFilter("NeedReview")' class="button-icon" :src="NO_REVIEW">
            <img v-else class="button-icon" :src="NO_REVIEW_OFF"> Need Review
          </div>
        </div>
      </div>
      <div class="row clear-margin first-row">
        <div class="col fillter-button Notags-fillter">
          <div :class='[{"image_pred_tagbutton_active" : isSelectedFilter("NoTags")} ,
            { "off" : !isSelectedFilter("NoTags")}]'
              @click='updateFilter("NoTags")'>
              No Tags
          </div>
        </div>
        <div class="col fillter-button OK-fillter">
          <div :class='[{"image_pred_tagbutton_active": isSelectedFilter("CHECK_OK") },
            { "off" : !isSelectedFilter("CHECK_OK")}]'
            @click='updateFilter("CHECK_OK")'>
            <img v-if="isSelectedFilter('CHECK_OK')" class="button-icon" :src="CHECK_OK">
            <img v-else class="button-icon" :src="CHECK_OK_OFF"> OK
          </div>
        </div>
        <div class="col fillter-button NG-fillter">
          <div :class='[{"image_pred_tagbutton_active": isSelectedFilter("CHECK_NG")},
            { "off" : !isSelectedFilter("CHECK_NG")}]'
            @click='updateFilter("CHECK_NG")'>
            <img v-if="isSelectedFilter('CHECK_NG')" class="ng-button-icon" :src="CHECK_NG">
            <img v-else class="ng-button-icon" :src="CHECK_NG_OFF"> NG
          </div>
        </div>
      </div>
    </div>
    <div id="imagelist" @scroll="onScroll">
      <div v-for="file in fileListTop" :key="file">
        <div style="position:relative">
          <span class="img-status-wrapper">
            <img v-if="!isNotags(file)">
            <img v-else-if="isNeedReview(file)" class="img-status" :src="STATUS_NEED_REVIEW">
            <img v-else-if="isReviewResultOk(file) === true" class="img-status" :src="STATUS_CHECK_OK">
            <img v-else-if="isReviewResultOk(file) === false" class="img-status" :src="STATUS_CHECK_NG">
          </span>
          <img
            class="thumbnail"
           :src='getImageUrl(file)'
           :data-file='file'
           :class='{selected: isSelected(file)}'
           @click.stop.prevent="selectImage">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions } from "vuex";
import * as utils from "@/utils";
import { hasAnnotation, getReviewResult } from "@/store/mutation";
export default {
  data: function() {
    return {
      IMAGE_RELOAD_MARGIN: 100,
      IMAGE_RELOAD_AMOUNT: 300,
      NO_REVIEW: require("../assets/images/Need_Review_ON.svg"),
      CHECK_OK: require("../assets/images/OK.svg"),
      CHECK_NG: require("../assets/images/NG.svg"),
      NO_REVIEW_OFF: require("../assets/images/Need_Review_Off.svg"),
      CHECK_OK_OFF: require("../assets/images/OK_hover.svg"),
      CHECK_NG_OFF: require("../assets/images/NG_hover.svg"),
      STATUS_NEED_REVIEW: require("../assets/images/Need_Review_icon.svg"),
      STATUS_CHECK_OK: require("../assets/images/P_OK.svg"),
      STATUS_CHECK_NG: require("../assets/images/P_NG.svg")
    };
  },
  computed: {
    ...mapState([
      "username",
      "folder_files",
      "filtered_imagelist",
      "imagelist_max_display",
      "active_image_filename",
      "filter_method"
    ]),
    fileListTop: function() {
      if (!this.filtered_imagelist) {
        return [];
      }
      return this.filtered_imagelist.slice(0, this.imagelist_max_display);
    }
    // 0) Not useing currently but maight use sometime
    //
    // fileList: function() {
    //   let keys = Object.keys(this.filtered_imagelist).sort((l, r) => l - r);
    //   let ret = [];
    //   keys.forEach(k => ret.push(this.filtered_imagelist[k]));
    //
    //   console.log("ret :",ret);
    //   return ret;
    // }
  },
  watch: {
    active_image_filename: function(newvalue, oldvalue) {
      let n = this.filtered_imagelist.indexOf(newvalue);
      if (n === -1) {
        return;
      }
      let img = this.$el.querySelector(`#imagelist img:nth-child(${n + 1})`);
      if (!img) {
        return;
      }
      let imgrc = img.getBoundingClientRect();
      let wrapper = this.$el.querySelector(`#imagelist`);
      let wrapperrc = wrapper.getBoundingClientRect();

      if (imgrc.bottom >= wrapperrc.bottom) {
        let dy = imgrc.bottom - wrapperrc.bottom;

        wrapper.scrollBy(0, dy + wrapperrc.height / 4);
      } else if (imgrc.top < wrapperrc.top) {
        let dy = imgrc.top - wrapperrc.top - wrapperrc.height / 4;
        wrapper.scrollBy(0, dy);
      }
    }
  },
  methods: {
    ...mapMutations(["setActiveImage", "setFilter", "setImagelistMaxDisplay"]),
    ...mapActions(["loadCurrentImage"]),
    isSelectedFilter: function(filter_name) {
      if (this.filter_method === filter_name) {
        return true;
      }
      return false;
    },
    updateFilter: function(filter_name) {
      this.setActiveImage({ filename: "none" });
      this.setFilter(filter_name);
    },
    isReviewResultOk(file) {
      const info = this.folder_files[file];
      const review = getReviewResult(info);
      if (review === "ng") {
        return false;
      }
      return true;
    },
    isNeedReview: function(file) {
      const info = this.folder_files[file];
      const review = getReviewResult(info);
      if (review === "notreviewed") {
        return true;
      }
      return false;
    },
    isNotags(file) {
      const info = this.folder_files[file];
      const review = hasAnnotation(this.$store.state, info);
      return review;
    },
    getImageUrl(file) {
      return utils.buildApiUrl("/t/" + this.username + "/" + file);
    },
    isSelected(filename) {
      return filename === this.active_image_filename;
    },
    selectImage(event) {
      if (event.target.dataset.file !== this.active_image_filename) {
        this.loadCurrentImage(event.target.dataset.file);
      }
    },
    onScroll: function(event) {
      if (this.imagelist_max_display < this.filtered_imagelist.length) {
        let n = this.imagelist_max_display - this.IMAGE_RELOAD_MARGIN;
        if (n <= 0) {
          n = 1;
        }
        let loaded_img = this.$el.querySelectorAll(`#imagelist img.thumbnail`);
        if (loaded_img[n] !== null) {
          let img = loaded_img[n];

          let imgrc = img.getBoundingClientRect();
          let wrapper = this.$el.querySelector(`#imagelist`);
          let wrapperrc = wrapper.getBoundingClientRect();

          if (imgrc.top <= wrapperrc.top) {
            this.setImagelistMaxDisplay({
              max_display: this.imagelist_max_display + this.IMAGE_RELOAD_AMOUNT
            });
          }
        } else if (loaded_img[n] === null) {
        }
      }
    }
  }
};
</script>

<style scoped lang='scss'>
#imagelistblock {
  width: 330px;
  //box-sizing: border-box;
  flex-grow: 0;
  flex-shrink: 0;
  overflow: hidden;
  padding-left: $content-top-heder-horizonral-margin;
  padding-right: $content-top-heder-horizonral-margin;
  font-family: $content-top-header-font-family;
  margin-top: $component-margin-top;
}
.title {
  background: $content-header-color;
  height: calc(#{$panel-height} - 7px);
  .title-text {
    padding: 0;
    font-size: $content-top-header-font-size;
    line-height: calc(#{$panel-height} - 7px);
    padding-left: $content-top-heder-horizonral-margin;
    color: $font-color;
  }
}

.no-icon {
  padding-left: calc(21.97px + 5px);
}

.button-icon {
  height: calc(15px * 0.8);
  padding-left: 2px;
}

.ng-button-icon {
  height: calc(15px * 0.75);
  padding-left: 5px;
  margin-bottom: 2px;
}

.image_pred_tagbutton_active {
  background-color: $panel-bg-color;
  color: $font-color;
  height: calc(#{$content-top-header-hight} - 12px);
  line-height: calc(#{$content-top-header-hight} - 12px);
}
.image_pred_reviewbutton_active {
  background-color: $panel-bg-color;
  color: $font-color;
  height: calc(#{$content-top-header-hight} - 12px);
  line-height: calc(#{$content-top-header-hight} - 12px);
}

.clear-margin {
  margin-right: 0;
  margin-left: 0;
  height: 20px;
}
.first-row {
  margin-top: 10px;
}

.not-first {
  margin-top: 5px;
}

.fillter-button {
  color: black;
  height: 20px;
  text-align: center;
  cursor: pointer;
  font-family: $content-top-header-font-family;
  font-size: calc(#{$content-inner-header-font-size} - 2pt);
}

.number {
  font-size: calc(#{$content-inner-header-font-size} - 3pt);
  margin-top: calc((#{$content-inner-header-font-size} - 2pt) * 0.15);
}

.off {
  height: calc(#{$content-top-header-hight} - 12px);
  line-height: calc(#{$content-top-header-hight} - 12px);
  color: black;
  background: #fff;
  &:hover {
    background: #cccccc;
  }
}

.left {
  padding: 0;
  padding-right: 2.5px;
}

.right {
  padding: 0;
  padding-left: 2.5px;
}

.Notags-fillter {
  padding: 0;
  padding-right: 2.5px;
}
.OK-fillter {
  padding: 0;
  padding-left: 2.5px;
  padding-right: 2.5px;
}

.NG-fillter {
  padding: 0;
  padding-left: 2.5px;
}

.dot-ok {
  color: $tooltips-color;
}

.dot-ng {
  color: #dc3545;
}

#imagelist {
  display: flex;
  padding-right: 6px;
  flex-wrap: wrap;
  overflow: auto;
  box-sizing: border-box;
  height: calc(
    100% - #{$component-margin-top} - (#{$content-top-margin} * 3) - #{$content-top-header-hight} -
      (calc(#{$content-top-header-hight} -2px) * 2)
  );
  margin-top: calc(#{$content-top-margin} * 2);
  align-content: flex-start;
  justify-content: space-evenly;
  background: #fff;

  .thumbnail {
    cursor: pointer;
  }

  img {
    box-sizing: border-box;
    align-self: baseline;
    margin: 1px;
    flex-grow: 0;
    flex-shrink: 0;

    &.selected {
      box-sizing: border-box;
      outline: 2px solid #ee7b33;
      outline-offset: -2px;
    }
  }
  .img-status {
    position: absolute;
    left: -3px;
    top: 1px;
    margin: 0;
    padding: 0;
    height: 18px;
  }
}

@function calc_button_size($base_size, $adjustment_size) {
  @return calc($base_size - $adjustment_size);
}
</style>
