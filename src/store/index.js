import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import psModules from './modules'
import { initState } from '@/shared/utils'
import * as cloneDeep from 'lodash/cloneDeep'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: psModules,
  plugins: [
    createPersistedState({
      key: 'auth',
      paths: ['ps.userModule'],
      storage: {
        getItem: key => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: key => localStorage.removeItem(key),
        reducer (val) {
          if (!val.userToken) {
            return cloneDeep(initState)
          }
          return val
        }
      }
    })
  ]
})

export default store
