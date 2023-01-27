<template>

  <div id="tagged-images">
    <div class="labelbox">
      <div class="label_text">Images<br />+Tags<br />{{tagged_images.length}}</div>
    </div>
    <div v-for="(image, index) in tagged_images" :key="image.filename" class='tagged-image'
      :style="{'background-image': 'url('+image.image+')', width:imageWidth(image)+'px'}"
      :data-filename='image.filename'
      @click.stop.prevent='onClick'>

      <!-- TODO muraishi: 5. for SEGMENTATION, "tagged images" shown below the app -->

      <svg class="poly-canvas" :id="'poly' + index"
        v-if="current_task === TASK_ID.SEGMENTATION">
        {{ drawPolygon(image, index) }}
      </svg>

      <div v-for="(box, idx) in image.boxes"
          v-if="current_task === TASK_ID.DETECTION"
          class='image-box'
          :key='idx'
          :style='boxStyles(image, box)'>
        <div class='taglabel'>{{box.label}}</div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { ERROR, IMG_STATUS, NOTICE, TASK_ID } from "@/const.js";
import * as d3 from "d3";
export const BLOCK_HEIGHT = 125;

export default {
  computed: {
    ...mapState(["tagged_images", "current_task"])
  },
  data: function() {
    return {
      TASK_ID
    };
  },
  methods: {
    ...mapActions(["loadCurrentImage"]),
    ratio: function(image) {
      return BLOCK_HEIGHT / image.height;
    },

    imageWidth: function(image) {
      const ratio = this.ratio(image);
      return image.width * ratio;
    },
    drawPolygon: function(image, index) {
      this.$nextTick(function() {
        var svg = d3.select("#poly" + index);

        var width = svg._groups[0][0].clientWidth;
        var height = svg._groups[0][0].clientHeight;
        var ratio = width / image.width;
        var x = d3.scaleLinear();
        var y = d3.scaleLinear();
        svg.selectAll(".polygon").remove();

        image.polygons.forEach(function(p) {
          svg
            .append("polygon")
            .data([p])
            .attr("points", function(d) {
              return d.points
                .map(function(p) {
                  return [x(p.x * ratio), y(p.y * ratio)].join(",");
                })
                .join(" ");
            })
            .classed("polygon", true)
            .attr("stroke", "#ccc")
            .attr("stroke-width", "0.75px")
            .attr("fill", "#ff0000")
            .attr("fill-opacity", "0.5");
        });
      });
    },
    boxStyles: function(image, box) {
      const ratio = this.ratio(image);
      return {
        left: `${box.left * ratio}px`,
        top: `${box.top * ratio}px`,
        width: `${(box.right - box.left) * ratio}px`,
        height: `${(box.bottom - box.top) * ratio}px`
      };
    },
    onClick: function(event) {
      const filename = event.currentTarget.dataset.filename;
      this.loadCurrentImage(filename);
    }
  }
};
</script>

<style scoped lang='scss'>
#tagged-images {
  position: relative;
  box-sizing: border-box;
  background-color: #cccccc;
  white-space: nowrap;
  height: 125px;
  overflow: hidden;
  flex-wrap: wrap;

  .poly-canvas {
    width: 100%;
    height: 100%;
  }

  .labelbox {
    position: relative;
    display: inline-block;
    line-height: normal;
    color: white;
    background-color: #1e264d;
    width: 125px;
    height: 125px;
    text-align: center;
  }
  .label_text {
    position: absolute;
    margin: auto;
    width: 125px;
    margin-top: 40px;
  }
  .tagged-image {
    box-sizing: border-box;
    position: relative;
    display: inline-block;
    height: 125px;
    background-size: cover;
    margin-top: 0px;
  }

  .image-box {
    position: absolute;
    border: solid 1px red;

    .taglabel {
      position: absolute;
      right: 0;
      top: 0;
      color: white;
      background-color: red;
      font-size: 10px;
    }
  }
}
</style>
