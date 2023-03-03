// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/scss/style.scss'
import auth from '@/services/auth'
import Vuelidate from 'vuelidate'
import Toasted from 'vue-toasted'
import { registerGlobalToast, registerGlobalBuildRenewalNotification } from '@/shared/globalToast'
import store from '@/store'
import vueMoment from 'vue-moment'
import VueProgressBar from 'vue-progressbar'
import layout from '@/containers/DefaultContainer'
import psNav from '@/_nav'
import sdkModule from 'plat-rs-sdk'
import 'plat-rs-sdk/dist/reporting-sdk.css'
import mwModule from 'plat-mw-lib'
import 'plat-mw-lib/dist/mw-web.css'
import mwAxios from '@/services/mwAxios'
import importSDK from 'plat-import-lib'
import 'vue-select/src/scss/vue-select.scss'
import _localStorage from '@/services/_localStorage'
import get from 'lodash/get'
import pluralize from 'pluralize'

// Remove RW Module
// import rwModule from 'plat-rw-lib'
// import 'plat-rw-lib/dist/rw-web.css'
// import { mwFirebaseConfig, rwFirebaseConfig } from '@/services/firebaseSvc'
import { mwFirebaseConfig } from '@/services/firebaseSvc'
import { GET_TOKEN, UPDATE_TOKEN } from '@/store/_constant'

// Remove RW Module
// const RW_API_CONFIG = {
//   baseUrl: process.env.VUE_APP_RW_API_BASE_URL || ''
// }
const MW_API_CONFIG = {
  baseUrl: process.env.VUE_APP_MW_API_BASE_URL || ''
}
const PS_API_CONFIG = {
  baseUrl: process.env.VUE_APP_PS_API_BASE_URL || ''
}
const SDK_CONFIG = {
  API_KEY_EDITOR: process.env.VUE_APP_API_KEY_EDITOR || ''
}

const EventBus = new Vue()
Object.defineProperties(Vue.prototype, {
  $bus: {
    get: function() {
      return EventBus
    }
  }
})

// create retryOn401
const retryOn401 = () => {
  // refresh Token
  const data = {
    token: store.getters[`ps/userModule/${GET_TOKEN}`] || ''
  }
  return new Promise((resolve, reject) => {
    auth.refreshToken(data, {_retry: true}).then(response => {
      // update to store
      store.dispatch(`ps/userModule/${UPDATE_TOKEN}`, {token: response.token || ''})
      resolve(response.token || '')
    }).catch((err) => {
      store.dispatch(`ps/userModule/${UPDATE_TOKEN}`, {token: ''})
      reject(err)
    })
  })
}

Vue.prototype.$_nav = psNav.items || []
let nav = {
  ps: psNav
}
let customSidebar = {}
// Remove RW Module
// Vue.use(rwModule, { store, router, layout, nav, retryOn401, rwFirebaseConfig, RW_API_CONFIG, customSidebar, PS_API_CONFIG })
// Vue.prototype.$_moduleNav = {
//   rw: nav.rw
// }
// Vue.prototype.$_customSidebar = {
//   rw: customSidebar.rw
// }
// mw
Vue.use(mwModule, { store, router, layout, nav, retryOn401, mwFirebaseConfig, MW_API_CONFIG, customSidebar, PS_API_CONFIG })
// Vue.prototype.$_moduleNav.mw = nav.mw
// Vue.prototype.$_customSidebar.mw = customSidebar.mw
// Vue.prototype.$_moduleNav = {
//   mw: nav.mw
// }
Vue.prototype.$_customSidebar = {
  mw: customSidebar.mw
}

// sdk
Vue.use(sdkModule, { SDK_CONFIG })

Vue.prototype.$bus.$on('relogin', (path = '') => {
  auth.clearAuth()
  let currentPath = _localStorage.getItem('ps_current_path')
  if (!currentPath) {
    _localStorage.setItem('ps_current_path', path)
  }
  const route = { name: 'Login' }
  if (currentPath && currentPath !== '/login') {
    route.query = { path: currentPath }
  }
  return router.replace(route)
})
// get Token from store
const getToken = () => {
  let auth = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')) : {}
  return get(auth, 'ps.userModule.userToken') || localStorage.getItem('ps_access_token') || store.getters[`ps/userModule/${GET_TOKEN}`] || ''
}
store.subscribe((mutation) => {
  if (mutation.type === `ps/userModule/${UPDATE_TOKEN}`) {
    const token = getToken()
    // update token SDK
    console.warn('start retry in Portal')
    const dsManager = window.CBPO.dsManager()
    if (dsManager && dsManager.setRemoteAPIToken) {
      window.CBPO.dsManager().setRemoteAPIToken(token)
      console.warn('retry and setToken in SDK (Portal)')
    } else {
      console.log(`No method dsManager.setRemoteAPIToken`)
    }
  }
})

Vue.use(BootstrapVue)
Vue.use(Vuelidate)
Vue.use(Toasted)
Vue.config.productionTip = false
Vue.prototype.$auth = auth
Vue.use(vueMoment)
Vue.use(VueProgressBar, {
  color: '#0068d8',
  failedColor: '#dc3545',
  thickness: '3px',
  autoFinish: false,
  transition: {
    speed: '0.5s',
    opacity: '0.6s',
    termination: 300
  }
})

registerGlobalToast(Vue)
registerGlobalBuildRenewalNotification(Vue)

const endPointAPI = {
  postFile: `/v1/clients/:clientId`,
  validate: `/v1/clients/:clientId`,
  process: `/v1/clients/:clientId`,
  getListItems: `/v1/clients/:clientId`,
  linkSample: `/v1/clients/:clientId`,
  linkInvalid: `/v1/clients/:clientId`,
  linkAll: `/v1/clients/:clientId`,
  infoImport: `/v1/clients/:clientId`
}

Vue.use(importSDK, { store, router, psNav, endPointAPI })
importSDK.setAxios(mwAxios)
function storageChange(event) {
  if (event.key === 'logout' && localStorage.getItem('logout')) {
    Vue.prototype.$bus.$emit('relogin')
  }
}
window.addEventListener('storage', storageChange, false)

Vue.filter('pluralize', function (value, number) {
  return pluralize(value, number)
})

Vue.filter('formatNumber', function (number) {
  return new Intl.NumberFormat('en-US').format(number)
})

Vue.filter('formatPercentBase1', function (number) {
  return Math.round(number * 100)
})

/* eslint-disable no-new */
new Vue({
  beforeCreate: function() {
    window.Vue = Vue
    window.store = store
  },
  router,
  store,
  render: (h) => h(App),
  created() {
    // console.log('env', process.env)
  }
}).$mount('#app')
