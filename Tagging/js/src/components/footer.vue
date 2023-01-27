<template>
<footer>
  <div class="col-md-12 clear-padding">
    <div class="col-md-12 clear-padding footer-content">
        <div class="col-md-3 clear-padding">
          <div class="media-wrapper"> 
            <div class="content-margin-top">
              <p class="logo">
                <img :src="url">
              </p>
              <p class="version">
                ReNom TAG {{version}}
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-9 clear-padding">
          <!--none -->
        </div>
    </div>
  </div>
  <div class="col-md-12 copyright clear-padding">
    <div class="col-md-12 align-middle clear-padding">
      <div class="copyright-text">
        <small>&copy; 2019 GRID INC. ALL rights reserved.</small>
      </div>
    </div>
  </div>
</footer>
</template>

<script>
export default {
  data() {
    return {
      version: "ver. 1.3.3 beta",
      url: require("../assets/renomlogo.png")
    };
  }
};
</script>

<style lang="scss" scoped>
.clear-padding {
  padding-right: 0;
  padding-left: 0;
}
footer {
  display: block;
  height: $footer-height;
  padding: 0;
  margin: 0;
  background: $footer-color;
  z-index: 99999;
  .footer-content {
    padding-left: 3%;
    background: $footer-color;
    margin: 0;
    height: calc(#{$footer-height} - #{$footer-copyright-height});
  }
  .copyright {
    background: $footer-copyright-color;
    margin-top: 0;
    .copyright-text {
      line-height: $footer-copyright-height;
      height: $footer-copyright-height;
      padding-left: 3%;
    }
  }
}
.content-margin-top {
  padding-top: 15px;
  img {
    height: calc(32px * 0.7);
    width: calc(170px * 0.7);
  }
}

.content-margin-top p {
  margin: 0;
  display: inline-block;
  vertical-align: middle;
}
.version {
  padding-left: 20px;
}
</style>
