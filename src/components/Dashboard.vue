<template>
  <div class="bg-inherit">
    <div class="align-middle d-flex justify-content-center align-items-center spinner-container" v-if="isLoadingWorkspace">
        <div class="spinner-border thin-spinner spinner-border-sm thin-spinner"></div>&nbsp;Loading...
    </div>
    <template v-else>
      <div v-if="filterList && filterList.length > 0" class="radio-action">
        <b-form-radio-group
          @change="onChangeViewOption"
          style="text-align: right"
          v-model="selectedView"
          :options="viewOptions"
          class="mb-3"
          value-field="item"
          text-field="name"
          html-field="html"
        ></b-form-radio-group>
      </div>
      <div class="bg-inherit" v-if="filterList && filterList.length > 0">
        <div
          class="org-group bg-inherit"
          v-for="(org, index) in filterList"
          :key="index"
          >
          <h4
            class="org-name mb-3 pb-3 d-flex justify-content-between align-items-center"
          >
            {{ org.organization.name }}
            <div class="d-flex">
              <b-col md="3" lg="2" class="mt-0" v-if="org.total > 2" style="display: contents">
                <b-form-group class="mb-0">
                  <b-input-group class="search cancel-action">
                    <b-form-input placeholder="Search" :value="searchByIndex(index)" @input="updateSearch($event, index)">
                    </b-form-input>
                      <i class="icon-close cancel-icon" v-show="searchByIndex(index)" @click="resetFilter(index)"></i>
                    <b-input-group-append>
                      <b-button>
                        <i class="icons icon-magnifier"></i>
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-button
                size="sm"
                class="pull-right btn-manage"
                @click="
                  switchToOrg(org),
                    $router.push({
                      name: 'ps-OrgClients',
                      params: { orgId: org.organization.id }
                    })
                "
                v-if="canAccess(org)"
              >
                <i class="icon-settings"></i> Manage
              </b-button>
            </div>
          </h4>
          <component
            :is="getClientsView"
            :org="org"
            :isSystemInternalUsers="isSystemInternalUsers"
          />
        </div>
      </div>
      <div class="style-text" v-else-if="isWorkspaceInitialized">
        <b-card>
          <div class="d-flex">
            <div class="w-100">
              <h3>
                You do not have any
                {{
                  canCreateOrganization ? 'organizations.' : 'client workspaces.'
                }}
              </h3>
              <p style="margin-bottom: 0">
                Please create your first one or ask
                {{ canCreateOrganization ? 'an organization' : 'a workspace' }} admin
                to let you in.
              </p>
            </div>
            <div class="d-flex align-items-center">
              <b-button
                v-if="canCreateClient && currentOrgFromStore.id"
                class="wp-nowrap mr-1"
                variant="warning"
                right
                @click="
                  $router.push({
                    name: 'ps-AddClient',
                    params: { orgId: currentOrgFromStore.id }
                  })
                "
              >
                <i class="icon-sun"></i> Create your own workspace
              </b-button>
              <b-button
                v-if="canCreateOrganization"
                class="wp-nowrap"
                variant="warning"
                right
                @click="$router.push({ name: 'ps-AddOrg' })"
              >
                <i class="icon-sun"></i> Create your own organization
              </b-button>
            </div>
          </div>
        </b-card>
      </div>
    </template>
  </div>
</template>

<script>
import '@/assets/scss/_custom.scss'
import * as TYPE from '@/store/_constant'
import { mapActions, mapGetters } from 'vuex'
import { modules } from '@/shared/utils'
import { getOrgsAndClientsApi } from '@/services/organization'
import {
  checkingOrganizationPermission,
  checkingWorkspacePermission
} from '@/components/CustomPermission/billingMixin'
import vToast from '@/shared/notification'
import { googleAnalyticsEventMixins } from '@/shared/googleAnalyticsMixins'
import ClientsGridView from './Dashboard/ClientsGridView'
import ClientsListView from '@/components/Dashboard/ClientsListViews'

