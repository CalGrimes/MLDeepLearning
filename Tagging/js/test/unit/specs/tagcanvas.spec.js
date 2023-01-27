import Vue from 'vue'

import { shallow } from 'vue-test-utils'
import { setup_store } from './utils'
import TagCanvas from '@/components/tagcanvas'

function update_store() {
  return setup_store(s=>{
    s.state.active_image_filename = '1';
    s.state.active_image_width = 40;
    s.state.active_image_height = 50;
    s.state.active_image_tag_boxes = [{label:'lbl', left:20, top:30, right:25, bottom:35}]
  })
}

function set_image_rect(wrapper) {
  const canvas = wrapper.find('#canvas');
  const fn = jest.fn();
  fn.mockReturnValue({left:0, top:0, width:100, height:100});
  canvas.element.getBoundingClientRect = fn;
}

describe('tagcanvas.vue', () => {
  it('create new', () => {
    const {store, localVue} = update_store();
    const wrapper = shallow(TagCanvas, {store, localVue});
    set_image_rect(wrapper);

    const panel = wrapper.find('#canvaspanel');
    panel.trigger('mousedown.left', {clientX:30, clientY:50});
    expect(wrapper.vm.newbox_rect).toEqual([30, 50, 30, 50]);
  })

  it('finish create new', () => {
    const {store, localVue} = update_store();
    const wrapper = shallow(TagCanvas, {store, localVue});
    set_image_rect(wrapper);

    wrapper.setData({ status : 'new',  newbox_rect: [10, 10, 20, 20]});
    wrapper.vm.endDrag()
    expect(wrapper.vm.status).toEqual("");
    const rc = store.state.active_image_tag_boxes[1];
    expect([rc.left, rc.top, rc.right, rc.bottom]).toEqual([0, 5, 5, 10]);
  })


  it('on_mousemove', () => {
    const {store, localVue} = update_store()
    const wrapper = shallow(TagCanvas, {store, localVue})
    wrapper.setData({ status : 'new',  newbox_rect: [10, 10, 20, 20]});
    set_image_rect(wrapper);

    const panel = wrapper.find('#canvaspanel');
    panel.trigger('mousemove.left', {clientX:30, clientY:50});

    expect(wrapper.vm.newbox_rect).toEqual([10, 10, 30, 50]);
  })

  it('dragging on_mousemove', () => {
    const {store, localVue} = update_store()
    const wrapper = shallow(TagCanvas, {store, localVue})
    wrapper.setData({ status : 'dragging',  org_boxrc: [10, 10, 20, 30]});
    set_image_rect(wrapper);


    const panel = wrapper.find('#canvaspanel');
    panel.trigger('mousemove.left', {clientX:20, clientY:10});

    const rc = store.state.active_image_tag_boxes[0];
    expect([rc.left, rc.top, rc.right, rc.bottom]).toEqual([10, 10, 15, 20]);
  })


  it('resize on_mousemove', () => {
    function do_resize(status) {
      const {store, localVue} = update_store()
      const wrapper = shallow(TagCanvas, {store, localVue})
      wrapper.setData({ status,  org_boxrc: [10, 10, 20, 30]});
      set_image_rect(wrapper);

      const panel = wrapper.find('#canvaspanel');
      panel.trigger('mousemove.left', {clientX:20, clientY:10});

      return store.state.active_image_tag_boxes[0];
    }

    const ne = do_resize('ne')
    expect([ne.left, ne.top, ne.right, ne.bottom]).toEqual([0, 10, 15, 15]);

    const nw = do_resize('nw')
    expect([nw.left, nw.top, nw.right, nw.bottom]).toEqual([4.5, 10, 5, 15]);

    const s = do_resize('s')
    expect([s.left, s.top, s.right, s.bottom]).toEqual([0, 5, 5, 20]);
  })

  it('click on box', () => {
    const {store, localVue} = update_store()
    const wrapper = shallow(TagCanvas, {store, localVue})
    wrapper.vm.arrangeBoxes()

    return Vue.nextTick()
    .then(function () {
      const box = wrapper.find('[data-boxid="0"]');
      box.trigger('mousedown.left', {clientX:30, clientY:50});
      expect([wrapper.vm.dragfrom_x, wrapper.vm.dragfrom_y]).toEqual([30, 50]);
    })
  })

  it('mousemove on box', () => {
    const {store, localVue} = update_store()
    const wrapper = shallow(TagCanvas, {store, localVue})
    wrapper.vm.arrangeBoxes()

    return Vue.nextTick()
    .then(function () {
      const box = wrapper.find('[data-boxid="0"]');
      box.trigger('mousemove.left', {clientX:30, clientY:50});
      expect(box.element.style.cursor).toEqual("nwse-resize");
    })
  })

})
