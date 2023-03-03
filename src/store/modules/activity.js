import * as TYPE from '@/store/_constant'
import portalAxios from '@/services/portalAxios'

const state = {
  activities: [],
  activitiesLoading: false
}

const getters = {
  [TYPE.GET_ACTIVITIES_LIST] (state) {
    return state.activities
  },
  [TYPE.GET_ACTIVITIES_LOADING] (state) {
    return state.activitiesLoading
  }
}

const mutations = {
  [TYPE.GET_ACTIVITIES_LIST] (state, payload) {
    state.activities = payload
  },
  [TYPE.SET_ACTIVITIES_LOADING] (state, payload) {
    state.activitiesLoading = payload
  }
}

const actions = {
  [TYPE.GET_ACTIVITIES_LIST] ({ commit }, params) {
    try {
      commit(TYPE.SET_ACTIVITIES_LOADING, true)
      portalAxios.get(`v1/organizations/${params.id}/activities/?page=${params.page}&limit=${params.limit}&action=${params.action || ''}&key=${params.key || ''}`).then(res => {
        commit(TYPE.GET_ACTIVITIES_LIST, res.data)
        commit(TYPE.SET_ACTIVITIES_LOADING, false)
      })
    } catch (err) {
      commit(TYPE.SET_ACTIVITIES_LOADING, false)
      return err
    }
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
