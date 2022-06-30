import LiElement from './li-element.vue';
import UlElement from './ul-element.vue';
import TextElement from './text-element.vue';
import DivElement from './div-element.vue';

export default {
  components: {
    UlElement,
    LiElement,
    TextElement,
    DivElement
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
      console.log(meta)
      let children = [];
      if(meta.children) {
        children = meta.children.map(child => this.createElement(c, child));
      }

      return c(meta.tag, {
        props: meta.props,
        attrs: {
          "data-id": meta.id,
        },
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
