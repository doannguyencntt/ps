import portalAxios from './portalAxios'
import { SAVE_AUTH_DATA } from '@/store/_constant'
import _localStorage from '@/services/_localStorage'
import store from '@/store'

const LOGIN_URL = '/v1/rest-auth/login/'
const LOGOUT_URL = '/v1/rest-auth/logout/'
const REFRESH_TOKEN_URL = '/v1/rest-auth/app/jwt-refresh/'
// enable loading message for PF app
// const app = process.env.VUE_APP_PS_BUILD_APP

function storeToken (data) {
  const authData = {
    userToken: data.token || '',
    user: {
      email: data.email.trim() || ''
    },
    clients: []
  }
  store.dispatch(`ps/userModule/${SAVE_AUTH_DATA}`, authData)
}

export default {
  login (params) {
    return new Promise((resolve, reject) => {
      portalAxios.post(LOGIN_URL, params).then((response) => {
        if (response && response.data) {
          const data = {...response.data, email: params.username}
          storeToken(data)
        }
        resolve(response.data)
      }).catch((error) => {
        reject(error.response.data)
      })
    })
  },
  loginWithAppOtpion (params) {
    return new Promise((resolve, reject) => {
      portalAxios.post('/v1/rest-auth/app/login/', params).then((response) => {
        if (response && response.data) {
          const data = {...response.data, email: params.email}
          storeToken(data)
          // ps_access_token
          _localStorage.setItem('ps_access_token', response.data.token || '')
          const dsManager = window.CBPO.dsManager()
          if (dsManager.setRemoteAPIToken) {
            window.CBPO.dsManager().setRemoteAPIToken(response.data.token)
          } else {
            console.log(`No method dsManager.setRemoteAPIToken`)
          }
          // enable loading message for PF app
          // if (app === 'precise_financial') store.dispatch(`ps/loadingModule/${ENABLE_MESSAGE}`, true)
        }
        resolve(response.data)
      }).catch((error) => {
        reject(error.response.data)
      })
    })
  },
  loginByGoogleAccount (params) {
    return new Promise((resolve, reject) => {
      const data = params
      storeToken(data)
      // ps_access_token
      _localStorage.setItem('ps_access_token', params.token || '')
      const dsManager = window.CBPO.dsManager()
      if (dsManager.setRemoteAPIToken) {
        window.CBPO.dsManager().setRemoteAPIToken(params.token)
      } else {
        console.log(`No method dsManager.setRemoteAPIToken`)
      }
      resolve(params)
    })
  },
  isLogined () {
    let logined = false
    let auth = window.localStorage.getItem('auth')
    if (auth) {
      const parsedAuth = JSON.parse(auth).ps
      if (parsedAuth && parsedAuth.userModule && parsedAuth.userModule.userToken) {
        logined = true
      }
    }
    return logined
  },
  getLoginData (param) {
    let result = ''
    let auth = window.localStorage.getItem('auth')
    if (auth) {
      const parsedAuth = JSON.parse(auth).ps
      const userModule = parsedAuth && parsedAuth.userModule ? parsedAuth.userModule : {}
      if (userModule.hasOwnProperty([param])) {
        result = userModule[param]
      }
    }
    return result
  },
  clearAuth: () => {
    // reset vuex (for vue-persistedState package)
    store.dispatch('ps/resetState')
    _localStorage.removeItem('auth')
    _localStorage.removeItem('ps_access_token')
    _localStorage.setItem('logout', 1)
  },
  logout: () => {
    return new Promise((resolve, reject) => {
      portalAxios.post(LOGOUT_URL).then((response) => {
        resolve(response.data)
      }).catch((error) => {
        reject(error)
      })
    })
  },
  refreshToken: (params, customConfig) => {
    return new Promise((resolve, reject) => {
      portalAxios.post(REFRESH_TOKEN_URL, params, customConfig).then((response) => {
        resolve(response.data)
      }).catch((error) => {
        reject(error.data)
      })
    })
  }
}
