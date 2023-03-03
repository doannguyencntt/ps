// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import get from 'lodash/get'
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
import pfModule from 'plat-pf-lib'
import 'plat-pf-lib/dist/pf-web.css'
import { GET_TOKEN, UPDATE_TOKEN, GET_CURRENT_CLIENT } from '@/store/_constant'
import importModule from 'plat-import-lib'
import pfAxios from '@/services/pfAxios'
import 'plat-import-lib/dist/import-lib-web.css'
import 'vue-select/src/scss/vue-select.scss'
import _localStorage from '@/services/_localStorage'

const DS_API_CONFIG = {
  baseUrl: process.env.VUE_APP_DS_API_BASE_URL || ''
}
const SDK_CONFIG = {
  API_KEY_EDITOR: process.env.VUE_APP_API_KEY_EDITOR || ''
}

const PF_API_CONFIG = {
  baseUrl: process.env.VUE_APP_PF_API_BASE_URL || ''
}

const PF_WEB_CONFIG = {
  VUE_APP_PF_USER_ID: process.env.VUE_APP_PF_USER_ID || '',
  VUE_APP_PF_CLIENT_ID: process.env.VUE_APP_PF_CLIENT_ID || '',
  VUE_APP_PF_API_DEV_ACCESS_TOKEN: process.env.VUE_APP_PF_API_DEV_ACCESS_TOKEN || ''
}

importModule.setAxios(pfAxios)

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
    token: getToken()
  }
  return new Promise((resolve, reject) => {
    auth.refreshToken(data, {_retry: true}).then(response => {
      // update to store
      store.dispatch(`ps/userModule/${UPDATE_TOKEN}`, {token: response.token || ''})
      // update token SDK
      const dsManager = window.CBPO.dsManager()
      console.warn('start retry in PF')
      if (dsManager.setRemoteAPIToken) {
        window.CBPO.dsManager().setRemoteAPIToken(response.token)
        console.warn('retry and setToken in SDK (PF)')
      } else {
        console.log(`No method dsManager.setRemoteAPIToken`)
      }
      resolve(response.token || '')
    }).catch((err) => {
      store.dispatch(`ps/userModule/${UPDATE_TOKEN}`, {token: ''})
      reject(err)
    })
  })
}

// get clientD from store
const getClientId = () => {
  return store.getters[`ps/userModule/${GET_CURRENT_CLIENT}`].id || ''
}

// get Token from store
const getToken = () => {
  let auth = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')) : {}
  return get(auth, 'ps.userModule.userToken') || localStorage.getItem('ps_access_token') || store.getters[`ps/userModule/${GET_TOKEN}`] || ''
}

// create Callback handler error code SDK
const handlerErrorCodeSdk = (errorCode) => {
  if (errorCode === 403 || errorCode === 401) {
    // refresh Token
    Vue.prototype.$bus.$emit('relogin', router.currentRoute.path)
  }
}

Vue.prototype.$_nav = psNav.items || []
let nav = {
  ps: psNav
}
let customSidebar = {}

// sdk
Vue.use(sdkModule, { DS_API_CONFIG, SDK_CONFIG, getToken, getClientId, handlerErrorCodeSdk })

Vue.use(pfModule, { store, router, layout, nav, retryOn401, customSidebar, PF_API_CONFIG, DS_API_CONFIG, PF_WEB_CONFIG })

// plat-import-lib
const endPointAPI = {
  process: `/v1/clients/:clientId`
}
Vue.use(importModule, { store, router, nav, endPointAPI, retryOn401 })

Vue.prototype.$_customSidebar = {
  pf: customSidebar.pf
}

Vue.prototype.$_moduleNav = {
  pf: nav.pf
}

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
  color: '#0056b2',
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

function storageChange(event) {
  if (event.key === 'logout' && localStorage.getItem('logout')) {
    Vue.prototype.$bus.$emit('relogin')
  }
}
window.addEventListener('storage', storageChange, false)

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
    console.log('env', process.env)
    // hide loading message
    // store.dispatch('ps/loadingModule/ENABLE_MESSAGE', true)
  }
}).$mount('#app')
