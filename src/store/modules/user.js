import * as TYPE from '@/store/_constant'
import clientApi from '@/services/client'
import { getOrgsAndClientsApi } from '@/services/organization'
import orderBy from 'lodash/orderBy'
import findIndex from 'lodash/findIndex'
import Vue from 'vue'
import { initState, isBillingEnabled } from '@/shared/utils'
import router from '@/router'
import _localStorage from '@/services/_localStorage'
import get from 'lodash/get'

const state = JSON.parse(JSON.stringify(initState))

const actions = {
  [TYPE.SAVE_AUTH_DATA] ({ commit }, payload) {
    commit(TYPE.UPDATE_AUTH_DATA, payload)
  },
  [TYPE.EDIT_CLIENTS_DATA] ({ commit }, payload) {
    commit(TYPE.UPDATE_CLIENTS_DATA, payload)
  },
  [TYPE.ADD_NEW_CLIENT] ({ commit }, payload) {
    commit(TYPE.SAVE_NEW_CLIENT, payload)
  },
  [TYPE.ADD_NEW_AVATAR_URL] ({ commit }, payload) {
    commit(TYPE.SAVE_NEW_AVATAR_URL, payload)
  },
  [TYPE.EDIT_USER_ID] ({ commit }, payload) {
    commit(TYPE.UPDATE_USER_ID, payload)
  },
  [TYPE.EDIT_USER_INFO] ({ commit }, payload) {
    commit(TYPE.UPDATE_USER_ID, payload.user_id)
    commit(TYPE.UPDATE_CAN_CREATE_CLIENT_FLAG, payload.can_create_client)
  },
  [TYPE.EDIT_CURRENT_CLIENT_MODULES] ({ commit }, payload) {
    commit(TYPE.UPDATE_CURRENT_CLIENT_MODULES, payload)
  },
  [TYPE.SAVE_USER_ROLE] ({ commit }, payload) {
    commit(TYPE.SAVE_USER_ROLE, payload)
  },
  [TYPE.EDIT_SPECIFIC_CLIENT] ({ commit }, payload) {
    commit(TYPE.UPDATE_SPECIFIC_CLIENT, payload)
  },
  [TYPE.EDIT_CURRENT_CHANNEL] ({ commit }, payload) {
    commit(TYPE.UPDATE_CURRENT_CHANNEL, payload)
  },
  [TYPE.RESET_CLIENT] ({ commit }, payload) {
    commit(TYPE.RESET_CLIENT, payload)
  },
  [TYPE.ORDER_CLIENTS] ({ commit }, payload) {
    commit(TYPE.ORDER_CLIENTS, payload)
  },
  [TYPE.SWITCH_CLIENT] ({ commit }, payload) {
    // order clients
    if (payload.clientID) {
      if (payload.type !== 'inital') commit(TYPE.ORDER_CLIENTS, payload.clientID)
      // update client_id to modules
      Vue.prototype.$bus.$emit('ps_set_current_client_id', payload.clientID)
      if (payload.userID) {
        return new Promise((resolve, reject) => {
          clientApi.getUserRoleByClient(payload.clientID, payload.userID)
            .then((response) => {
              let roleData = {
                currentEditClientId: payload.clientID,
                role: response && response.role ? response.role.key : ''
              }
              // update role for current client
              commit(TYPE.SAVE_USER_ROLE, roleData)
              // update modules for current client
              const modules = response.client_modules && response.client_modules.length ? response.client_modules : []
              const name = response.client_information && response.client_information.name ? response.client_information.name : ''
              commit(TYPE.UPDATE_CURRENT_CLIENT_MODULES, {clientId: payload.clientID, modules, name})
              // update channel for current client
              commit(TYPE.UPDATE_CURRENT_CHANNEL, { [payload.clientID]: '' })
              resolve(response)
            })
            .catch((err) => {
              commit(TYPE.SAVE_USER_ROLE, { currentEditClientId: payload.clientID, role: '' })
              commit(TYPE.UPDATE_CURRENT_CLIENT_MODULES, {clientId: payload.clientID, modules: [], name: ''})
              commit(TYPE.UPDATE_CURRENT_CHANNEL, { [payload.clientID]: '' })
              reject(err)
            })
        })
      }
    }
    return false
  },
  [TYPE.SAVE_CURRENT_ORG] ({ commit }, payload) {
    commit(TYPE.SAVE_CURRENT_ORG, payload)
  },
  async [TYPE.SAVE_ORGS_LIST] ({ commit, state }, payload) {
    let enablePickFirstClient = get(payload, 'enableAutoPickClient', 'true')
    let haveClient = false
    if (payload.orgs && payload.orgs.length) {
      let orgIndex = null
      let orgData = null
      payload.orgs.forEach((org, index) => {
        let clientIndex = null
        let clientData = null
        // find current org
        if (state.org.current.id && org.organization.id === state.org.current.id) {
          orgIndex = index
          orgData = Object.assign({}, org)
          // update role of current org
          state.org.current.role = org.organization.role && org.organization.role.key ? org.organization.role.key : ''
          // find current client
          org.clients.some((client, key) => {
            if (state.current_client.id && client.id === state.current_client.id) {
              haveClient = true
              clientData = Object.assign({}, client)
              clientIndex = key
              // update role of current client
              commit(TYPE.SAVE_USER_ROLE, {role: client.role.key || '', currentEditClientId: client.id})
              // update modules of current client
              commit(TYPE.UPDATE_CURRENT_CLIENT_MODULES, {clientId: client.id, modules: client.modules, name: client.name})
              // update current channel of current client
              const currentChannel = state.ps_current_channel[client.id]
              // Remove RW Module
              // const activedModules = client.modules.filter(item => item.enabled).map(item => item.module)
              const activedModules = client.modules.filter(item => item.enabled && item.module !== 'ROG').map(item => item.module)
              if (!currentChannel || (currentChannel && !activedModules.includes(currentChannel))) {
                commit(TYPE.UPDATE_CURRENT_CHANNEL, {[client.id]: activedModules[0]})
              }
              return true
            }
          })
        }
        // order clients in org
        if (clientData) org.clients.splice(clientIndex, 1)
        org.clients = orderBy(org.clients, [client => client.name.toLowerCase()], ['asc'])
        if (clientData) {
          org.clients.unshift(clientData)
          orgData = Object.assign({}, org)
        }
      })
      // order orgs
      if (orgData) payload.orgs.splice(orgIndex, 1)
      payload.orgs = orderBy(payload.orgs, [org => org.organization.name.toLowerCase()], ['asc'])
      if (orgData) payload.orgs.unshift(orgData)
    }
    commit(TYPE.SAVE_ORGS_LIST, payload)
    if (!state.org.list.length) {
      // user is deleted from all orgs
      commit(TYPE.RESET_ORG)
      commit(TYPE.RESET_CLIENT)
      if (state.user.user_id) {
        router.push({name: 'ps-dashboard'})
      }
    } else {
      // switch to another client when client is deleted
      if ((!state.current_client.id && state.user.user_id) || (!haveClient && state.current_client.id)) {
        const firstOrg = state.org.list && state.org.list[0] ? state.org.list[0] : {}
        const clientID = firstOrg.clients && firstOrg.clients[0] && firstOrg.clients[0].id && enablePickFirstClient === 'true' ? firstOrg.clients[0].id : ''
        const routeName = router.app._route.name
        const disabledDirectRouteNames = [
          'ps-BillingSubscription',
          'ps-BillingDashboard',
          'ps-BillingPlans',
          'ps-BillingHistory',
          'ps-BillingAddFunds',
          'ps-BillingCardManagement',
          'ps-OrgUsers',
          'ps-OrgClients'
        ]
        if (
          clientID &&
          // for billing module
          (!isBillingEnabled() || !disabledDirectRouteNames.includes(routeName))
        ) {
          await window.store.dispatch(`ps/userModule/${TYPE.SWITCH_CLIENT}`, {clientID, userID: state.user.user_id, type: 'inital'})
          router.push({name: 'ps-dashboard', params: {client_id: clientID}})
        } else {
          // still using for billing module but sometimes clientID is not work and execute this logic
          commit(TYPE.RESET_CLIENT)
          !disabledDirectRouteNames.includes(routeName) && router.push({name: 'ps-dashboard'})
        }
        if (firstOrg && firstOrg.organization) commit(TYPE.SAVE_CURRENT_ORG, {id: firstOrg.organization.id, role: firstOrg.organization.role.key})
      }
    }
  },
  [TYPE.ADD_ORG] ({ commit }, payload) {
    commit(TYPE.ADD_ORG, payload)
    commit(TYPE.ORDER_ORGS, payload)
  },
  [TYPE.UPDATE_ORG] ({ commit }, payload) {
    commit(TYPE.UPDATE_ORG, payload)
    commit(TYPE.ORDER_ORGS, payload)
  },
  [TYPE.UPDATE_CLIENT_ORG] ({ commit }, payload) {
    commit(TYPE.UPDATE_CLIENT_ORG, payload)
  },
  [TYPE.ADD_CLIENT_ORG] ({ commit }, payload) {
    commit(TYPE.ADD_CLIENT_ORG, payload)
    commit(TYPE.ORDER_CLIENTS_ORG, payload)
  },
  [TYPE.SAVE_ORG_PARAM] ({ commit }, payload) {
    commit(TYPE.SAVE_ORG_PARAM, payload)
  },
  [TYPE.UPDATE_TOKEN] ({ commit }, payload) {
    commit(TYPE.UPDATE_TOKEN, payload)
  },
  [TYPE.EDIT_CLIENT_MODULES] ({ commit }, payload) {
    commit(TYPE.EDIT_CLIENT_MODULES, payload)
  },
  async [TYPE.FETCH_ROLE_IN_WORKSPACE] ({ commit }, {clientId, userId}) {
    try {
      const response = await clientApi.getUserRoleByClient(clientId, userId)
      const roleData = {
        currentEditClientId: clientId,
        role: get(response, 'role.key', '')
      }
      commit(TYPE.SAVE_USER_ROLE, roleData)
    } catch (err) {
      console.log('get role', err)
      commit(TYPE.SAVE_USER_ROLE, {
        currentEditClientId: clientId,
        role: ''
      })
    }
  },
  async [TYPE.SET_LIST_WORKSPACE] ({commit}) {
    commit(TYPE.SET_LOADING_WORKSPACE, true)
    try {
      const { results } = await getOrgsAndClientsApi()
      commit(TYPE.UPDATE_WORKSPACE, results)
    } catch (error) {
      throw error
    }
    commit(TYPE.SET_LOADING_WORKSPACE, false)
  },
  [TYPE.APPLY_WORKSPACE_FILTER] ({ commit }, payload) {
    commit(TYPE.APPLY_WORKSPACE_FILTER, payload)
  },
  [TYPE.RESET_SEARCH] ({ commit }, payload) {
    commit(TYPE.RESET_SEARCH, payload)
  },
  [TYPE.SET_DEFAULT_SEARCH] ({ commit }) {
    commit(TYPE.SET_DEFAULT_SEARCH)
  }
}

