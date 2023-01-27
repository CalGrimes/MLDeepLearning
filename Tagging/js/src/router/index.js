import Vue from "vue";
import Router from "vue-router";
import TaggerPage from "@/components/taggerpage";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "TaggerPage",
      component: TaggerPage
    }
  ]
});
