import Vue from "vue";
import Vuex from "vuex";

import state from "./state.js";
import mutation from "./mutation.js";
import action from "./action.js";
import getters from "./getters.js";

Vue.use(Vuex);

export const store_dict = {
  state: state,
  actions: action,
  mutations: mutation,
  getters: getters
};

export const store = new Vuex.Store(store_dict);
