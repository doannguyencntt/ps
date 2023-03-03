<template>
  <b-card>
    <div slot="header">
      <b-row align-v="center">
        <b-col class="col-6">
          <span>
            <strong>Workspaces</strong>
          </span>
        </b-col>
        <b-col class="col-6 text-right">
          <!-- canCreateWorkspace get from mixins -->
          <b-button variant="primary" size="sm"
                    v-if="userRole !== 'CLIENT' && canCreateWorkspace"
                    @click="$router.push({name: 'ps-AddClient', params: {orgId: currentOrgId}})"
          >
            <i class="icons icon-plus"></i> Create
          </b-button>
        </b-col>
      </b-row>
    </div>
    <b-row class="justify-content-center">
      <b-col md="3" class="pl-5">
        <b-form-select v-if="isMultiApp" v-model="dataFilter.app_profile" :options="filteredListApplication" @change="searchWorkspace()"
                       text-field="name"></b-form-select>
      </b-col>
      <b-col md="2">
        <b-form-select v-if="isMultiMod" v-model="dataFilter.module" :options="filteredListModules" @change="searchWorkspace()" text-field="name"></b-form-select>
      </b-col>
      <b-col md="2">
        <b-form-select v-model="dataFilter.status" :options="WORKSPACE_STATUS" @change="searchWorkspace()" text-field="name"></b-form-select>
      </b-col>
      <b-col md="4" class="mt-0 mb-4">
        <b-form-group class="mb-0 flex-fill">
          <b-input-group class="search cancel-action">
            <b-form-input
              v-model="dataFilter.key"
              @keypress.enter="searchWorkspace()"
              placeholder="Enter workspace name">
            </b-form-input>
            <i
              v-show="dataFilter.key"
              @click="dataFilter.key = '';searchWorkspace()"
              class="icon-close cancel-icon"></i>
            <b-input-group-append>
              <b-button @click="searchWorkspace()">
                <i class="icons icon-magnifier"></i>
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col :cols="$route.params.clientId ? 8 : 12">
        <b-table
          show-empty
          hover
          outlined
          striped
          responsive="sm"
          thead-class="thead-light"
          :items="workspaces"
          :fields="fields"
          id="client-table"
          class="client-table"
          :tbody-tr-class="rowClass"
          :class="{'table-blur': $route.params.clientId}"
        >
          <template v-slot:empty>
            <div class="text-center py-2" v-if="workspaceLoading">
              <i class="fa fa-circle-o-notch fa-spin"></i>
              Loading...
            </div>
            <div class="align-middle d-flex justify-content-center align-items-center" v-else>No workspaces</div>
          </template>
          <template v-slot:cell(active)="data">
            <b-badge variant="success" v-if="data.item && data.item.active">Enabled</b-badge>
            <b-badge variant="dark" v-else>Pending</b-badge>
          </template>
          <template v-slot:cell(action)="data">
            <!--Manage dropdown-->
            <!-- <b-dropdown variant="primary" size="sm" class="mr-1">
              <template slot="button-content">
                <i class="icon-settings"></i> Manage
              </template>
              <b-dropdown-item-button class="btn-sm p-0"
                                      :disabled="!data.item || !data.item.has_access"
                                      @click="getModules(data.item.id)"
              >
                <span class="text"><i class="icons icon-grid small-icon"></i> Modules</span>
              </b-dropdown-item-button>
              <b-dropdown-item-button class="btn-sm p-0"
                                      @click="getApplications(data.item.id)"
                                      v-if="isMultiApp && (userRole === 'ADMIN' || userRole === 'OWNER' || (data.item.owner.email === userEmailFromStore && !data.item.active))"
              >
                <span class="text"><i class="icons icon-list small-icon"></i> Applications</span>
              </b-dropdown-item-button>
              <b-dropdown-item-button class="btn-sm p-0"
                                      @click="$router.push({name: 'ps-EditClient', params: {orgId: currentOrgId, clientId: data.item.id}})"
                                      v-if="userRole === 'ADMIN' || userRole === 'OWNER' || (data.item.owner.email === userEmailFromStore && !data.item.active)"
              >
                <span class="text"><i class="icons icon-pencil small-icon"></i> Edit</span>
              </b-dropdown-item-button>
              <b-dropdown-item-button class="btn-sm p-0"
                                      @click="actionData=data.item" v-b-modal.remove
                                      v-if="userRole === 'ADMIN' || userRole === 'OWNER' || (data.item.owner.email === userEmailFromStore && !data.item.active)"
              >
                <span class="text"><i class="icons icon-close small-icon"></i> Remove</span>
              </b-dropdown-item-button>
            </b-dropdown> -->
            <b-dropdown variant="primary" size="sm" split text="Edit" v-if="userRole === 'ADMIN' || userRole === 'OWNER' || (data.item.owner.email === userEmailFromStore && !data.item.active)" @click="$router.push({name: 'ps-EditClient', params: {orgId: currentOrgId, clientId: data.item.id}})" class="drp-actions">
              <b-dropdown-item :disabled="!data.item || !data.item.has_access" @click="getModules(data.item.id)">
                <i class="icon-grid cls-icon-grid"></i>Modules
              </b-dropdown-item>
              <b-dropdown-item @click="getApplications(data.item.id)" v-if="isMultiApp && (userRole === 'ADMIN' || userRole === 'OWNER' || (data.item.owner.email === userEmailFromStore && !data.item.active))">
                <i class="icon-list cls-icon-list"></i>Applications
              </b-dropdown-item>
              <b-dropdown-item variant="danger" v-if="userRole === 'ADMIN' || userRole === 'OWNER' || (data.item.owner.email === userEmailFromStore && !data.item.active)" @click="actionData=data.item" v-b-modal.remove>
                <i class="icon-trash cls-icon-trash"></i>Remove
              </b-dropdown-item>
            </b-dropdown>
            <b-button variant="warning"
                      v-if="(userRole === 'ADMIN' || userRole === 'OWNER') && !data.item.active"
                      class="mr-1" size="sm"
                      @click="approveClient(data.item)"
            >
              <i class="icons icon-check"></i> Approve
            </b-button>
          </template>
        </b-table>
        <!-- <b-alert show v-else-if="isWorkspaceInitialized">No workspaces</b-alert> -->
        <nav class="d-flex justify-content-center">
          <b-pagination @click.native="goToPage" v-if="totalRows > dataFilter.limit" :total-rows="totalRows"
                        :per-page="dataFilter.limit" v-model="dataFilter.page" prev-text="Prev" next-text="Next"
                        hide-goto-end-buttons />
        </nav>
      </b-col>
      <b-col cols="4" v-if="$route.params.clientId">
        <router-view />
      </b-col>
    </b-row>
    <div v-if="workspaces && workspaces.length && !canCreateWorkspace">
      <p class="text-danger text-center mb-0">
        You already create max number of workspaces. Please
        <router-link :to="{name: 'ps-BillingPlans', params: { orgId: $route.params.orgId }}">
          change your plan
        </router-link>
        in order to have more capabilities.
      </p>
    </div>
    <b-modal
      id="remove"
      title="Please confirm"
      centered
      @ok="removeWorkspace()"
      @cancel="actionData=null"
    >
      Are you sure you want to remove this workspace?
      <template slot="modal-footer" slot-scope="{ok, cancel}">
        <b-button variant="warning" @click="ok()">
          <i class="icon-check"></i> Yes, I understand &amp; confirm!
        </b-button>
        <b-button variant @click="cancel()">
          <i class="icon-close"></i> No
        </b-button>
      </template>
    </b-modal>
  </b-card>
