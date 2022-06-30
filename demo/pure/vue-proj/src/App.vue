<template>
  <div id="app">
    <img alt="Vue logo" :src="iconsrc">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
const icon = require('./assets/logo.png');
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  data() {
    console.log(icon)
    return {
      iconsrc: icon,
    }
  },
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
