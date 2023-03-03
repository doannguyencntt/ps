import * as TYPE from '../_constant'

const state = {
  config: {
    msg: 'Loading...',
    size: 'large'
  },
  loading: {
    circle: 0,
    progress: 0
  },
  progressBarVisible: false,
  timer: null,
  message: {
    enabled: false,
    default: 'Loading...',
    icon: '<span aria-hidden="true" class="thin-loading spinner-border spinner-border-sm"></span>',
    list: [],
    current: ''
  }
}

const actions = {
  [TYPE.SET_COUNT]({ commit }, payload) {
    commit(TYPE.SET_COUNT, payload)
  },
  [TYPE.SET_MESSAGE]({ commit }, payload) {
    commit(TYPE.SET_MESSAGE, payload)
  },
  [TYPE.ENABLE_MESSAGE]({ commit }, payload) {
    commit(TYPE.ENABLE_MESSAGE, payload)
  }
}

const mutations = {
  [TYPE.SET_COUNT](state, {type, loading = 'progress'}) {
    if (type === 'increment') {
      state.loading[loading]++
      state.progressBarVisible = true
    } else if (type === 'decrease') {
      state.loading[loading]--
      clearTimeout(state.timer)
      state.timer = setTimeout(() => {
        if (loading === 'progress') {
          state.progressBarVisible = state.loading[loading] !== 0
        }
      }, 500)
    }
  },
  [TYPE.SET_MESSAGE](state, { type, msg, url }) {
    if (!msg || !url) return
    if (type === 'increment') {
      // push message
      state.message.list.push({ msg, url })
    } else if (type === 'decrease') {
      // remove message
      const index = state.message.list.findIndex(item => item.url === url)
      if (index !== -1) state.message.list.splice(index, 1)
    }
    const listLength = state.message.list.length
    if (listLength) {
      state.message.current = `${state.message.icon} ${state.message.list[0].msg}`
    } else {
      state.message.current = ''
    }
  },
  [TYPE.ENABLE_MESSAGE](state, payload) {
    state.message.enabled = payload
  }
}

const getters = {
  [TYPE.GET_LOADING_DATA] (state) {
    return state.config
  },
  [TYPE.GET_CIRCLE] (state) {
    return state.loading.circle
  },
  [TYPE.GET_PROGRESS] (state) {
    return state.progressBarVisible
  },
  [TYPE.GET_MESSAGE] (state) {
    return state.message.current
  },
  [TYPE.GET_DEFAULT_MESSAGE] (state) {
    return state.message.default
  },
  [TYPE.HAVE_MESSAGE] (state) {
    return state.message.enabled
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
