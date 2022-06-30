<template>
  <div class="hello">
    <!-- <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <h3>Installed CLI Plugins</h3>
    <ul>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a></li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a></li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>
    </ul> -->
    <!-- <div>
      <button @click="addText">
        新增 {{idx}}
      </button>
    </div> -->
    <designZone></designZone>
    <!-- <UlElement>
      <LiElement v-for="item in list" :key="item.text" :content="item.text" style="display: block">
      </LiElement>
    </UlElement> -->
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
