import * as TYPE from '@/store/_constant'
import store from '@/store'

export default {
  methods: {
    checkActivedModules (arr) {
      const currentClient = store.getters['ps/userModule/GET_AUTH_DATA']('current_client')
      const modulesFromLocal = currentClient && currentClient.modules ? currentClient.modules : []
      const activeModules = arr.filter((m) => {
        const index = modulesFromLocal.findIndex(item => item.module === m)
        if (index !== -1 && modulesFromLocal[index].enabled) {
          return true
        }
      })
      return activeModules.length
    },
    // OWNER/ADMIN/MANAGER/STAFF
    checkRole (arrRoles) {
      const roleInfo = store.getters[`ps/userModule/${TYPE.GET_ROLE_INFO}`]
      const userRole = roleInfo.userRole || ''
      return arrRoles.includes(userRole)
    },
    // list user is full owner and status of user not PENDING
    isFullOwnerUser (listUser, currentUserEmail) {
      return !listUser.some(item => item.user.email !== currentUserEmail && (item.status === 'PENDING' || item.role.key !== 'OWNER'))
    },
    checkRoleInOrg (arrRoles) {
      const currentOrg = store.getters[`ps/userModule/${TYPE.GET_CURRENT_ORG}`]
      const roleInfo = currentOrg.role || ''
      return arrRoles.includes(roleInfo)
    },
    checkLoginedRoleWithAnother (otherRole) {
      const roleInfo = store.getters[`ps/userModule/${TYPE.GET_ROLE_INFO}`]
      const userRole = roleInfo.userRole || ''
      if (userRole === 'OWNER') return true
      if (userRole === 'ADMIN' && otherRole === 'OWNER') return false
      if (userRole === 'MANAGER' && (otherRole === 'ADMIN' || otherRole === 'OWNER')) return false
      if (userRole === 'STAFF') return false
      return true
    },
    getOrgRole (orgId) {
      let role = ''
      if (orgId) {
        const orgs = store.getters[`ps/userModule/${TYPE.GET_ORGS_BY_USER}`]
        if (orgs && orgs.length) {
          orgs.some((org) => {
            if (org.organization && org.organization.id === orgId) {
              role = org.organization.role && org.organization.role.key ? org.organization.role.key : ''
              return true
            }
          })
        }
      }
      return role
    },
    compare2Roles (loginedRole, otherRole, loginedRoleInOrg = '') {
      if (!loginedRole || !otherRole) return false
      if (loginedRole === 'OWNER') {
        if (loginedRoleInOrg) return loginedRoleInOrg === 'OWNER' || loginedRoleInOrg === 'ADMIN'
        return true
      }
      if (loginedRole === 'ADMIN' && otherRole === 'OWNER') return false
      if (loginedRole === 'STAFF') return false
      if (loginedRole === 'CLIENT') return false
      return true
    },
    // check if show manage button
    hasUserAction (isLoggedUser, loginedRole, otherRole, status) {
      if (loginedRole === 'OWNER') return true
      if (loginedRole === 'ADMIN') {
        return otherRole !== 'OWNER'
      }
      // can remove or edit role
      // if (!isLoggedUser && this.compare2Roles(loginedRole, otherRole)) return true
      // can change permission
      // if (this.compare2Roles(loginedRole, otherRole)) return true
      // can resend
      // if (status && status !== 'MEMBER' && (loginedRole === 'ADMIN' || loginedRole === 'OWNER')) return true
      return false
    },
    getClientModulesFromStore (clientId) {
      let modules = []
      let orgIndex = null
      const orgs = store.getters['ps/userModule/GET_ORGS_BY_USER']
      if (orgs && orgs.length) {
        orgs.some((org, index) => {
          if (org.clients && org.clients.length) {
            org.clients.some(client => {
              if (client.id === clientId) {
                orgIndex = index
                modules = [...client.modules]
                return true
              }
            })
          }
          if (orgIndex === index) return true
        })
      }
      return modules
    }
  }
}