const mutations = {
  [TYPE.UPDATE_AUTH_DATA] (state, payload) {
    state.userToken = payload.userToken || ''
    state.user = payload.user || {}
    state.current_client.id = payload.currentClientID || ''
  },
  [TYPE.UPDATE_CLIENTS_DATA] (state, payload) {
    state.clients = payload.clients
    state.current_client.id = payload.currentClientID
    // update client_id to modules
    Vue.prototype.$bus.$emit('ps_set_current_client_id', payload.currentClientID)
  },
  [TYPE.SAVE_NEW_CLIENT] (state, payload) {
    // find org in array
    state.org.list.some((org) => {
      if (org.organization && org.organization.id && (org.organization.id === payload.orgId)) {
        if (!state.current_client.id) {
          // update current client
          // state.current_client.id = payload.client.id || ''
          org.clients.push(payload.client)
        } else {
          org.clients.push(payload.client)
          let index = null
          let searchedData = null
          let clients = [...org.clients]
          clients.some((item, key) => {
            if (item.id === state.current_client.id) {
              index = key
              searchedData = Object.assign({}, item)
              return true
            }
          })
          if (searchedData) {
            clients.splice(index, 1)
            // order clients
            clients = orderBy(clients, [client => client.name.toLowerCase()], ['asc'])
            clients.unshift(searchedData)
          }
          org.clients = clients
        }
        return true
      }
    })
  },
  [TYPE.SAVE_NEW_AVATAR_URL] (state, payload) {
    state.avatarURL = payload
  },
  [TYPE.UPDATE_USER_ID] (state, payload) {
    Vue.set(state.user, 'user_id', payload)
  },
  [TYPE.UPDATE_CAN_CREATE_CLIENT_FLAG] (state, payload) {
    Vue.set(state.user, 'can_create_client', payload)
  },
  [TYPE.UPDATE_CURRENT_CLIENT_MODULES] (state, payload) {
    state.current_client.modules = payload.modules
    state.current_client.name = payload.name
    if (payload.clientId) {
      state.current_client.id = payload.clientId
    }
  },
  [TYPE.SAVE_USER_ROLE] (state, payload) {
    state.role.userRole = payload.role
    state.role.currentEditClientId = payload.currentEditClientId
  },
  [TYPE.UPDATE_SPECIFIC_CLIENT] (state, payload) {
    if (state.clients && state.clients.length) {
      let clients = state.clients
      clients.some((client, index) => {
        if (client.id === payload.id) {
          clients[index] = Object.assign({}, payload)
          return true
        }
      })
      state.clients = [...clients]
    }
  },
  [TYPE.UPDATE_CURRENT_CHANNEL] (state, payload) {
    let saved = false
    let currentChannel = state.ps_current_channel
    for (let field in payload) {
      if (!payload[field]) {
        const modules = state.current_client.modules || ''
        const activedModules = modules.filter(item => item.enabled)
        if (activedModules.length) {
          // find if there is MT and it is enabled, and app is matrix then make it default module on first access
          let MTIndex = findIndex(activedModules, { 'module': 'MT' })
          let appNameIs = process.env.VUE_APP_PS_BUILD_APP
          if (MTIndex !== -1 && appNameIs === 'matrix') {
            payload[field] = activedModules[MTIndex].module
          } else {
            payload[field] = activedModules[0].module || ''
          }
        }
      }
    }
    for (let field in currentChannel) {
      if (payload.hasOwnProperty(field)) {
        state.ps_current_channel[field] = payload[field]
        saved = true
      }
    }
    if (!saved) {
      state.ps_current_channel = {...state.ps_current_channel, ...payload}
    }
  },
  [TYPE.RESET_ORG] (state, payload) {
    state.org = {
      current: {
        role: '',
        id: ''
      },
      list: []
    }
  },
  [TYPE.RESET_CLIENT] (state, payload) {
    state.current_client = {
      id: '',
      name: '',
      modules: []
    }
    state.ps_current_channel = {}
    state.role = {
      userRole: null,
      currentEditClientId: null
    }
  },
  [TYPE.ORDER_CLIENTS] (state, payload) {
    if (state.org && state.org.list) {
      let orgIndex = null
      let clientIndex = null
      let orgData = null
      let clientData = null
      let orgList = [...state.org.list]
      // find org and client
      orgList.some((org, key) => {
        if (orgData) return true
        org.clients.some((client, index) => {
          if (client.id === payload) {
            orgIndex = key
            clientIndex = index
            clientData = Object.assign({}, client)
            orgData = Object.assign({}, org)
            return true
          }
        })
      })
      if (orgData) {
        orgList.splice(orgIndex, 1)
        // order list
        if (orgList && orgList.length) {
          orgList = orderBy(orgList, [org => org.organization.name.toLowerCase()], ['asc'])
          orgList.forEach((org, orgKey) => {
            if (org.clients && org.clients.length) {
              org.clients = orderBy(org.clients, [client => client.name.toLowerCase()], ['asc'])
            }
          })
        }
        if (orgData.clients && clientData) orgData.clients.splice(clientIndex, 1)
        orgData.clients = orderBy(orgData.clients, [client => client.name.toLowerCase()], ['asc'])
        if (orgData.clients && clientData) orgData.clients.unshift(clientData)
        orgList.unshift(orgData)
        state.org.current = {
          id: orgData.organization.id,
          role: orgData.organization.role.key
        }
        state.org.list = [...orgList]
      }
    }
  },
  [TYPE.SAVE_CURRENT_ORG] (state, payload) {
    state.org.current = {...payload}
  },
  [TYPE.SAVE_ORGS_LIST] (state, payload) {
    state.org.list = [...payload.orgs]
  },
  [TYPE.ADD_ORG] (state, payload) {
    const data = {
      organization: {...payload},
      clients: []
    }
    state.org.list.push(data)
  },
  [TYPE.UPDATE_ORG] (state, payload) {
    if (state.org.list && state.org.list.length) {
      let orgs = [...state.org.list]
      orgs.some((org) => {
        if (org.organization.id === payload.id) {
          if (!payload.role) {
            payload.role = org.organization && org.organization.role ? org.organization.role : {}
          }
          org.organization = payload
          return true
        }
      })
      state.org.list = [...orgs]
    }
  },
  [TYPE.UPDATE_CLIENT_ORG] (state, payload) {
    const orgs = [...state.org.list]
    if (payload.orgId && payload.client.id) {
      orgs.some((org) => {
        if (org.organization && org.organization.id === payload.orgId) {
          org.clients.some((client, key) => {
            if (client.id === payload.client.id) {
              if (payload.type === 'delete') {
                // reset channel, current_client
                if (state.current_client.id === payload.client.id) {
                  state.current_client = {
                    id: '',
                    modules: []
                  }
                }
                if (state.role.currentEditClientId === payload.client.id) {
                  state.role = {
                    userRole: null,
                    currentEditClientId: null
                  }
                }
                if (state.ps_current_channel[payload.client.id]) {
                  state.ps_current_channel[payload.client.id] = ''
                }
                org.clients.splice(key, 1)
              } else {
                client.name = payload.client.name
              }
              return true
            }
          })
          return true
        }
      })
    } else if (payload.client.id) {
      let haveClient = false
      orgs.some((org) => {
        if (haveClient) return true
        org.clients.some((client, key) => {
          if (client.id === payload.client.id) {
            if (payload.type === 'delete') {
              // reset channel, current_client
              if (state.current_client.id === payload.client.id) {
                state.current_client = {
                  id: '',
                  modules: []
                }
              }
              if (state.role.currentEditClientId === payload.client.id) {
                state.role = {
                  userRole: null,
                  currentEditClientId: null
                }
              }
              if (state.ps_current_channel[payload.client.id]) {
                state.ps_current_channel[payload.client.id] = ''
              }
              client.splice(key, 1)
            } else {
              client.name = payload.client.name
            }
            haveClient = true
            return true
          }
        })
      })
    }
    state.org.list = orgs
  },
  [TYPE.ADD_CLIENT_ORG] (state, payload) {
    const orgs = [...state.org.list]
    if (payload.orgId && payload.client.id) {
      orgs.some((org) => {
        if (org.organization && org.organization.id === payload.orgId) {
          org.clients.push(payload.client)
          return true
        }
      })
    }
    state.org.list = orgs
  },
  [TYPE.ORDER_ORGS] (state, payload) {
    // order org list
    let index = null
    let searchedData = null
    let orgs = [...state.org.list]
    orgs.some((org, key) => {
      if (org.organization.id === state.org.current.id) {
        index = key
        searchedData = Object.assign({}, org)
        return true
      }
    })
    if (searchedData) {
      orgs.splice(index, 1)
      orgs = orderBy(orgs, [org => org.organization.name.toLowerCase()], ['asc'])
      orgs.unshift(searchedData)
    }
    state.org.list = orgs
  },
  [TYPE.ORDER_CLIENTS_ORG] (state, payload) {
    let orgs = [...state.org.list]
    orgs.some((org) => {
      if (org.organization && org.organization.id === payload.orgId) {
        // order clients
        let index = null
        let searchedData = null
        org.clients.some((client, key) => {
          if (client.id === state.org.current.id) {
            index = key
            searchedData = Object.assign({}, client)
            return true
          }
        })
        if (searchedData) org.clients.splice(index, 1)
        org.clients = orderBy(org.clients, [client => client.name.toLowerCase()], ['asc'])
        if (searchedData) org.clients.unshift(searchedData)
        return true
      }
    })
    state.org.list = orgs
  },
  [TYPE.SAVE_ORG_PARAM] (state, payload) {
    state.org.param = payload
  },
  [TYPE.UPDATE_TOKEN] (state, payload) {
    state.userToken = payload.token
    _localStorage.setItem('ps_access_token', payload.token || '')
  },
  [TYPE.EDIT_CLIENT_MODULES] (state, payload) {
    let orgs = [...state.org.list]
    let orgIndex = null
    orgs.some((org, index) => {
      org.clients.some((client, key) => {
        if (client.id === payload.clientId) {
          client.modules.some((mod) => {
            if (payload.module && payload.module.module && mod.module === payload.module.module) {
              mod.enabled = payload.module && payload.module.enabled ? payload.module.enabled : false
              return true
            }
          })
          return true
        }
        if (index === orgIndex) return true
      })
    })
    state.org.list = orgs
  },
  resetClients (state, payload) {
    state.org.list.forEach((org) => {
      org.clients = []
    })
  },
  resetOrgs (state, payload) {
    state.org.list = []
  },
  [TYPE.UPDATE_WORKSPACE] (state, payload) {
    state.workspaceData = payload
    state.filteredWorkspaces = payload.map(item => {
      return {
        ...item,
        total: item.clients.length
      }
    })
  },
  [TYPE.APPLY_WORKSPACE_FILTER] (state, payload) {
    state.workspaceSearchParams[payload.index] = payload.value
    state.filteredWorkspaces = state.workspaceData.map((item, index) => {
      let keyword = state.workspaceSearchParams[index]
      return {
        ...item,
        total: item.clients.length,
        clients: keyword ? item.clients.filter(client => {
          return client.name?.toUpperCase().indexOf(keyword.toUpperCase()) >= 0 || client.extra_information?.current_owner?.toUpperCase().indexOf(keyword.toUpperCase()) >= 0 || client.account_manager?.toUpperCase().indexOf(keyword.toUpperCase()) >= 0 || client.special_project_manager?.toUpperCase().indexOf(keyword.toUpperCase()) >= 0
        }) : item.clients
      }
    })
  },
  [TYPE.RESET_SEARCH] (state, index) {
    let initArray = state.workspaceSearchParams
    initArray[index] = ''
    state.workspaceSearchParams = initArray
  },
  [TYPE.SET_DEFAULT_SEARCH] (state) {
    state.workspaceSearchParams = []
  },
  [TYPE.SET_LOADING_WORKSPACE] (state, payload) {
    state.isLoadingWorkspace = payload
  }
}

