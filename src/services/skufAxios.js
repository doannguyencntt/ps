import axios from 'axios'
import get from 'lodash/get'
import Vue from 'vue'
import { GET_GLOBAL_TOAST_INFO, SAVE_GLOBAL_TOAST_INFO } from '@/store/_constant'
import store from '@/store'

const ROOT_API = process.env.VUE_APP_SKUF_API_BASE_URL

const skufAxios = axios.create({
  baseURL: ROOT_API,
  timeout: 600000
})

skufAxios.interceptors.request.use(function (config) {
  let apiToken = JSON.parse(localStorage.getItem('auth')).ps.userModule.userToken
  if (apiToken) {
    config.headers.Authorization = 'Bearer ' + apiToken
  }

  // Replace clientId in url of importing sellers
  let clientId = JSON.parse(localStorage.getItem('auth')).ps.userModule.current_client.id
  if (clientId) {
    config.url = config.url.replace(':clientId', clientId)
  }

  return config
}, function (error) {
  return Promise.reject(error)
})

skufAxios.interceptors.response.use(function (response) {
  return response
}, function (error) {
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
      Vue.toasted.global.errorNetwork()
      store.dispatch(`ps/globalToast/${SAVE_GLOBAL_TOAST_INFO}`, globalToastForNetworkError)
    }
    return
  }
  return Promise.reject(error)
})

export default skufAxios
