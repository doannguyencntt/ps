<template>
  <div class="toggle-margin" :class="{'specific-client-dropdown': currentClientName}">
  <AppHeaderDropdown right ref="clientDropdown" v-if="orgsFromStore && orgsFromStore.length">
    <template slot="header">
      <span v-if="currentClientName" :title="currentClientName" class="header">
        <i class="icons icon-people"></i> Workspace: {{ currentClientName }}
      </span>
      <span v-else class="custom-header">
        <i class="icons icon-people"></i> Select a workspace
      </span>
    </template>
    <template slot="dropdown">
      <div class="list-client">
        <div v-for="(org, index) in orgsFromStore" :key="index">
            <div class="position-relative">
              <b-dropdown-header tag="div">
                <strong :title="org.organization.name">{{ org.organization.name }}</strong>
              </b-dropdown-header>
              <span
                v-if="canAccess(org)"
                v-on:click="switchToOrg(org), hideDropdown(), $router.push({name: 'ps-OrgSettings', params: {orgId: org.organization.id}})"
                class="edit-icon position-absolute"
              >
              <i class="icons icon-settings text-dark hand-pointer" title="Manage Organization" aria-hidden="true"></i>
            </span>
            </div>
            <div v-if="org.clients">
              <div class="position-relative" v-for="(client, _i) in org.clients" :key="_i">
                <b-dropdown-item-button
                  :id="'clients_' + _i"
                  class="profile-no-decorate drop-down-client dd-client-name"
                  v-bind:class="{ 'is-current-id' : index === 0 && _i === 0 && currentClientFromStore.id === client.id }"
                  @click="switchClient(client, _i)"
                >
                  <div class="text-center">
                    <i :class="{'icons icon-check text-dark': true, 'visible': index === 0 && _i === 0 && currentClientFromStore.id}" aria-hidden="true"></i>
                  </div>
                  <div class="d-flex justify-content-start clients-name">
                    <span :title="client.name" class="option-client">{{ client.name || '' }}</span>
                  </div>
                </b-dropdown-item-button>
                <span
                  v-if="canOpenSetting(org.organization.role || {}, client.role || {})"
                  v-on:click="editClient($event, client.id)"
                  class="edit-icon position-absolute"
                >
                <i class="icons icon-settings text-dark hand-pointer" title="Manage Workspace" aria-hidden="true" ></i>
              </span>
                <router-link target="_blank" class="d-none" ref="clientLink" :to="{name: 'ps-dashboard', params: {client_id: client.id}}"></router-link>
              </div>
            </div>
          </div>
      </div>
      <div class="position-relative" v-show="canCreateClient && canCreateOrganization">
        <b-dropdown-item @click.native="hideDropdown" class="drop-down-client" :to="{ name: 'ps-AddOrg' }">
          <i class="icons icon-plus text-dark" />Add organization
        </b-dropdown-item>
      </div>
    </template>
  </AppHeaderDropdown>
  <AppHeaderDropdown right ref="clientDropdown"
    v-else-if="!orgsFromStore.length && canCreateClient">
    <template slot="header">
      <i class="icons icon-people"></i> Workspace:
    </template>
    <template slot="dropdown">
      <div v-if="canCreateOrganization" class="position-relative">
        <b-dropdown-item @click.native="hideDropdown" class="drop-down-client" :to="{ name: 'ps-AddOrg' }">
          <i class="icons icon-plus text-dark" />Add organization
        </b-dropdown-item>
      </div>
    </template>
  </AppHeaderDropdown>
  </div>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