export default {
  name: 'Dashboard',
  components: { ClientsGridView, ClientsListView },
  data: () => {
    return {
      selectedView: null,
      viewOptions: [
        {
          item: 'ClientsGridView',
          name: 'Grid',
          html: '<i class="fa fa-th" aria-hidden="true"></i>'
        },
        {
          item: 'ClientsListView',
          name: 'List',
          html: '<i class="fa fa-list" aria-hidden="true"></i>'
        }
      ],
      workspaceData: null,
      isCheckingRole: true,
      isWorkspaceInitialized: false,
      appProfile: process.env.VUE_APP_PS_BUILD_APP || '',
      appModules: {},
      modules,
      defaultColor: '#1985ac'
    }
  },
  mixins: [
    checkingWorkspacePermission(),
    checkingOrganizationPermission(),
    googleAnalyticsEventMixins(),
    vToast
  ],
  computed: {
    ...mapGetters({
      canCreateClient: `ps/userModule/${TYPE.CAN_CREATE_CLIENT}`,
      getUserId: `ps/userModule/${TYPE.GET_USER_ID}`,
      currentOrgFromStore: `ps/userModule/${TYPE.GET_CURRENT_ORG}`,
      orgsFromStore: `ps/userModule/${TYPE.GET_ORGS_BY_USER}`,
      isSystemInternalUsers: `ps/userModule/${TYPE.GET_USER_EMAIL}`,
      ClientsViewOptionFromStore: `ps/userPreferencesModule/${
        TYPE.GET_CLIENTS_VIEW_OPTION
      }`,
      getFilterWorkspace: `ps/userModule/${TYPE.GET_FILTER_WORKSPACE}`,
      searchByIndex: `ps/userModule/${TYPE.SEARCH_INDEX}`,
      isLoadingWorkspace: `ps/userModule/${TYPE.GET_LOADING_WORKSPACE}`
    }),
    getClientsView() {
      switch (this.selectedView) {
        case 'ClientsGridView':
          return ClientsGridView
        case 'ClientsListView':
          return ClientsListView
        default:
          return ClientsListView
      }
    },
    filterList() {
      return this.getFilterWorkspace
    }
  },
  created() {
    this.appModules =
      modules && modules[this.appProfile] ? modules[this.appProfile] : {}
    this.getOrgs()
    this.$bus.$on('ps_reload_data', () => {
      this.getOrgs()
    })
    this.selectedView = this.ClientsViewOptionFromStore
    this.listWorkspace()
    this.setDefaultSearch()
  },
  methods: {
    ...mapActions({
      resetClient: `ps/userModule/${TYPE.RESET_CLIENT}`,
      saveCurrentOrg: `ps/userModule/${TYPE.SAVE_CURRENT_ORG}`,
      saveClientsViewOption: `ps/userPreferencesModule/${
        TYPE.SAVE_CLIENTS_VIEW_OPTION
      }`,
      listWorkspace: `ps/userModule/${TYPE.SET_LIST_WORKSPACE}`,
      resetSearch: `ps/userModule/${TYPE.RESET_SEARCH}`,
      setDefaultSearch: `ps/userModule/${TYPE.SET_DEFAULT_SEARCH}`,
      applyWorkspaceFilter: `ps/userModule/${TYPE.APPLY_WORKSPACE_FILTER}`
    }),
    getOrgs() {
      getOrgsAndClientsApi()
        .then((response) => {
          if (response && response.results) {
            this.workspaceData = response.results
          }
          this.isCheckingRole = false
          this.isWorkspaceInitialized = true
        })
        .catch(() => {})
    },
    canAccess(org) {
      const validRoles = ['OWNER', 'ADMIN', 'STAFF']
      return (
        org.organization &&
        org.organization.has_access &&
        org.organization.role &&
        validRoles.includes(org.organization.role.key)
      )
    },
    switchToOrg(orgData) {
      let isStillInCurrentOrg =
        orgData.organization.id === this.currentOrgFromStore.id
      let data = {
        role: orgData.organization.role.key || '',
        id: orgData.organization.id || ''
      }
      if (!isStillInCurrentOrg) {
        this.saveCurrentOrg(data)
        this.resetClient()
      }
    },
    onChangeViewOption(value) {
      this.saveClientsViewOption(value)
    },
    resetFilter(index) {
      this.resetSearch(index)
      const options = { value: '', index: index }
      this.applyWorkspaceFilter(options)
    },
    updateSearch(value, index) {
      const options = { value, index }
      this.applyWorkspaceFilter(options)
    }
  },
  mounted() {
    // View Portal Dashboard - GA
    this.gaHandleViewItem('view_dashboard', 1)
  }
}
</script>

<style lang="scss" scoped>
.bg-btn-dashboard-rw {
  background-image: url('./../assets/img/dashboard/home_rog_widget_bg.png');
  background-repeat: no-repeat;
  background-size: cover;
}

.bg-btn-dashboard-mw {
  background-image: url('./../assets/img/dashboard/home_map_widget_bg.png');
  background-repeat: no-repeat;
  background-size: 100%;
  background-position-y: bottom;
}

.workspace-name {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-block;
  width: 100% !important;
  line-height: 2rem;
  margin: 0;
}

.account_manager {
  font-size: 0.7rem;
}

.btn-full {
  width: 100%;
}

.org-name {
  border-bottom: 1px solid #b7b7b7;
  color: #444;
  font-weight: normal;
}

.btn-manage {
  white-space: nowrap;
  margin-left: 20px;
  height: 35px;
}

.btn-action {
  position: absolute;
  margin-top: auto;
  bottom: 1.25rem;
  width: calc(100% - 2.5rem);

  .btn-module {
    width: 100%;
    border: none;
    background-color: #000;

    i {
      background-color: transparent !important;
    }
  }
}

.wp-nowrap {
  white-space: nowrap;
}

.radio-action::v-deep .custom-control:last-child {
  margin-right: 0 !important;
}
::v-deep .custom-control.custom-control-inline.custom-radio {
  &:hover {
    .custom-control-label::before {
      box-shadow: 0 0 6px darken(#00e1ff, 20%);
    }
  }
}
::v-deep .custom-control.custom-control-inline.custom-radio {
  padding-left: 0.1rem
}
::v-deep label.custom-control-label {
  padding-left: 1rem;
}
::v-deep .custom-control-label::before {
  left: -0.3rem;
}
::v-deep .custom-control-label::after {
  left: -0.3rem;
}
</style>