const getters = {
  [TYPE.GET_TOKEN]: (state) => {
    return state.userToken
  },
  [TYPE.GET_AUTH_DATA]: (state) => (field) => {
    let result = ''
    if (state.hasOwnProperty([field])) {
      result = state[field]
    }
    return result
  },
  [TYPE.GET_AVATAR_URL]: (state) => {
    return state.avatarURL
  },
  [TYPE.GET_USER_ID]: (state) => {
    return state.user.user_id
  },
  [TYPE.GET_CURRENT_CLIENT]: (state) => {
    return state.current_client
  },
  [TYPE.GET_ROLE_INFO]: (state) => {
    return state.role
  },
  [TYPE.GET_CURRENT_CHANNEL]: (state) => {
    return state.ps_current_channel
  },
  [TYPE.GET_CLIENTS_BY_USER]: (state) => {
    return state.clients
  },
  [TYPE.CAN_CREATE_CLIENT]: (state) => {
    return state.user.can_create_client
  },
  [TYPE.GET_USER_EMAIL]: (state) => {
    return state.user.email
  },
  [TYPE.GET_ORGS_BY_USER]: (state) => {
    return state.org.list
  },
  [TYPE.GET_CURRENT_ORG]: (state) => {
    return state.org.current
  },
  [TYPE.GET_ORG_PARAM]: (state) => {
    return state.org.param
  },
  [TYPE.GET_LIST_WORKSPACE]: (state) => {
    return state.workspaceData
  },
  [TYPE.GET_FILTER_WORKSPACE]: (state) => {
    return state.filteredWorkspaces
  },
  [TYPE.SEARCH_INDEX]: (state) => (index) => {
    return state.workspaceSearchParams[index]
  },
  [TYPE.GET_LOADING_WORKSPACE]: (state) => {
    return state.isLoadingWorkspace
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