import { mapActions, mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import apiUser from '@/services/user'
import commons from '@/shared/mixins'
import find from 'lodash/find'
import get from 'lodash/get'
import { getOrgsAndClientsApi } from '@/services/organization'
import { checkingOrganizationPermission } from '@/components/CustomPermission/billingMixin'
import action from '@/services/activity'

export default {
  name: 'DefaultHeaderDropdownAccnt',
  components: {
    AppHeaderDropdown
  },
  mixins: [commons, checkingOrganizationPermission(false)],
  data: () => {
    return {
      itemsCount: 42,
      currentClientID: '',
      canCreateClient: false,
      listClientData: [],
      tempSelectedClient: [],
      orgList: [],
      data: {},
      appProfile: process.env.VUE_APP_PS_BUILD_APP,
      enableAutoPickFirstClientID: process.env.VUE_APP_PS_AUTO_PICK_FIRST_CLIENT
    }
  },
  computed: {
    ...mapGetters({
      getUserID: `ps/userModule/${TYPE.GET_USER_ID}`,
      currentClientFromStore: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`,
      orgsFromStore: `ps/userModule/${TYPE.GET_ORGS_BY_USER}`,
      currentChannel: `ps/userModule/${TYPE.GET_CURRENT_CHANNEL}`,
      currentOrg: `ps/userModule/${TYPE.GET_CURRENT_ORG}`
    }),
    currentClientName () {
      return get(this.currentClientFromStore, 'name', '')
    }
  },
  methods: {
    ...mapActions({
      addNewAvatarURL: `ps/userModule/${TYPE.ADD_NEW_AVATAR_URL}`,
      updateUserInfo: `ps/userModule/${TYPE.EDIT_USER_INFO}`,
      saveOrgs: `ps/userModule/${TYPE.SAVE_ORGS_LIST}`,
      changeClient: `ps/userModule/${TYPE.SWITCH_CLIENT}`,
      resetClient: `ps/userModule/${TYPE.RESET_CLIENT}`,
      saveCurrentOrg: `ps/userModule/${TYPE.SAVE_CURRENT_ORG}`
    }),
    async switchClient(client, index) {
      // MAT-858 get current Client ID From Store
      this.currentClientID = this.currentClientFromStore.id
      this.data.app_profile = process.env.VUE_APP_PS_BUILD_APP
      this.data.module = this.currentChannel[client.id]
      this.data.client_id = client.id
      action.switchClientAction(this.data)
      if (client.id === this.currentClientID) {
        return
      }
      this.hideDropdown()
      if (client.id) {
        const clientModules = this.getClientModulesFromStore(client.id)
        var findRes = find(clientModules, ['enabled', true])
        let route = ''
        if (this.appProfile === 'matrix' && find(clientModules, {'enabled': true, 'module': 'MT'})) {
          findRes = find(clientModules, {'enabled': true, 'module': 'MT'})
        }
        if (findRes && findRes.module) {
          let toChannel = findRes.module
          switch (findRes.module) {
            case 'MAP':
              toChannel = 'mw'
              break
            case 'ROG':
              toChannel = 'rw'
              break
            case 'DS':
              toChannel = 'ds'
              break
            case 'RA':
              toChannel = 'ra'
              break
            case 'MT':
              toChannel = 'mt'
              break
            case 'DC':
              toChannel = 'dc'
              break
            case 'TR':
              toChannel = 'tr'
              break
            case 'PF':
              toChannel = 'pf'
              break
            case 'SKUF':
              toChannel = 'skuflex'
              break
            case 'SA':
              toChannel = 'sa'
              break
          }
          if (toChannel === 'rw') {
            route = this.$router.resolve({name: 'RWDashboard', params: {client_id: client.id}})
          } else if (toChannel === 'mw') {
            route = this.$router.resolve({name: 'MWDashboardMain', params: {client_id: client.id}})
          } else if (toChannel === 'ds') {
            // temp
            route = this.$router.resolve({name: 'RADataSourceList', params: {client_id: client.id}})
          } else if (toChannel === 'ra') {
            route = this.$router.resolve({name: 'RADashboardList', params: {client_id: client.id}})
          } else if (toChannel === 'mt') {
            route = this.$router.resolve({name: 'MTClientDashboard', params: {client_id: client.id}})
          } else if (toChannel === 'dc') {
            route = this.$router.resolve({name: 'DCClientDashboard', params: {client_id: client.id}})
          } else if (toChannel === 'tr') {
            route = this.$router.resolve({name: 'DTDHome', params: {client_id: client.id}})
          } else if (toChannel === 'pf') {
            route = this.$router.resolve({name: 'PFAnalysis', params: {client_id: client.id}})
          } else if (toChannel === 'skuflex') {
            route = this.$router.resolve({name: 'SKUFAnalysis', params: {client_id: client.id}})
          } else if (toChannel === 'sa') {
            route = this.$router.resolve({name: 'SAAnalysis', params: {client_id: client.id}})
          } else {
            route = this.$router.resolve({name: 'ps-dashboard-no-module', params: {client_id: client.id}})
          }
        } else {
          route = this.$router.resolve({name: 'ps-dashboard-no-module', params: {client_id: client.id}})
        }
        // open new tab
        this.$refs.clientLink[index].$el.href = route.href
        this.$refs.clientLink[index].$el.click()
      }
    },
    editClient(e, clientID) {
      e.stopPropagation()
      this.hideDropdown()
      this.$router.push({ name: 'ps-ClientSettings', params: { id: clientID } })
    },
    getProfileInfo() {
      apiUser
        .getProfileInfo()
        .then((response) => {
          this.addNewAvatarURL(response.avatar)
          this.updateUserInfo({'user_id': response.pk, 'can_create_client': response.can_create_client})
          this.canCreateClient = response.can_create_client
        })
        .catch(() => {
          console.log('error')
        })
    },
    hideDropdown () {
      this.$refs.clientDropdown.$children[0].hide()
    },
    getOrgList () {
      getOrgsAndClientsApi().then((response) => {
        if (response && response.results) {
          this.saveOrgs({orgs: response.results, enableAutoPickClient: this.enableAutoPickFirstClientID})
        }
      }).catch(() => {})
    },
    canAccess (org) {
      const validRoles = ['OWNER', 'ADMIN', 'STAFF']
      return org.organization && org.organization.has_access && org.organization.role && validRoles.includes(org.organization.role.key)
    },
    canOpenSetting (orgRole, clientRole) {
      return (clientRole.key && (clientRole.key === 'OWNER' || clientRole.key === 'ADMIN')) ||
        (orgRole.key && (orgRole.key === 'OWNER' || orgRole.key === 'ADMIN'))
    },
    switchToOrg (orgData) {
      let isStillInCurrentOrg = this.currentOrg.id === orgData.organization.id
      let data = {
        role: orgData.organization.role.key || '',
        id: orgData.organization.id || ''
      }
      if (!isStillInCurrentOrg) {
        this.saveCurrentOrg(data)
        this.resetClient()
      }
    }
  },
  created () {
    this.getProfileInfo()
    this.currentClientID = this.currentClientFromStore.id || ''
    // call api to get orgs
    this.getOrgList()
    // reload data after confirm noti
    this.$bus.$on('ps_reload_data', () => {
      this.getOrgList()
    })
  },
  watch: {
    async $route (to, from) {
      const fromClientId = from.params.client_id ? from.params.client_id : from.params.id
      const toClientId = to.params.client_id ? to.params.client_id : to.params.id
      if (fromClientId !== toClientId) {
        await this.changeClient({ clientID: toClientId, userID: this.getUserID })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'DefaultHeaderDropdownAccnt.scss';
.hand-pointer{
  cursor: pointer;
}
.is-current-id{
  pointer-events: none;
}
.toggle-margin {
  margin-right: 12px;
}
</style>
