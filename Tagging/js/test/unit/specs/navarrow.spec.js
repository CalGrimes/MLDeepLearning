import { shallow } from 'vue-test-utils'
import { setup_store } from './utils'

import NavArrow from '@/components/navarrow'

function update_store(fn) {
  return setup_store(s=>{
    s.actions.loadCurrentImage = fn;
    s.state.filtered_imagelist = ['0', '1', '2'];
    s.state.active_image_filename = '1';
  })
}

describe('taggerpage.vue', () => {
  it('next', () => {
    const fn = jest.fn()
    const {store, localVue} = update_store(fn)

    const wrapper = shallow(NavArrow, {store, localVue, propsData: {dir:'forward'}})
    const i = wrapper.find('.navarrow');
    i.trigger('click');
    const [context, file] = fn.mock.calls[0]
    expect(file).toBe('2')
  })

  it('back', () => {
    const fn = jest.fn()
    const {store, localVue} = update_store(fn)

    const wrapper = shallow(NavArrow, {store, localVue, propsData: {dir:'back'}})
    const i = wrapper.find('.navarrow');
    i.trigger('click');
    const [context, file] = fn.mock.calls[0]
    expect(file).toBe('0')
  })

})
