import { GET_AUTH, MUTATION_SET_AUTH } from '@/store/_constant'

const state = {
  isAuth: false
}

const actions = {
}

const getters = {
  [GET_AUTH]({ isAuth }) {
    return isAuth
  }
}

const mutations = {
  [MUTATION_SET_AUTH](state, payload) {
    state.isAuth = payload
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
