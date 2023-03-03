import axios from 'axios'

const portalAxios = axios.create({
  baseURL: process.env.VUE_APP_PS_API_BASE_URL,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default portalAxios
