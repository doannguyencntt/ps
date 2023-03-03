import store from '@/store'
import * as TYPE from '@/store/_constant'
import { PSClient } from 'plat-sdk'

const baseUrl = process.env.VUE_APP_PS_API_BASE_URL

export default {
  switchClientAction(data) {
    const token = store.getters[`ps/userModule/${TYPE.GET_TOKEN}`] || ''
    let psClient = new PSClient({
      baseUrl, token
    })
    let payload = {
      action: 'ACCESS_WORKSPACE',
      object_id: data.client_id,
      object_type: 'client',
      data: {
        app_profile: data.app_profile,
        module: data.module
      }
    }
    psClient.createActivity(payload)
  }
}
