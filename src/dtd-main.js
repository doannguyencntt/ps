// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueGtag from 'vue-gtag'
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
import dtdModule from 'plat-dtd-lib'
import 'plat-dtd-lib/dist/dtd-web.css'
import { GET_TOKEN, UPDATE_TOKEN, GET_CURRENT_CLIENT } from '@/store/_constant'
// import dtdAxios from '@/services/dtdAxios'
import 'vue-select/src/scss/vue-select.scss'
import _localStorage from '@/services/_localStorage'
import get from 'lodash/get'
import routes from '@/router/_routerConfig'

// let theme = 'dark-theme'
// require(`plat-coreui-themes/src/assets/scss/themes/${theme}.scss`)
// require(`plat-rs-sdk/dist/${theme}.css`)
// if (process.env.VUE_APP_PS_ENABLE_MODERN_CSS === 'true') {
//   require(`@/assets/scss/_modern.scss`)
// }
if (process.env.VUE_APP_PS_ENABLE_GOOGLE_ANALYTICS === 'true') {
  Vue.use(VueGtag, {
    config: {
      id: process.env.VUE_APP_PS_GOOGLE_ANALYTICS_TRACKING_ID
    },
    routes,
    onReady () {
      console.log('Vue Gtag is ready!')
    }
  })
}

const DS_API_CONFIG = {
  baseUrl: process.env.VUE_APP_DS_API_BASE_URL || ''
}
const SDK_CONFIG = {
  API_KEY_EDITOR: process.env.VUE_APP_API_KEY_EDITOR || ''
}
const DTD_API_CONFIG = {
  baseUrl: process.env.VUE_APP_DTD_API_BASE_URL || ''
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
    auth.refreshToken(data, { _retry: true }).then(response => {
      // update to store
      store.dispatch(`ps/userModule/${UPDATE_TOKEN}`, { token: response.token || '' })
      resolve(response.token || '')
    }).catch((err) => {
      store.dispatch(`ps/userModule/${UPDATE_TOKEN}`, { token: '' })
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
  if (errorCode === 401) {
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
Vue.use(sdkModule, {
  DS_API_CONFIG,
  SDK_CONFIG,
  getToken,
  getClientId,
  handlerErrorCodeSdk
  // themeClass: 'cbpo-sdk-dark-theme',
  // chartColor: {
  //   accentColor: '#fff',
  //   mainColor: '#323a46',
  //   hoverItemColor: '#808e9e',
  //   navigationActive: '#17a2b8',
  //   navigationInactive: '#cecece'
  // }
})

// dtd
Vue.use(dtdModule, { store, router, layout, nav, retryOn401, DTD_API_CONFIG, customSidebar })

Vue.prototype.$_moduleNav = {
  dtd: nav.dtd
}
Vue.prototype.$_customSidebar = {
  dtd: customSidebar.dtd
}

Vue.prototype.$bus.$on('relogin', (path = '') => {
  auth.clearAuth()
  let currentPath = _localStorage.getItem('ps_current_path')
  if (!currentPath) {
    _localStorage.setItem('ps_current_path', path)
  }
  let oldStyle = document.getElementById('custom_css_mt')
  if (oldStyle) {
    oldStyle.remove()
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
  color: '#4ca2fe',
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
    // console.log('env', process.env)
  }
}).$mount('#app')
