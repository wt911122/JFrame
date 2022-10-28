import LiElement from './li-element.vue';
import UlElement from './ul-element.vue';
import TextElement from './text-element.vue';
import DivElement from './div-element.vue';
import BtnElement from './btn-element.vue';
import FlexContainer from './flex-container.vue';
import AreaContainer from './area-container.vue';

export default {
  components: {
    UlElement,
    LiElement,
    TextElement,
    DivElement,
    BtnElement,
    FlexContainer,
    AreaContainer
  },
  data() {
    return {
      elements: [],
    }
  },
  created() {
    window.addEventListener("message", (e) => {
      const d = JSON.parse(e.data);
      if(d.type === 'rerender') {
        console.log(d.elements)
        this.elements = d.elements;
      }
    }, false);
  },
  methods: {
    createElement(c, meta) {
      let children = [];
      let isContainer = false;
      if(meta.children) {
        isContainer = (meta.children[0]?.tag && meta.children[0]?.tag !== 'AreaContainer');
        children = meta.children.map(child => this.createElement(c, child));
      }
      const style = meta.style || {}
      
      return c(meta.tag, {
        props: {
          ...meta.props,
          isContainer,
        },
        attrs: {
          "data-id": meta.id,
        },
        style,
      }, children)
    }
  },
  render(c) {
    const children = this.elements.map(e => {
      return this.createElement(c, e);
    })
    return c('div', children);
  }
}
