import axios from 'axios'
import { GET_GLOBAL_TOAST_INFO, SAVE_GLOBAL_TOAST_INFO } from '@/store/_constant'
import store from '@/store'
import get from 'lodash/get'
import Vue from 'vue'

const API_BASE_URL = process.env.VUE_APP_MW_API_BASE_URL
const DUMMY_TOKEN = process.env.VUE_APP_MW_DEV_ACCESS_TOKEN
const MW_API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000
})

const setCount = (type, loadingType) => {
  const loading = loadingType || 'progress'
  store.dispatch(`ps/loadingModule/SET_COUNT`, {type, loading})
}

MW_API.interceptors.request.use(function (config) {
  const token = localStorage.getItem('ps_access_token') || DUMMY_TOKEN
  if (store && !get(config, 'ignoreLoading')) {
    setCount('increment', get(config, 'loading'))
  }
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  // Replace clientId in url of importing map
  let clientId = JSON.parse(localStorage.getItem('auth')).ps.userModule.current_client.id
  if (clientId) {
    config.url = config.url.replace(':clientId', clientId)
  }

  return config
}, function (error) {
  return Promise.reject(error)
})

MW_API.interceptors.response.use(function (response) {
  if (store && !get(response, 'config.ignoreLoading')) {
    setCount('decrease', get(response, 'config.loading'))
  }
  return response
}, function (error) {
  if (store && !get(error, 'config.ignoreLoading')) {
    setCount('decrease', get(error, 'config.loading'))
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
      Vue.toasted.global.errorNetwork()
      store.dispatch(`ps/globalToast/${SAVE_GLOBAL_TOAST_INFO}`, globalToastForNetworkError)
    }
    return
  }
  return Promise.reject(error)
})

export default MW_API
