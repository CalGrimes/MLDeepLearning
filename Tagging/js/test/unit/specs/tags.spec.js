import Vue from 'vue'

import { shallow } from 'vue-test-utils'
import { setup_store } from './utils'
import Tags from '@/components/tags'

import axios from 'axios'
jest.mock('axios');

function update_store() {
  return setup_store(s=>{
    s.state.labels = [{
      label: 'label1', shortcut: '1'
    }]
    s.actions.load_label_candidates_dict = (context, payload)=>{};
  })
}

describe('taggedimages.vue', () => {
  it('test shotcut key', () => {
    const {store, localVue} = update_store();

    const wrapper = shallow(Tags, {store, localVue});
    const event = {keyCode:64, preventDefault:jest.fn()}
    wrapper.vm.keydown(event)
    expect(event.preventDefault.mock.calls.length === 1).toBe(true)
  })

  it('test delete key', () => {
    const {store, localVue} = update_store();

    const wrapper = shallow(Tags, {store, localVue});
    const event = {keyCode:46, preventDefault:jest.fn()}
    wrapper.vm.keydown(event)
    expect(event.preventDefault.mock.calls.length === 1).toBe(true)
  })
})
