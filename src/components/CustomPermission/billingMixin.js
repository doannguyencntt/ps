import { mapGetters } from 'vuex'
import {
  GET_ORGS_BY_USER,
  GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID,
  GET_BILLING_SUBSCRIPTION_LOADING_STATUS,
  GET_CURRENT_CLIENT,
  GET_CURRENT_ORG,
  GET_USER_ID
} from '@/store/_constant'
import { getUsersInOrgApi } from '@/services/userOrg'
import { isBillingEnabled, isConfigActivated } from '@/shared/utils'
import get from 'lodash/get'

export const checkingOrganizationPermission = (isAddOrgRedirect = false) => {
  return {
    computed: {
      ...mapGetters({
        _getCurrentOrg: `ps/userModule/${GET_CURRENT_ORG}`,
        _getOrganizationList: `ps/userModule/${GET_ORGS_BY_USER}`,
        _getSubscriptionStatus: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_LOADING_STATUS}`
      }),
      canCreateOrganization() {
        return isBillingEnabled()
          ? this._getOrganizationList.length === 0
          : true
      },
      canAccessBillingPage() {
        const { role } = this._getCurrentOrg || {}
        return ['ADMIN', 'OWNER'].includes(role)
      }
    },
    methods: {
      checkStatus() {
        if (isBillingEnabled() && isAddOrgRedirect && !this.canCreateOrganization) this.$router.push({ name: 'ps-dashboard' })
      }
    },
    watch: {
      _getSubscriptionStatus: {
        immediate: true,
        handler(status) {
          // status === false mean done fetching
          if (!status) {
            this.checkStatus()
          }
        }
      }
    }
  }
}

export const checkingWorkspacePermission = (isRedirect = false) => {
  return {
    computed: {
      ...mapGetters({
        _getOrganizationList: `ps/userModule/${GET_ORGS_BY_USER}`,
        _getSubscriptionConfigByOrg: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID}`,
        _getSubscriptionStatus: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_LOADING_STATUS}`
      }),
      canCreateWorkspace() {
        const orgId = this.$route.params.orgId
        const { clients = [] } = this._getOrganizationList.find(org => org.organization.id === orgId)
        const subscriptionConfig = this._getSubscriptionConfigByOrg(orgId)
        const maxClients = get(subscriptionConfig, 'max_workspaces', 0)
        const isLimited = maxClients === -1 || maxClients === null
          ? false
          : clients.length >= maxClients
        console.log(isLimited)
        return isBillingEnabled()
          ? isConfigActivated(subscriptionConfig) && !isLimited
          : true
      },
      canAccessWorkspaces() {
        return clientId => {
          // no enabled billing module will allow access
          if (!isBillingEnabled()) return true
          // find org of current client
          const org = this.getCurrentOrgFromClient(clientId)
          if (!org) return false
          // check subscriptions
          const orgId = org.organization.id
          const subscriptionConfig = this._getSubscriptionConfigByOrg(orgId)
          return isConfigActivated(subscriptionConfig)
        }
      }
    },
    methods: {
      getCurrentOrgFromClient(clientId) {
        const list = this._getOrganizationList || []
        return list.find(org => org.clients.find(client => client.id === clientId))
      },
      checkStatus() {
        const orgId = this.$route.params.orgId
        if (isBillingEnabled() && isRedirect && (!this._getSubscriptionConfigByOrg(orgId) || !this.canCreateWorkspace)) {
          this.$router.push({
            name: 'ps-BillingSubscription',
            params: { orgId }
          })
        }
      }
    },
    watch: {
      _getSubscriptionStatus: {
        immediate: true,
        handler(status) {
          // status === false mean done fetching
          if (!status) {
            this.checkStatus()
          }
        }
      }
    }
  }
}

// type must be client or org or custom
export const checkingUserPermissions = (type, isRedirect = false, redirectLocation) => {
  return {
    data: () => ({
      firstCheck: true,
      isGettingUser: false,
      userList: [],
      recheck: 0
    }),
    computed: {
      ...mapGetters({
        _getOrganizationList: `ps/userModule/${GET_ORGS_BY_USER}`,
        _getSubscriptionConfigByOrg: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID}`,
        _getSubscriptionStatus: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_LOADING_STATUS}`,
        _getCurrentClient: `ps/userModule/${GET_CURRENT_CLIENT}`,
        _getCurrentOrg: `ps/userModule/${GET_CURRENT_ORG}`,
        _getUserIdFromStore: `ps/userModule/${GET_USER_ID}`
      }),
      canAddUser() {
        return (localList = []) => {
          if (type === 'custom') type = this.$route.params.type
          const { id: orgId } = this._getCurrentOrg
          const field = type === 'client' ? 'max_external_users' : 'max_internal_users'
          const subscriptionConfig = this._getSubscriptionConfigByOrg(orgId)
          const maxUsers = get(subscriptionConfig, field, 0)
          const userLength = (this.userList || []).length
          const localLength = this.firstCheck ? localList.length - 1 : localList.length
          const isLimited = maxUsers === -1 || maxUsers === null
            ? false
            : (userLength + localLength) >= maxUsers
          return isBillingEnabled()
            // userList get from component which extends this mixins
            ? isConfigActivated(subscriptionConfig) && !isLimited
            : true
        }
      }
    },
    methods: {
      async getUsers() {
        try {
          this.isGettingUser = true
          let roles = type === 'client'
            ? ['Client']
            : ['OWNER', 'ADMIN', 'STAFF']
          let response = await getUsersInOrgApi(
            this.$route.params.orgId || this._getCurrentOrg.id,
            { limit: 999, page: 1, roles }
          )
          if (type === 'client') {
            // add 1 because each ws has 1 owner
            response.results.push({
              name: 'Current User'
            })
          }
          return response.results
        } catch (err) {
          return null
        } finally {
          this.isGettingUser = false
        }
      }
    },
    watch: {
      recheck: {
        immediate: true,
        async handler(time) {
          const { id: clientId } = this._getCurrentClient || {}
          const { id: orgId } = this._getCurrentOrg
          // get current org
          if (!isBillingEnabled()) return
          if (isRedirect) {
            if (!this._getSubscriptionConfigByOrg(orgId)) {
              this.$router.push({
                name: 'ps-BillingSubscription',
                params: { orgId }
              })
            } else {
              // get list user
              this.userList = await this.getUsers()
              if (!this.userList || !this.canAddUser([])) {
                const location = time > 0
                  ? redirectLocation
                  : {
                    name: 'ps-BillingSubscription',
                    params: { orgId }
                  }
                if (type === 'client') {
                  location.params = { id: clientId }
                }
                this.$router.push(location)
              }
            }
          }
          this.firstCheck = false
        }
      },
      watch: {
        _getSubscriptionStatus: {
          immediate: true,
          handler(status) {
            // status === false mean done fetching
            if (!status) {
              this.recheck++
            }
          }
        }
      }
    }
  }
}

export const checkingBillingPagePermissions = {
  computed: {
    ...mapGetters({
      _getSubscriptionConfig: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID}`
    })
  },
  created() {
    const { orgId } = this.$route.params
    const subscriptionData = this._getSubscriptionConfig(orgId)
    if (!subscriptionData) {
      this.$router.push({
        name: 'ps-BillingPlans'
      })
    }
  }
}
