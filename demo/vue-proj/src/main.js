import Vue from 'vue'
// import App from './App.vue'
import designZone from './components/designer-zone.js';

Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(designZone) },
}).$mount('#app')
