import AutoLayoutComponent from './auto-layout-component.vue'
import ViewContainer from './viewContainer.vue'
export default {
  components: {
    AutoLayoutComponent,
    ViewContainer
  },
  data() {
    return {
      elements: [],
    }
  },
  created() {
    window.addEventListener("message", (e) => {
      try {
        const d = JSON.parse(e.data);
        if(d.type === 'rerender') {
            console.log(d.elements)
            this.elements = d.elements;
        }
        }catch(err) {
            
        }
    }, false);
  },
  methods: {
    createElement(c, meta) {
      let children = [];
    //   let isContainer = false;
      if(meta.children) {
        // isContainer = (meta.children[0]?.tag && meta.children[0]?.tag !== 'AreaContainer');
        children = meta.children.map(child => this.createElement(c, child));
      }
      const style = meta.style || {}
      
      return c(meta.tag, {
        props: {
          ...meta.props,
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
