import Vue from 'vue'
import { createLocalVue } from 'vue-test-utils'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'

import {store_dict} from '@/store/store.js'


export function setup_store(f) {
  const localvue = createLocalVue()
  localvue.use(Vuex)
  const localstore = cloneDeep(store_dict)

  if (f) {
    f(localstore)
  }
  return {store:new Vuex.Store(localstore), localvue}
}