</template>

<script>
import apiClient from '@/services/client'
import vToast from '@/shared/notification'
import pageAction from '@/shared/page-action'
import commons from '@/shared/mixins'
import { mapActions, mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import { approvePendingWorkspace, getUserInfoInOrgApi } from '@/services/userOrg'
import trim from 'lodash/trim'
import { checkingWorkspacePermission } from '@/components/CustomPermission/billingMixin'

export const WORKSPACE_STATUS = [
  {
    value: null,
    name: 'All Status'
  }, {
    value: 'enabled',
    name: 'Enabled'
  }, {
    value: 'pending',
    name: 'Pending'
  }
]
export const LIST_APPLICATION = [
  {
    value: null,
    name: 'All Applications'
  }, {
    value: 'mwrw',
    name: 'RW/MW'
  }, {
    value: 'matrix',
    name: 'Matrix'
  }, {
    value: 'data_central',
    name: 'Data Central'
  }, {
    value: 'precise_financial',
    name: 'Precise Financial'
  }, {
    value: 'transit',
    name: '2D Transit'
  }, {
    value: 'skuflex',
    name: 'SKUF Module'
  }, {
    value: 'sa',
    name: 'Super Admin'
  }
]
export const LIST_MODULES = [
  {
    value: null,
    name: 'All Modules',
    appName: 'all'
  }, {
    value: 'MAP',
    name: 'MAP Watcher',
    appName: 'mwrw'
  },
  // Remove RW Module
  // }, {
  //   value: 'ROG',
  //   name: 'Rogue Watcher'
  // }, {
  {
    value: 'DS',
    name: 'Data Sources',
    appName: 'matrix'
  }, {
    value: 'RA',
    name: 'Reporting Application',
    appName: 'matrix'
  }, {
    value: 'MT',
    name: 'Matrix',
    appName: 'matrix'
  }, {
    value: 'DC',
    name: 'Data Central',
    appName: 'data_central'
  }, {
    value: 'PF',
    name: 'Precise Financial',
    appName: 'precise_financial'
  }, {
    value: 'TR',
    name: '2D Transit',
    appName: 'transit'
  }, {
    value: 'SKUF',
    name: 'SKUF Module',
    appName: 'skuflex'
  }, {
    value: 'SA',
    name: 'Super Admin',
    appName: 'sa'
  }
]

export default {
  name: 'OrgClients',
  data: () => {
    return {
      WORKSPACE_STATUS,
      LIST_APPLICATION,
      LIST_MODULES,
      searchTimer: null,
      isWorkspaceInitialized: false,
      currentOrgId: '',
      workspaceData: {},
      workspaces: [],
      dataFilter: {
        page: 1,
        limit: 250,
        key: '',
        status: null,
        app_profile: null,
        module: null
      },
      fields: [
        {
          key: 'name',
          label: 'Name',
          class: 'vertical-content workspace-name'
        },
        {
          key: 'active',
          label: 'Status',
          class: 'status-td vertical-content'
        },
        {
          key: 'createDetails',
          label: 'Created',
          class: 'created-td vertical-content'
        },
        {
          key: 'action',
          label: 'Actions',
          class: 'action-td vertical-content'
        }
      ],
      dialog: {
        remove: false
      },
      actionData: null,
      userRole: '',
      appProfile: process.env.VUE_APP_PS_BUILD_APP,
      workspaceLoading: false
    }
  },
  mixins: [vToast, pageAction, commons, checkingWorkspacePermission(false)],
  computed: {
    totalRows: function() {
      return this.workspaceData.count ? this.workspaceData.count : 0
    },
    ...mapGetters({
      userIdFromStore: `ps/userModule/${TYPE.GET_USER_ID}`,
      userEmailFromStore: `ps/userModule/${TYPE.GET_USER_EMAIL}`
    }),
    filteredListModules() {
      // get all module for specific app name
      return this.LIST_MODULES.filter(mod => mod.appName === 'all' || mod.appName === this.appProfile)
    },
    filteredListApplication() {
      // get all applications for specific app name
      return this.LIST_APPLICATION.filter(app => !app.value || app.value === this.appProfile)
    },
    isMultiApp() {
      return this.filteredListApplication.length > 2
    },
    isMultiMod() {
      return this.filteredListModules.length > 2
    }
  },
  mounted() {
    if (this.$route.query.page) this.dataFilter.page = this.$route.query.status
    if (this.$route.query.status) this.dataFilter.status = this.$route.query.status
    if (this.$route.query.module) this.dataFilter.module = this.$route.query.module
    if (this.$route.query.search) this.dataFilter.key = this.$route.query.search
  },
  methods: {
    ...mapActions({
      updateClientOrgInStore: `ps/userModule/${TYPE.UPDATE_CLIENT_ORG}`,
      addClientOrgToStore: `ps/userModule/${TYPE.ADD_CLIENT_ORG}`
    }),
    getWorkspacesInOrg(orgId) {
      this.workspaceLoading = true
      apiClient.getWorkspacesByOrg(orgId, this.dataFilter).then(response => {
        if (response) {
          // Generate details for Created column
          for (let workspace of response.results) {
            console.log('TCL: getWorkspacesInOrg -> workspace', workspace.owner)
            let nameOwner = workspace.owner.first_name || workspace.owner.last_name ? workspace.owner.first_name + ' ' + workspace.owner.last_name : workspace.owner.email
            let createDate = workspace.created
            workspace.createDetails = `${this.$moment(createDate).fromNow(false)} by ${trim(nameOwner)}`
          }
          this.workspaceData = response
          this.workspaces = response.results || []
          this.isWorkspaceInitialized = true
        }
        if ((!this.workspaces.length && this.$route.params.clientId) ||
          (this.actionData && this.actionData.id === this.$route.params.clientId)) {
          this.$router.push({ name: 'ps-OrgClients', params: { orgId } })
        }
        this.actionData = null
      }).finally(() => {
        this.workspaceLoading = false
      })
    },
    removeWorkspace() {
      const clientID = this.actionData && this.actionData.id ? this.actionData.id : ''
      if (this.currentOrgId && clientID) {
        apiClient.deleteWorkspaceInOrg(this.currentOrgId, clientID).then(response => {
          // update store
          // this.updateClientOrgInStore({orgId: this.currentOrgId, client: {id: clientID}, type: 'delete'})
          this.$bus.$emit('ps_reload_data')
          this.vToasted('success', 'This workspace is deleted successfully')
          this.getWorkspacesInOrg(this.currentOrgId)
        }).catch(() => {
          this.vToasted('error', 'There is a problem when delete this workspace. Please try again or contact administrator.')
          this.closeModal()
        })
      } else {
        this.vToasted('error', 'Something went wrong!')
        this.closeModal()
      }
    },
    closeModal() {
      this.actionData = null
    },
    goToPage() {
      this.getWorkspacesInOrg(this.currentOrgId)
    },
    getModules(clientId) {
      this.$router.push({ name: 'ps-OrgModules', params: { orgId: this.currentOrgId, clientId } })
    },
    getApplications(clientId) {
      this.$router.push({ name: 'ps-Applications', params: { orgId: this.currentOrgId, clientId } })
    },
    rowClass(item, type) {
      if (this.$route.params.clientId && item.id === this.$route.params.clientId) {
        return 'active'
      } else {
        return ''
      }
    },
    approveClient(client) {
      if (client && client.id && this.currentOrgId) {
        approvePendingWorkspace(this.currentOrgId, client.id).then((response) => {
          this.vToasted('success', 'The workspace has been approved successfully.')
          // update client in store
          client.active = true
          this.addClientOrgToStore({ orgId: this.currentOrgId, client })
          this.reloadPage()
        }).catch(() => {
          this.vToasted('error', 'There is a problem when approve this workspace. Please try again or contact administrator.')
        })
      }
    },
    getOrgRole() {
      if (this.userIdFromStore) {
        getUserInfoInOrgApi(this.currentOrgId, this.userIdFromStore).then(response => {
          if (response && response.role) {
            this.userRole = response.role && response.role.key ? response.role.key : ''
          }
        }).catch(() => {
          this.userRole = ''
        })
      }
    },
    searchWorkspace() {
      this.getWorkspacesInOrg(this.currentOrgId)
      const query = {
        page: this.dataFilter.page,
        search: this.dataFilter.key.trim() !== '' ? this.dataFilter.key.trim() : undefined
      }
      if (this.dataFilter.status) query.status = this.dataFilter.status
      if (this.dataFilter.module) query.module = this.dataFilter.module
      this.$router.push({
        params: {orgId: this.currentOrgId},
        query
      })
    }
  },
  created() {
    this.currentOrgId = this.$route.params.orgId
    if (this.currentOrgId) {
      this.getWorkspacesInOrg(this.currentOrgId)
      // get role
      this.userRole = this.getOrgRole()
    }
    this.dataFilter.app_profile = process.env.VUE_APP_PS_BUILD_APP
  },
  watch: {
    '$route.params.orgId'(newVal, oldVal) {
      this.currentOrgId = this.$route.params.orgId
      if (this.currentOrgId) {
        this.getWorkspacesInOrg(this.currentOrgId)
        // get role
        this.userRole = this.getOrgRole()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.table-blur {
  tr {
    &.active {
      border: 3px solid #187da0;

      td {
        opacity: 1;
      }
    }

    td {
      opacity: 0.6;
    }

    td:last-child {
      opacity: unset;
    }
  }
}

.client-table ::v-deep {
  thead {
    .action-td {
      width: 90px;
      white-space: nowrap;
    }

    .created-td {
      min-width: 180px;
    }
  }

  .vertical-content {
    vertical-align: middle;
  }

  .workspace-name {
    word-break: break-all;
  }

  .badge {
    line-height: 18px;
    padding: 0 0.4em;
    display: inline-block;
  }

  tr {
    &.active {
      border: 3px solid #187da0;
    }

    .action-td {
      white-space: nowrap;
    }
  }
}

.img.img__circle {
  border-radius: 50%;
}

.dropdown-menu {
  min-width: 0;
}

.small-icon {
  font-size: 0.76rem;
}

.col-6 ::v-deep {
  > .table-responsive-sm {
    > .client-table {
      thead {
        .status-td {
          width: 75px;
        }

        .action-td {
          width: 70px;
          white-space: nowrap;
        }
      }
    }
  }
}

.cancel-icon {
  min-width: 5px;
  position: absolute;
  z-index: 10;
  top: 10px;
  right: 50px
}

.drp-actions ::v-deep {
  .dropdown-menu {
    min-width: 50%;
    height: auto;
    .cls-icon-trash {
      color: #DC3545;
      margin-right: 5px;
    }
    .cls-icon-grid, .cls-icon-list {
      color: #23282c;
      margin-right: 5px;
    }
    .dropdown-item {
      padding: 6px 15px;
      font-size: 12px;
    }
  }
}
</style>
