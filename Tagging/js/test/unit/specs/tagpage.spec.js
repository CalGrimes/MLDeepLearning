import { shallow } from 'vue-test-utils'
import Page from '@/components/taggerpage'
import { setup_store } from './utils'


describe('taggerpage.vue', () => {
  it('show image canvas', () => {

    const store = setup_store(s=>{
      s.actions.loadUserList = (context)=>null;
      s.state.active_image_filename = 'test';
    })
    const wrapper = shallow(Page, store)
    expect(wrapper.contains('.filler')).toBe(false)

    const store2 = setup_store(s=>{
      s.actions.loadUserList = (context)=>null;
      s.state.active_image_filename = null
    })
    const wrapper2 = shallow(Page, store2)
    expect(wrapper2.contains('.filler')).toBe(true)
  })
})
