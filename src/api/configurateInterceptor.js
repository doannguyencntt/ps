// import auth from '@/services/auth'
import {
  SET_COUNT,
  GET_TOKEN,
  // UPDATE_TOKEN,
  SET_MESSAGE,
  GET_DEFAULT_MESSAGE,
  GET_GLOBAL_TOAST_INFO,
  SAVE_GLOBAL_TOAST_INFO,
  SAVE_ERROR_NETWORK_TOAST_INFO,
  MUTATION_SET_AUTH
} from '@/store/_constant'
import store from '@/store'
import Vue from 'vue'
import get from 'lodash/get'
import router from '@/router'

const setCount = (type, loadingType) => {
  const loading = loadingType || 'progress'
  store.dispatch(`ps/loadingModule/${SET_COUNT}`, {type, loading})
}

const setMessage = (type, msg = '', url = '') => {
  if (msg && url) {
    store.dispatch(`ps/loadingModule/${SET_MESSAGE}`, { type, msg, url })
  }
}

function configurateInterceptor(axios) {
  axios.interceptors.request.use(function (config) {
    const userToken = store.getters[`ps/userModule/${GET_TOKEN}`] || ''
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`
    }
    // set loading
    if (!get(config, 'params.ignoreLoading')) {
      setCount('increment', config.loading)
      // set message
      config.message = config.message || store.getters[`ps/loadingModule/${GET_DEFAULT_MESSAGE}`]
      setMessage('increment', config.message, config.url)
    }
    return config
  }, function (error) {
    // return Error object with Promise
    return Promise.reject(error)
  })

  axios.interceptors.response.use(function (response) {
    // check loading
    if (!get(response, 'config.params.ignoreLoading')) {
      setCount('decrease', get(response, 'config.loading'))
      // check message
      setMessage('decrease', get(response, 'config.message'), get(response, 'config.url'))
    }
    return response
  }, function (error) {
    // const originalRequest = error.config
    // check loading
    if (!get(error, 'config.params.ignoreLoading')) {
      setCount('decrease', get(error, 'config.loading'))
      // check message
      setMessage('decrease', get(error, 'config.message'), get(error, 'config.url'))
    }
    // call refresh token failed
    // if (get(error, 'config._retry')) {
    //   forceLogout()
    //   return Promise.reject(error)
    // }
    // 401 status and not retry
    if (get(error, 'response.status') === 401) {
      // new change - redirect to login page when 401
      store.commit(`ps/authModule/${MUTATION_SET_AUTH}`, false)
      forceLogout()
      return Promise.reject(error)
      // old - refresh token when 401
      // const data = {
      //   token: store.getters[`ps/userModule/${GET_TOKEN}`] || ''
      // }
      // return auth.refreshToken(data, {_retry: true}).then(response => {
      //   // update token
      //   store.dispatch(`ps/userModule/${UPDATE_TOKEN}`, {token: response.token || ''})
      //   // pass to headers
      //   originalRequest.headers['Authorization'] = `Bearer ${response.token || ''}`
      //   originalRequest._retry = true
      //   return axios(originalRequest)
      // })
    }
    // Server error
    if (get(error, 'response.status') >= 500 && !get(error, 'config.params.ignore500Error')) {
      const globalToastFor500Error = 'error500'
      let globalToastInfo = store.getters[`ps/globalToast/${GET_GLOBAL_TOAST_INFO}`] || []
      if (!globalToastInfo.includes(globalToastFor500Error)) {
        Vue.toasted.global.error500()
        store.dispatch(`ps/globalToast/${SAVE_GLOBAL_TOAST_INFO}`, globalToastFor500Error)
      }
      return
    }
    // Network error
    if (get(error, 'message') === 'Network Error') {
      const globalToastForNetworkError = 'errorNetwork'
      let globalToastInfo = store.getters[`ps/globalToast/${GET_GLOBAL_TOAST_INFO}`] || []
      if (!globalToastInfo.includes(globalToastForNetworkError)) {
        store.dispatch(`ps/globalToast/${SAVE_GLOBAL_TOAST_INFO}`, globalToastForNetworkError)
        store.dispatch(`ps/globalToast/${SAVE_ERROR_NETWORK_TOAST_INFO}`, Vue.toasted.global.errorNetwork())
      }
      return
    }
    return Promise.reject(error)
  })
}

function forceLogout () {
  Vue.prototype.$bus.$emit('relogin', router.currentRoute.path)
}

export default configurateInterceptor
