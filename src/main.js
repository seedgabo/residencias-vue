// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
window._ = require('lodash');
window.trans = (string) => _.get(window.i18n, string);
window.jQuery = window.$ = require('jquery')
import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'
import Vue2Filters from 'vue2-filters'
import VueQuillEditor from 'vue-quill-editor'

require('vue2-animate/dist/vue2-animate.min.css')

Vue.use(Vuetify)
Vue.use(Vue2Filters)

const moment = require('moment')
require('moment/locale/es')
moment.locale('es')
Vue.use(require('vue-moment'), {
  moment
})
Vue.use(VueQuillEditor)

import 'fullcalendar'
import '../node_modules/fullcalendar/dist/locale-all.js'
Vue.use(require('vue-full-calendar'))

import Chartkick from 'chartkick'
Chartkick.configure({
  language: "es"
})
import VueChartkick from 'vue-chartkick'
import Chart from 'chart.js'
// window.Highcharts = require('highcharts')
Vue.use(VueChartkick, {
  Chartkick
})


Vue.config.productionTip = false

var api = require('./services/api.js');
api.ready = new Promise(
  (resolve, reject) => {
    var user = window.localStorage.getItem('user');
    if (user) {
      api.user = JSON.parse(user);
      var residence = window.localStorage.getItem('residence');
      if (residence) {
        api.residence = JSON.parse(residence);
      }
      var i18n = window.localStorage.getItem('i18n');
      if (i18n) {
        api.i18n = JSON.parse(i18n);
      }
      return resolve(api.user);
    } else {
      return reject();
    }
  }
)

router.beforeEach((to, from, next) => {
  document.title = (to.name) + " | Residencias Online"
  next()
})


/* eslint-disable no-new */

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App
  }
})
