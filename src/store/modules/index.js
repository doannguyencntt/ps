import loadingModule from './loading'
import userModule from './user'
import activities from './activity'
import globalToast from './globalToast'
import socialLogin from './socialLogin'
import billingModule from './billing'
import authModule from './auth'
import userPreferencesModule from '@/store/modules/userPreferences'
import * as cloneDeep from 'lodash/cloneDeep'
import * as forOwn from 'lodash/forOwn'

export const initialStoreModules = {
  loadingModule,
  userModule,
  activities,
  globalToast,
  socialLogin,
  billingModule,
  authModule,
  userPreferencesModule
}

export default {
  ps: {
    namespaced: true,
    modules: cloneDeep(initialStoreModules),
    actions: {
      resetState({commit}, payload) {
        commit('resetState')
      }
    },
    mutations: {
      // reset default state modules by looping around the initialStoreModules
      resetState(state) {
        forOwn(initialStoreModules, (value, key) => {
          state[key] = cloneDeep(value.state)
        })
      }
    }
  }
}
