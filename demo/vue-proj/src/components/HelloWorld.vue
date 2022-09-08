<template>
  <div class="hello">
    <designZone></designZone>
  </div>
</template>

<script>
import designZone from './designer-zone.js';
export default {
  name: 'HelloWorld',
  components: {
    designZone,
  },
  props: {
    msg: String
  },
  data() {
    return {
      list: [],
    }
  },
  computed: {
    idx() {
      return this.list.length
    }
  },
  mounted() {
    // window.addEventListener('message', (e) => {
    //   console.log(e.data);
    //   const d = JSON.parse(e.data);
    //   console.log(d);
    //   const point = d.point;
    //   const elem = document.elementFromPoint(...point);
    //   console.log(elem.click);
    //   elem.click();
    // })
  },
  methods: {
    addText() {
      console.log('addText')
      this.list.push({
        text: Math.random().toString(36).slice(2, 7),
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
