import {GET_CLIENTS_VIEW_OPTION, SAVE_CLIENTS_VIEW_OPTION} from '@/store/_constant'
import {getPreference, updatePreference} from '@/services/preferenceSvc'

// from local storage
const state = getPreference()

const mutations = {
  clientsViewOption(state, payload) {
    state.clientsViewOption = payload
  }
}

const actions = {
  [SAVE_CLIENTS_VIEW_OPTION](state, payload) {
    state.commit('clientsViewOption', payload)
    updatePreference({clientsViewOption: payload})
  }
}

const getters = {
  [GET_CLIENTS_VIEW_OPTION](state) {
    const {clientsViewOption} = state
    return clientsViewOption || 'ClientsListView'
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
