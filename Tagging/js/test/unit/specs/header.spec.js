import { shallow } from 'vue-test-utils'
import { setup_store } from './utils'

import Header from '@/components/header'

describe('taggerpage.vue', () => {
  it('header menu', () => {
    const store = setup_store(s=>{s.state.main_menu_visible = false})
    const wrapper = shallow(Header, store)

    const i = wrapper.find('.hanburger-menu');
    i.trigger('click');
    expect(store.store.state.main_menu_visible).toBe(true)
  })
})
