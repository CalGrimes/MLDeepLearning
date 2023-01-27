import Vue from 'vue'

import { shallow } from 'vue-test-utils'
import { setup_store } from './utils'
import TaggedImages from '@/components/taggedimages'

function update_store() {
  return setup_store(s=>{
    s.state.tagged_images = [{
      filename:'lbl', width: 100, height:100, 
      boxes:[{left:10, right:20, top:10, bottom:20, label:'label'}]
    }]
  })
}

describe('taggedimages.vue', () => {
  it('render', () => {
    const {store, localVue} = update_store();
    const wrapper = shallow(TaggedImages, {store, localVue});

    const box = wrapper.find('.image-box');
    expect(wrapper.contains('.image-box')).toBe(true);
   
  })
})
