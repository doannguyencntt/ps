import axios from 'axios'
import LS from './_localStorage'
// import app from '../main'
// import router from '@/router'
import logout from '@/services/auth'
import _nav from '@/_nav'
import get from 'lodash/get'

const ROOT_API = process.env.VUE_APP_DC_API_BASE_URL

var count = 0
const dcAxios = axios.create({
  baseURL: ROOT_API,
  timeout: 600000
})
dcAxios.interceptors.request.use(
  function(config) {
    let apiToken = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).ps.userModule.userToken : LS.getCurrentAccessToken()
    config.headers['x-ps-client-id'] = _nav.clientId || ''

    if (apiToken) {
      config.headers.Authorization = 'Bearer ' + apiToken
    }
    const clientID = localStorage.getItem('auth') ? get(JSON.parse(localStorage.getItem('auth')), 'ps.userModule.current_client.id', '') : LS.getCurrentClientId()
    config.headers['x-ps-client-id'] = clientID || ''
    // app.$Progress.start()
    return config
  },
  function(error) {
    console.log('err')
    return Promise.reject(error)
  }
)

dcAxios.interceptors.response.use(
  function(response) {
    count--
    if (count === 0) {
      // app.$Progress.finish()
    }
    return response
  },
  function(error) {
    count--
    // app.$Progress.fail()
    if (error.response.status === 401) {
      logout()
      // router.push({ path: '/login' })
    }
    return Promise.reject(error)
  }
)

export default dcAxios
