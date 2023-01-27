<template>
  <div id="app" >
      <router-view/>
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style lang='scss'>
@font-face {
  font-family: $header-product-name-font-family;
  src: url("./fonts/OpenSans-Regular.ttf");
}
@font-face {
  font-family: $content-inner-header-font-family;
  src: url("./fonts/OpenSans-Light.ttf");
}
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #fff !important;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

#app {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
}
</style>
