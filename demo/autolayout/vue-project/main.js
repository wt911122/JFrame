import Vue from 'vue'
// import App from './App.vue'
import designZone from './app.js';

Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(designZone) },
}).$mount('#app')
