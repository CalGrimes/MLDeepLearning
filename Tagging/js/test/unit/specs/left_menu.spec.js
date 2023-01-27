import { shallow } from 'vue-test-utils'
import { setup_store } from './utils'

import LeftMenu from '@/components/leftmenu'

describe('taggerpage.vue', () => {
  it('left menu', () => {
    const store = setup_store(s=>{s.state.main_menu_visible = true})
    const wrapper = shallow(LeftMenu, store)

    const i = wrapper.find('#left-menu');
    i.trigger('click');
    expect(store.store.state.main_menu_visible).toBe(false)
  })
})
