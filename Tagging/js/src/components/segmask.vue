<template>
    <div id="seg-mask" ref="segmask"
    @mousedown.left='onClickSegMask'>

      <svg id="mask-canvas" ref="maskcanvas">
      </svg>

    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import * as d3 from "d3";
import * as utils from "@/utils";

export default {
  name: "SegMask",
  data: function() {
    return {
      node: null,
      points: [],
      focus: null,
      polygons_selected_flag: [],
      maskcanvas_status: "fixed", // "fixed", "wip","modi-haslabel" , "modi-nolabel"
      d3Wrapper: {
        d3,
        svg: null
      }
    };
  },
  created: function() {
    window.addEventListener("keyup", this.onKeyup);
    window.addEventListener("keydown", this.onKeydown);
  },
  beforeDestroy: function() {
    window.removeEventListener("keyup", this.onKeyup);
    window.removeEventListener("keydown", this.onKeydown);
  },
  mounted: function() {
    this.d3Wrapper.svg = d3.select("#mask-canvas");
    setTimeout(this.initialzeNode, 10);
    setTimeout(this.arrangePolySVG, 10);
    this.$emit("statusOfMask", this.maskcanvas_status); // use in tagcanvas.vue
  },
  computed: {
    ...mapState([
      "active_polygonid",
      "active_image_tag_polygons",
      "saving_sate",
      "labels",
      "labels_color",
      "active_image",
      "observed_event"
    ]),
    selectMode: function() {
      return this.$parent.show_selected_anno;
    }
  },
  watch: {
    maskcanvas_status: function() {
      this.$emit("statusOfMask", this.maskcanvas_status); // use in tagcanvas.vue
    },
    active_image: function() {
      this.$nextTick(() => {
        // when changed to next image
        this.setActivePolygonid({ polygonid: null });
        this.arrangePolySVG();
      });
    },
    active_image_tag_polygons: function() {
      this.$nextTick(() => {
        this.arrangePolySVG();
      });
    },
    observed_event: function() {
      let e = this.observed_event;
      if (
        e &&
        (e === "set_label" || e === "clicked_mcleanActivePolySVGiedPoly")
      ) {
        if (this.active_polygonid !== null) {
          // B-1. when label is added, first update the points. then execute B-2.
          this.updateModifiedPoly(this.active_polygonid);
        }
      }
      this.setObservedEvent(null);
    }
  },
  methods: {
    ...mapMutations([
      // "setTagPolygons",
      "addNewPolygon",
      "removeTagPolygon",
      "toggleSavingState",
      "setActivePolygonid",
      "updateTagPolygon",
      "removeTagPolygon",
      "setObservedEvent",
      "setActivePolyLabel"
    ]),
    initialzeSVG: function() {
      this.cleanWipSVG();
      this.cleanAllFixedPolySVG();
      this.cleanActivePolySVG(); // clean the path and points for modifying
      this.maskcanvas_status = "fixed";
      this.points = [];
    },
    initialzeNode: function() {
      this.node = this.$refs.segmask.getBoundingClientRect();
    },
    setSelectedFlag: function(polygons) {
      if (!polygons) {
        return;
      }
      let selected;
      if (this.selectMode === false) {
        this.polygons_selected_flag = [];
        polygons.forEach(
          function(poly, polyid) {
            selected = polyid === this.active_polygonid;
            this.polygons_selected_flag.push(selected);
          }.bind(this)
        );
      } else if (this.selectMode === true) {
        // selected mode
        if (
          polygons.length - 1 === this.polygons_selected_flag.length &&
          polygons.length - 1 === this.active_polygonid
        ) {
          selected = true;
          this.polygons_selected_flag.push(selected);
        }
      }
    },
    setPolySvgStatus: function(poly, polyid) {
      if (poly.status !== "not selected") {
        if (polyid === this.active_polygonid) {
          if (poly.hasOwnProperty("label")) {
            poly.status = "active";
            // B-2. after the moidfied points are saved, now the polygon can be drawn as svg.
          } else {
            poly.status = "new";
            // A. info is added in state but not yet drawn. ("wip"ended )
          }
        } else {
          poly.status = "fixed";
          // C. draw fixed polygon ,which was modify mode previously.
        }
      }
      return poly;
    },

    fileterSelectedPolys: function(polygons) {
      if (this.selectMode === false) {
        // original mode
        return;
      }

      let filtered_polygons = polygons.map(
        function(poly, id) {
          let ret =
            this.polygons_selected_flag[id] === true
              ? poly
              : { status: "not selected" };
          return ret;
        }.bind(this)
      );

      return filtered_polygons;
    },
    checkMaskCanvasStatus: function(polygons) {
      let status = null;

      if (this.active_polygonid !== null) {
        if (polygons[this.active_polygonid].status === "active") {
          status = "modi-haslabel";
          // B-2. after the moidfied points are saved, now it can be drawn as svg
        } else if (polygons[this.active_polygonid].status === "new") {
          status = "modi-nolabel";
          // A. info is added in state but not yet drawn ("wip"ended)
        }
      } else if (this.active_polygonid === null) {
        var svg = this.d3Wrapper.svg;
        const wipCloser = svg.selectAll("#wipCloser")._groups[0];
        if (wipCloser && wipCloser.length !== 0) {
          status = "wip";
          // D. if drawing lines
        }

        status = "fixed";
        // C. draw fixed polygon ,which was modify mode previously.
      }
      this.maskcanvas_status = status;
    },

    // Draw SVG  ------------------------------------------------------------------------
    arrangePolySVG: function() {
      this.setSelectedFlag(this.active_image_tag_polygons);
      this.initialzeNode();
      this.initialzeSVG();
      let filtered_polygons = this.convertCoordinateForCanvas(
        this.active_image_tag_polygons
      );

      if (this.selectMode === true) {
        filtered_polygons = this.fileterSelectedPolys(filtered_polygons);
      }

      filtered_polygons = filtered_polygons.map(
        function(poly, id) {
          return this.setPolySvgStatus(poly, id);
        }.bind(this)
      );

      filtered_polygons.forEach(
        function(poly, id) {
          if (!poly.status) {
            return false;
          }

          if (poly.status === "fixed") {
            this.drawFixedPoly(poly, id);
          } else if (poly.status === "active") {
            this.drawActivePoly(poly, id);
            this.addLabelSvgToPoly(poly, id);
          } else if (poly.status === "new") {
            this.drawActivePoly(poly, id);
          }
        }.bind(this)
      );

      this.checkMaskCanvasStatus(filtered_polygons);
    },

    drawWipCloser: function(e) {
      var svg = this.d3Wrapper.svg;

      if (this.maskcanvas_status !== "wip") {
        svg.select("#wipCloser").remove();
      } else {
        const wipCloser = svg
          .append("circle")
          .attr("r", 7)
          .attr("id", "wipCloser")
          .attr("z-index", 50)
          .attr("fill", "#006ea1")
          .attr("fill-opacity", 0.3)
          .attr("stroke", "#006ea1")
          .attr("stroke-width", "4px")
          .on("mouseover", function(d, i) {
            d3.select(this).attr("r", 10);
          })
          .on("mouseout", function(d, i) {
            d3.select(this).attr("r", 7);
          })
          .on("mousedown.left", this.onClickWipCloser);

        wipCloser
          .attr("cx", e.clientX - this.node.left)
          .attr("cy", e.clientY - this.node.top);
      }
    },
    drawWipSVG: function(points) {
      var svg = this.d3Wrapper.svg;

      svg.selectAll(".wip-points").remove();
      svg.selectAll(".wip-line").remove();

      svg
        .append("path")
        .datum(points)
        .classed("wip-line", true)
        .attr("fill", "none")
        .attr("stroke", "#999999")
        .attr("stroke-width", 1)
        .attr(
          "d",
          d3
            .line()
            .x(function(d) {
              return d.x;
            })
            .y(function(d) {
              return d.y;
            })
        );

      svg
        .selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .classed("wip-points", true)
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        })
        .attr("r", 2.5)
        .attr("stroke", "#006ea1")
        .attr("stroke-width", "2px")
        .attr("fill", "#999999");
    },
    addNewPoly: function() {
      // filter to make the coordinates based on Image
      let polygon = {};
      polygon.points = this.clientToPoly(this.points);

      // add new polygon and set the id
      this.setActivePolygonid({
        polygonid: this.active_image_tag_polygons.length
      });
      this.addNewPolygon({ polygon: polygon });
    },

    drawFixedPoly: function(poly, polyid) {
      if (!poly) {
        return false;
      }
      var svg = this.d3Wrapper.svg;
      var x = d3.scaleLinear();
      var y = d3.scaleLinear();

      svg
        .append("polygon")
        .data([poly])
        .attr("points", function(d) {
          return d.points
            .map(function(p) {
              return [x(p.x), y(p.y)].join(",");
            })
            .join(" ");
        })
        .attr("id", function(d) {
          return "fixedPoly" + `${polyid}`;
        })
        .on("mousedown.left.stop.prevent", this.onClickFixedPoly)
        .classed("fixed", poly.status === "fixed")
        .attr("stroke", "#ccc")
        .attr("stroke-width", "0.75px")
        .attr("fill", "#1d89bf")
        .attr("fill-opacity", "0.5");

      this.addLabelSvgToPoly(poly, polyid);
    },

    addLabelSvgToPoly: function(poly, polyid) {
      var svg = this.d3Wrapper.svg;
      let label_color = this.getLabelColor(polyid);
      let filtered_poly = this.setPolySvgStatus(poly, polyid);

      if (filtered_poly.status === "fixed") {
        svg
          .select("polygon[id = 'fixedPoly" + polyid + "'] ")
          .attr("fill", label_color)
          .attr("fill-opacity", "0.3");
      } else if (filtered_poly.status === "active") {
        // when modi-haslabel or modi-nolabel
        svg
          .select("path[id = 'activePoly" + polyid + "'] ")
          .attr("fill", label_color)
          .attr("fill-opacity", "0.3");
      }
    },
    drawActivePoly: function(poly, polyid) {
      // modify SVG
      if (!poly) {
        return;
      }
      var path, circle;
      var svg = this.d3Wrapper.svg;
      var dragP = d3
        .drag()
        .on("drag", dragPolyPoint)
        .on("end", this.getModifiedPointsFromNode);

      var poly_points = poly.points;

      // contain the points to the global variable
      this.points = poly_points;

      // points for path (connect the start and end)
      var path_points = poly_points.map(function(x) {
        return x;
      });

      // Deep copy first object.
      path_points.push(path_points[0]);

      function dragPolyPoint(dataSource) {
        var e = d3.event;
        var dx = e.dx;
        var dy = e.dy;
        if (Array.isArray(dataSource)) {
          dataSource.some(function(p, i) {
            if (i > 0) {
              p.x += dx;
              p.y += dy;
            }
          });
        } else {
          dataSource.x += dx;
          dataSource.y += dy;
        }
        redrawPoint();
        redrawPath();
      }

      function redrawPoint() {
        circle = svg.selectAll("circle").data(poly_points);
        circle
          .attr("cx", function(d) {
            return d.x;
          })
          .attr("cy", function(d) {
            return d.y;
          });
      }

      var lineFunction = d3
        .line()
        .x(function(d) {
          return d.x;
        })
        .y(function(d) {
          return d.y;
        });

      function redrawPath() {
        path.attr("d", lineFunction(path_points));
      }

      // remove fixed polygon
      this.cleanSelectedFixedPolySVG(polyid);

      //  TODO muraishi: 1. drag an active polygon. maybe do this in this.onClickActivePoly()
      if (!path) {
        var self = this;
        path = svg
          .append("path")
          .datum(path_points)
          .attr("stroke", "#999999")
          .attr("stroke-width", 1)
          .attr("id", function(d) {
            return "activePoly" + `${polyid}`;
          })
          .classed(`${poly.status}`, true)
          .classed("modi-polygon", true)
          .attr("d", lineFunction(path_points))
          .call(dragP);

        if (poly.status === "active") {
          let label_color = this.getLabelColor(polyid);
          path.attr("fill", label_color).attr("fill-opacity", "0.3");
        } else if (poly.status === "new") {
          path.attr("fill", "#1d89bf").attr("fill-opacity", "0.5");
        }
      }
      function circleMouseHover(d, i) {
        circle = svg
          .select("circle[id = 'circle" + i + "']")
          .transition()
          .ease("cubic-out")
          .duration("200")
          .attr("r", 5)
          .attr("fill// ", "springgreen");
      }
      function circleMouseOut(d, i) {
        d3
          .select(this)
          .transition()
          .ease("cubic-out")
          .duration("200")
          .attr("r", 5)
          .attr("fill", "#333");
      }
      if (!circle) {
        circle = svg.selectAll("circle").data(poly_points);

        circle
          .enter()
          .append("circle")
          .attr("r", 2.5)
          .classed("modi-points", true)
          .attr("cx", function(d) {
            return d.x;
          })
          .attr("cy", function(d) {
            return d.y;
          })
          .attr("stroke", "#006ea1")
          .attr("stroke-width", "2px")
          .attr("fill", "#999999")
          .attr("id", function(d, i) {
            return "circle" + `${i}`;
          })
          .attr("cursor", "pointer")
          .call(dragP)
          .on("mouseover", function(d, i) {
            d3
              .select(this)
              .attr("r", 5)
              .attr("stroke", "#006ea1")
              .attr("stroke-width", "2.5px")
              .attr("fill", "#006ea1")
              .attr("fill-opacity", 0.3);
          })
          .on("mouseout", function(d, i) {
            d3
              .select(this)
              .attr("r", 2.5)
              .attr("stroke", "#006ea1")
              .attr("stroke-width", "2px")
              .attr("fill", "#999999")
              .attr("fill-opacity", 1);
          });
      }
    },
    getModifiedPointsFromNode: function(dataSource) {
      var svg = this.d3Wrapper.svg;
      var selection = svg.selectAll(".modi-points")._groups[0];

      if (selection) {
        var modified_points = [];

        for (var item of selection) {
          var point = {
            x: null,
            y: null
          };

          point.x = item.cx.animVal.value;
          point.y = item.cy.animVal.value;

          modified_points.push(point);
        }
        this.points = modified_points;
        this.updateModifiedPoly(this.active_polygonid);
      }
    },
    updateModifiedPoly: function(polyid) {
      var filtered_polygon = this.convertCoordinateForCanvas([
        this.active_image_tag_polygons[polyid]
      ])[0];
      delete filtered_polygon.points;
      var polygon = filtered_polygon;

      // filter to make the coordinates based on Image
      polygon.points = this.clientToPoly(this.points);
      this.updateTagPolygon({ polyid: polyid, polygon: polygon });
    },

    // onClick SVG events  ----------------------------------------------------------------
    onClickSegMask: function(event) {
      const [, rc] = this.$parent.calcImageRect();
      if (!utils.ptInRect(rc, event.clientX, event.clientY)) {
        this.onClickActivePoly();
        return false;
      }

      // prevent "wip" when modify mode
      if (
        this.maskcanvas_status === "modi-nolabel" ||
        this.maskcanvas_status === "modi-haslabel"
      ) {
        if (
          event.target.id.includes("mask-canvas") &&
          this.maskcanvas_status === "modi-haslabel"
        ) {
          this.onClickActivePoly();
        }
        return false;
      } else if (
        event.target.tagName === "polygon" ||
        event.target.tagName === "path"
      ) {
        // prevent "wip" if polygons are clicked
        return false;
      }

      // start "wip" drawing
      if (this.maskcanvas_status === "fixed" && this.points.length === 0) {
        this.maskcanvas_status = "wip";
        // let svg = this.d3Wrapper.svg;
        this.drawWipCloser(event);
      }

      // during "wip"
      if (this.maskcanvas_status === "wip" && event.target.id != "wipCloser") {
        this.getNewPointsFromNode(event);
        this.drawWipSVG(this.points);
      }
    },

    getNewPointsFromNode: function(event) {
      var point = {
        x: null,
        y: null
      };

      point.x = event.clientX - this.node.left;
      point.y = event.clientY - this.node.top;

      this.points.push(point);
    },
    onClickWipCloser: function() {
      // submit the new polygon info to state
      if (this.points.length < 3) {
        return false;
      }
      this.addNewPoly();
      this.cleanWipSVG();
    },
    onClickActivePoly: function() {
      if (
        d3.event &&
        d3.event.target.className &&
        !d3.event.target.className.baseVal.includes("active")
      ) {
        return false;
      }
      this.setActivePolygonid({ polygonid: null });
      this.arrangePolySVG();
    },
    onClickFixedPoly: function(points) {
      // if (this.maskcanvas_status !== "fixed") {
      //  return false;
      // }
      const clicked_polyid = this.onClickGetPolyId();

      // if the polygon doesn't exist in state, erase it from svg
      if (!this.active_image_tag_polygons[clicked_polyid]) {
        this.deleteSelectedPoly(clicked_polyid);
        this.setActivePolygonid({ polygonid: null });
        return;
      }

      if (clicked_polyid !== this.active_polygonid) {
        this.setActivePolygonid({ polygonid: clicked_polyid });
      }

      this.$nextTick(() => {
        this.arrangePolySVG();
      });
    },

    onClickGetPolyId: function() {
      let polyid;
      if (
        d3.event.target.tagName === "polygon" ||
        d3.event.target.tagName === "path"
      ) {
        let svgid = d3.event.target.id;
        polyid = Number(svgid.match(/\d+/)[0]);
      }
      return polyid;
    },

    getLabelColor: function(polyid) {
      if (!this.active_image_tag_polygons[polyid]) {
        return;
      }
      let label_name = this.active_image_tag_polygons[polyid].label;
      let label_color = utils.getLabelColor(
        this.labels,
        this.labels_color,
        label_name
      ); // getLabelColor(String or Number)

      return label_color;
    },

    // Clean SVG  ----------------------------------------------------------------
    cleanWipSVG: function() {
      var svg = this.d3Wrapper.svg;

      // remove SVG
      svg.selectAll(".wip-points").remove();
      svg.selectAll(".wip-line").remove();

      // reset the global points' variable
      this.maskcanvas_status = "fixed";
      this.points = [];

      // remove wipCloser
      this.drawWipCloser(event);
    },
    cleanActivePolySVG: function() {
      var svg = this.d3Wrapper.svg;
      svg.selectAll(".modi-polygon").remove();
      svg.selectAll(".modi-points").remove();
    },
    cleanAllFixedPolySVG: function() {
      var svg = this.d3Wrapper.svg;
      svg.selectAll("polygon").remove();
    },
    cleanSelectedFixedPolySVG: function(polyid) {
      var svg = this.d3Wrapper.svg;
      var selection = svg.select("polygon[id = 'fixedPoly" + polyid + "'] ");
      if (selection) {
        selection.remove();
      }
    },
    deleteSelectedPoly: function(polyid) {
      // 1. clean svg
      // svg.select("polygon[id = '"+ polyid +"'] ").remove();
      this.cleanActivePolySVG();

      // 2. clean state (active_image_tag_polygons and active_polygonid)
      this.setActivePolygonid({ polygonid: null });
      this.removeTagPolygon({ polygonid: polyid });

      // 3. clean this. variables
      this.maskcanvas_status = "fixed";
      this.points = [];

      // if status === modi-nolabel
      var svg = this.d3Wrapper.svg;
      const wipCloser = svg.select("#wipCloser").select("#visible");
      if (wipCloser !== undefined && wipCloser !== null) {
        this.drawWipCloser(event);
      }
    },

    // Key events -------------------------------------------------------------------
    onKeyup: function(event) {
      if (event.target.nodeName === "BODY") {
        if (this.$parent.hasImage) {
          if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault();
            event.stopPropagation();

            if (
              (this.active_polygonid !== null &&
                this.maskcanvas_status === "modi-haslabel") ||
              this.maskcanvas_status === "modi-nolabel"
            ) {
              this.deleteSelectedPoly(this.active_polygonid);
              return;
            } else if (this.maskcanvas_status === "wip") {
              if (this.points.length === 0) {
                this.maskcanvas_status = "fixed";
                this.cleanWipSVG();
              } else {
                this.points.pop();
                this.drawWipSVG(this.points);
              }
              return;
            }
          }

          if (event.ctrlKey) {
            switch (event.key) {
              case "d":
                this.$parent.toShowSelectedBoxes();
                break;
              // TODO muraishi: 3. add the copy / pase oparation
              //                4. paste the previous image's boxes
            }
          }
        }
      }
    },
    onKeydown: function(event) {
      if (event.target.nodeName === "BODY") {
        if (this.$parent.hasImage && this.active_polygonid !== null) {
          if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
          ) {
            // TODO muraishi: 2. move polygons by arrow keys (after 1. have been done)
          } else if (!event.ctrlKey) {
            for (let key in this.labels) {
              if (this.labels[key].shortcut == event.key) {
                this.setObservedEvent("set_label");
                this.setActivePolyLabel({
                  key: key,
                  label: this.labels[key].label
                });
                event.preventDefault();
                event.stopPropagation();
                return false;
              }
            }
          }
        }
      }
    },

    // Calculate coordinates  -------------------------------------------------------------------
    clientToPoly: function(points) {
      // convert the box cooridinates to image based
      let [ratio, imgrc] = this.$parent.calcImageRect();
      var new_x = 0;
      var new_y = 0;

      var filtered_points = points.map(
        function(p) {
          // "+ this.node" because it have been "-" in WIP points.
          // Since the value was calculated when we got "imgrc", we don't have to do it twice.
          var new_x = (p.x - imgrc[0] + this.node.left) / ratio;
          var new_y = (p.y - imgrc[1] + this.node.top) / ratio;

          return { x: new_x, y: new_y };
        }.bind(this)
      );

      return filtered_points;
    },

    PolyToClient: function(points) {
      // convert the box cooridinates to client based
      var [ratio, imgrc] = this.$parent.calcImageRect();
      var new_x = 0;
      var new_y = 0;
      var filtered_points = points.map(function(p) {
        var new_x = p.x * ratio + imgrc[0];
        var new_y = p.y * ratio + imgrc[1];
        return { x: new_x, y: new_y };
      });

      return filtered_points;
    },
    toCanvasRect: function(points) {
      // convert the box cooridinates to node based (do "- this.node")
      var temp_xy_array = points.map(function(point) {
        let x = point.x;
        let y = point.y;

        return [x, y];
      });
      var filtered_points = utils.clientToNode(
        this.$parent.$refs.canvas,
        temp_xy_array
      );

      filtered_points = filtered_points.map(function(point) {
        return { x: point[0], y: point[1] };
      });

      return filtered_points;
    },
    convertCoordinateForCanvas: function(polygons) {
      var filtered_polygons = polygons.map(
        function(poly, i) {
          let new_poly = {};

          if (poly.hasOwnProperty("points")) {
            let temp_points = poly.points.map(function(p) {
              return p;
            });

            let filtered_points = this.PolyToClient(temp_points);
            filtered_points = this.toCanvasRect(filtered_points);
            new_poly.points = filtered_points;
          }

          if (poly.hasOwnProperty("label")) {
            new_poly.label = poly.label;
          }

          if (poly.hasOwnProperty("label_id")) {
            new_poly.label_id = poly.label_id;
          }

          return new_poly;
        }.bind(this)
      );

      return filtered_polygons;
    }

    // Not using currently but maight use sometime
    // getPolyObjFromState: function(polyid) {
    //   let filtered_polygon = this.convertCoordinateForCanvas([this.active_image_tag_polygons[polyid]]);
    //   let points = filtered_polygon.points;
    //   let label = filtered_polygon.label;
    //
    //   return {points: points, label: label}
    // },
  }
};
</script>

<style lang='scss' scoped>
#seg-mask {
  flex-grow: 1;
  display: flex;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;

  #mask-canvas {
    height: 100%;
    width: 100%;
    display: block;
    position: relative;
    .point-style {
      position: absolute;
      height: 5px;
      width: 5px;
      background-color: #bbb;
      border-radius: 50%;
      display: inline-block;
    }
  }
}
</style>
