import Vue from 'vue'
import Router from 'vue-router'
import auth from '@/services/auth'
import store from '@/store'
import * as TYPE from '@/store/_constant'
import routes from '@/router/_routerConfig'
import { getOrgsAndClientsApi } from '@/services/organization'
import _localStorage from '@/services/_localStorage'
Vue.use(Router)

const router = new Router({
  scrollBehavior(to, from, savedPosition) {
    const orgParam = store.getters['ps/userModule/GET_ORG_PARAM']
    if (!orgParam || (orgParam && orgParam !== to.params.orgId)) {
      store.dispatch('ps/userModule/SAVE_ORG_PARAM', to.params.orgId)
    }
    if (savedPosition) return savedPosition
    return { x: 0, y: 0 }
  },
  routes
})

router.beforeEach(async (to, from, next) => {
  // reset global service in cbpo
  try {
    if (process.env.VUE_APP_PS_BUILD_APP === 'matrix') {
      window.CBPO.channelManager().getChannel().reset()
    }
  } catch (e) {
    console.log("SDK doesn't support reset method")
  }
  forceHttps()
  // get nearest title
  const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title)
  const brandSign = process.env.VUE_APP_BRANDING ? `- ${process.env.VUE_APP_BRANDING}` : ''
  // update title to document.title
  if (nearestWithTitle) document.title = nearestWithTitle.meta.title.replace(/- Channel Precision/gi, brandSign)
  // get current id
  const currentClient = store.getters['ps/userModule/GET_CURRENT_CLIENT']
  // check authentication
  const authenticateRoutes = ['ForgotPassword', 'Register', 'Login', 'GoogleLogin']
  const shareRegrex = /\/share\//
  if (!auth.isLogined() && (!authenticateRoutes.includes(to.name) && !shareRegrex.test(to.path))) {
    if (to.path && to.path !== '/' && !_localStorage.getItem('ps_current_path')) {
      return next({ name: 'Login', query: {path: to.fullPath} })
    }
    if (!from.path || from.path === '/' || (from.path === '/login' && ((_localStorage.getItem('ps_current_path') === '/login') || (!_localStorage.getItem('ps_current_path'))))) {
      return next({ name: 'Login' })
    }
    return next({ name: 'Login', query: { path: from.path } })
  }
  if (authenticateRoutes.includes(to.name) && auth.isLogined()) {
    if (from.path && !authenticateRoutes.includes(from.name)) {
      return next({ path: from.path })
    }
    if (currentClient && currentClient.id) {
      return next({ name: 'ps-dashboard', params: { client_id: currentClient.id } })
    }
    return next({ name: 'ps-dashboard' })
  }

  if (to.path === '/' && auth.isLogined()) {
    if (currentClient && currentClient.id) {
      return next({ name: 'ps-dashboard', params: { client_id: currentClient.id } })
    }
    return next({ name: 'ps-dashboard' })
  }
  // if shared urls
  if (shareRegrex.test(to.path)) {
    Vue.prototype.$bus.$emit('ps_set_current_client_id', to.params.client_id)
    return next()
  }
  // check org in url
  if (to.params && to.params.orgId && !shareRegrex.test(to.path)) {
    // check if no org, recall api
    await checkOrg(to.params.orgId, true)
  }
  if (to.params && to.params.client_id && !shareRegrex.test(to.path)) {
    // check if no workspace, recall api
    await checkWorkspace(to.params.client_id, true)
    if (to.params.client_id !== 'client_id' && to.params.client_id !== currentClient.id) {
      const newClient = {
        clientID: to.params.client_id,
        userID: store.getters['ps/userModule/GET_USER_ID']
      }
      // switch client
      await store.dispatch(`ps/userModule/${TYPE.SWITCH_CLIENT}`, newClient)
    }
  }
  // Check module roles
  const pathPattern = /\/(rw|mw|ra|ds|mt|dc)\//g
  if (pathPattern.test(to.path) && !shareRegrex.test(to.path)) {
    const modules = currentClient.modules || []
    if (currentClient.id) {
      const currentChannel = store.getters['ps/userModule/GET_CURRENT_CHANNEL'][currentClient.id]
      // Redirect to common ps-dashboard if any modules isn't actived
      if (!currentChannel) {
        return next({ name: 'ps-dashboard', params: { client_id: currentClient.id } })
      } else {
        let formatedCurrentChannel
        switch (currentChannel) {
          case 'MAP':
            formatedCurrentChannel = 'mw'
            break
          case 'ROG':
            formatedCurrentChannel = 'rw'
            break
          default:
            formatedCurrentChannel = currentChannel.toLowerCase() || ''
            break
        }
        // check if it's not current channel
        if (!to.path.includes(`/${formatedCurrentChannel}/`)) {
          const result = isActivedModule(modules, to.path)
          if (!result) return next({ name: 'ps-dashboard', params: { client_id: currentClient.id } })
          // Update channel to store
          const data = { [currentClient.id]: result }
          store.dispatch(`ps/userModule/${TYPE.EDIT_CURRENT_CHANNEL}`, data)
        }
      }
    }
  }
  return next()
})

function isActivedModule(modules, path) {
  let result = ''
  if (modules && modules.length) {
    modules.some((mod) => {
      if (mod.enabled) {
        let modName = mod.module || ''
        if (modName === 'ROG') modName = 'rw'
        else if (modName === 'MAP') modName = 'mw'
        else if (modName === 'RA') modName = 'ra'
        else if (modName === 'DS') modName = 'ds'
        else if (modName === 'MT') modName = 'mt'
        else if (modName === 'TR') modName = 'tr'
        else if (modName === 'PF') modName = 'pf'
        else if (modName === 'SKUF') modName = 'skuflex'
        else if (modName === 'SA') modName = 'sa'
        if (path.includes(`/${modName}/`)) {
          result = mod.module
          return true
        }
      }
    })
  }
  return result
}

function forceHttps() {
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  if (hostname === 'app.channelprecision.com' && protocol === 'http:') {
    let url = window.location.href
    url = url.replace('http:', 'https:', url)
    window.location.href = url
  }
}

// check workspace
async function checkWorkspace(clientID, retryIfClientNotFound) {
  const orgs = store.getters['ps/userModule/GET_ORGS_BY_USER']
  const clients = orgs.reduce((newArr, item) => newArr.concat(item.clients), [])
  const haveClient = clients.map(item => item.id).includes(clientID)
  if (!haveClient) {
    if (!retryIfClientNotFound) {
      router.push({ name: 'PSErrorPage' })
      return true
    } else {
      await getClientsFromApi()
      return checkWorkspace(clientID, false)
    }
  }
}

// check org
async function checkOrg(orgId, retryIfClientNotFound) {
  const orgs = store.getters['ps/userModule/GET_ORGS_BY_USER']
  const orgIndex = orgs.findIndex(org => org.organization.id === orgId)
  if (orgIndex === -1) {
    if (!retryIfClientNotFound) {
      const currentClient = store.getters['ps/userModule/GET_CURRENT_CLIENT']
      if (currentClient && currentClient.id) {
        router.push({ name: 'ps-dashboard', params: { client_id: currentClient.id } })
      } else {
        router.push({ name: 'ps-dashboard' })
      }
      return true
    } else {
      await getClientsFromApi()
      return checkOrg(orgId, false)
    }
  }
}

async function getClientsFromApi() {
  await getOrgsAndClientsApi()
    .then(res => {
      // update clients to store
      const orgs = res.results || []
      store.dispatch(`ps/userModule/${TYPE.SAVE_ORGS_LIST}`, { orgs })
    })
    .catch(res => {
      console.log(res)
    })
}

export default router
