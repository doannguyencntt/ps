import * as TYPE from '../_constant'
import userApi from '@/services/user'
import get from 'lodash/get'

const state = {
  googleLoginInfo: {}
}

const actions = {
  async [TYPE.CHECK_ASSOCIATION_ACCOUNT] ({ commit }, payload) {
    try {
      const response = await userApi.associateAccount(payload)
      if (response && response.status === 200) {
        commit(TYPE.RESET_GOOGLE_LOGIN_INFO)
        commit(TYPE.CHECK_PASSWORD_ASSOCIATE, response.data)
      }
      return response
    } catch (err) {
      if (err.response.status === 400) {
        return err.response
      }
      return err
    }
  },
  async [TYPE.ASSOCIATE_ACCOUNT] ({ commit }, payload) {
    try {
      const response = await userApi.associateAccount(payload)
      if (response && response.status === 200) {
        commit(TYPE.RESET_GOOGLE_LOGIN_INFO)
        commit(TYPE.CHECK_PASSWORD_ASSOCIATE, response.data)
      }
      return response
    } catch (err) {
      return get(err, 'response.data.statusCode', 500)
    }
  }
}

const mutations = {
  [TYPE.CHECK_PASSWORD_ASSOCIATE] (state, payload) {
    state.googleLoginInfo = payload
  },
  [TYPE.RESET_GOOGLE_LOGIN_INFO] (state, payload) {
    state.googleLoginInfo = {}
  }
}

const getters = {
  [TYPE.GOOGLE_LOGIN_INFO]: (state) => {
    return state.googleLoginInfo
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
