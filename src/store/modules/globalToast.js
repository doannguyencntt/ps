import * as TYPE from '../_constant'

const state = {
  globalToast: [],
  errorNetworkToast: null
}

const actions = {
  [TYPE.SAVE_GLOBAL_TOAST_INFO] ({ commit }, payload) {
    commit(TYPE.SAVE_GLOBAL_TOAST_INFO, payload)
  },
  [TYPE.DISMISS_GLOBAL_TOAST_INFO] ({ commit }, payload) {
    commit(TYPE.DISMISS_GLOBAL_TOAST_INFO, payload)
  },
  [TYPE.SAVE_ERROR_NETWORK_TOAST_INFO] ({ commit }, payload) {
    commit(TYPE.SAVE_ERROR_NETWORK_TOAST_INFO, payload)
  },
  [TYPE.RESET_ERROR_NETWORK_TOAST_INFO] ({ commit }) {
    commit(TYPE.RESET_ERROR_NETWORK_TOAST_INFO)
  },
  [TYPE.HIDE_NETWORK_ERROR_IF_SHOWING] ({ commit, getters }) {
    if (getters[TYPE.GET_ERROR_NETWORK_TOAST_INFO]) {
      commit(TYPE.DISMISS_GLOBAL_TOAST_INFO, getters[TYPE.GET_ERROR_NETWORK_TOAST_INFO])
      getters[TYPE.GET_ERROR_NETWORK_TOAST_INFO].goAway()
      commit(TYPE.RESET_ERROR_NETWORK_TOAST_INFO)
    }
  }
}

const mutations = {
  [TYPE.SAVE_GLOBAL_TOAST_INFO] (state, payload) {
    if (!state.globalToast.includes(payload)) {
      state.globalToast.push(payload)
    }
  },
  [TYPE.DISMISS_GLOBAL_TOAST_INFO] (state, payload) {
    if (state.globalToast.includes(payload)) {
      state.globalToast = state.globalToast.filter(toast => toast !== payload)
    }
  },
  [TYPE.SAVE_ERROR_NETWORK_TOAST_INFO] (state, payload) {
    state.errorNetworkToast = payload
  },
  [TYPE.RESET_ERROR_NETWORK_TOAST_INFO] (state) {
    state.errorNetworkToast = null
  }
}

const getters = {
  [TYPE.GET_GLOBAL_TOAST_INFO]: (state) => {
    return state.globalToast
  },
  [TYPE.GET_ERROR_NETWORK_TOAST_INFO]: (state) => {
    return state.errorNetworkToast
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
