 <template>
  <div>
    <b-card>
      <div slot="header">
        <b-row align-v="center">
          <b-col class="col-12 d-flex justify-content-between">
            <div class="d-flex">
              <span class="cls-fullname">
                <strong>Change access of {{ fullName }}</strong>
              </span>
              <div class="d-flex" v-if="clientsAccess.length > 0 && $route.params.clientId">
                <span class="cls-fullname mx-1">
                  <strong>on</strong>
                </span>
                <b-form-select class="form-control mr-1" v-model="selectedWorkspace" @change="chooseWorkspace()">
                  <template slot="first">
                    <option :value="null" disabled>Select workspace</option>
                  </template>
                  <option v-for="client in clientsAccess" :key="client.id" :value="client.id">
                    {{ client.name }}
                  </option>
                </b-form-select>
              </div>
            </div>
            <div class="pull-right cls-btn-back">
              <b-button class="btn btn-secondary btn-sm"
                @click="goBack()">
                <i class="icon-arrow-left-circle"></i> Back
              </b-button>
            </div>
          </b-col>
        </b-row>
      </div>
      <div>
        <b-alert v-model="showAlert" variant="danger" dismissible>
          This is a client user, please be careful on assignment to make sure this one would be assigned to their correct workspace.
        </b-alert>
      </div>
      <b-row>
        <b-col cols="6" v-if="!$route.params.clientId">
          <table class="table b-table table-striped table-hover border" :class="{'table-blur': $route.query.clientId}">
            <tbody v-if="clients && clients.length">
              <tr v-if="orgRole && orgRole !== 'CLIENT'">
                <td colspan="2">
                  <div class="text-right select-group"
                    :class="{'disabled': fullAccess}"
                  >
                    <span class="fake-link" @click="selectAll">Select All</span>
                    <span class="fake-link pl-2" @click="deselectAll">Deselect All</span>
                  </div>
                </td>
              </tr>
              <tr v-for="(client, index) in clients" :key="index" :class="{'active': client.id === $route.query.clientId}">
                <td class="align-middle">{{ client.name }}</td>
                <td class="text-right align-middle btn-permissions">
                  <b-form-checkbox
                    v-model="client.has_access"
                    name="checkbox"
                    @change.native="checkBeforeUpdate(client)"
                    :disabled="fullAccess"
                  ></b-form-checkbox>
                  <b-button size="sm" variant="warning"
                    class="mr-1"
                    :disabled="!client.has_access"
                    @click="goToUserPermissionPage(client.id)">
                    <i class="icons icon-lock"></i> Permissions
                  </b-button>
                </td>
              </tr>
            </tbody>
          </table>
        </b-col>
        <b-col cols="12" v-else>
          <router-view />
        </b-col>
      </b-row>
    </b-card>
    <!--Confirm modal-->
    <b-modal
      v-model="showConfirm"
      centered title="Please confirm"
      @ok="updateUserAccess()"
      @cancel="resetData()"
    >
      Assign {{ updatedClient && updatedClient.name ? updatedClient.name : '' }} workspace to the external user {{userData.email ? userData.email : 'User' }}?
      <template
        slot="modal-header-close"
      >
        <button type="button" aria-label="Close" class="close" @click="resetData()">x</button>
      </template>
      <template
        slot="modal-footer"
        slot-scope="{ ok, cancel }"
      >
        <b-button size="md" variant="warning" @click="ok()">
          <i class="icon-check icons"></i> Yes, I understand & confirm!
        </b-button>
        <b-button size="md" variant="secondary" @click="cancel()">
          <i class="icon-close icons"></i> No
        </b-button>
      </template>
    </b-modal>
    <!--/ Confirm modal-->
  </div>
</template>

<script>
import { getUserAccessInOrgApi, getUserInfoInOrgApi, updateUserAccessInOrgApi } from '@/services/userOrg'
export default {
  name: 'OrgUserPermission',
  data() {
    return {
      selectedClients: [],
      orgId: '',
      userId: '',
      userData: {
        first_name: '',
        last_name: ''
      },
      clients: [],
      pagination: {
        page: 1,
        limit: 250
      },
      orgRole: '',
      showAlert: false,
      showConfirm: false,
      updatedClient: null,
      selectedWorkspace: null,
      clientId: null
    }
  },
  computed: {
    fullName: function() {
      return this.userData ? this.userData.first_name && this.userData.last_name ? `${this.userData.first_name} ${this.userData.last_name}` : this.userData.email ? `${this.userData.email}` : `User ` : `User`
    },
    fullAccess () {
      return this.orgRole === 'ADMIN' || this.orgRole === 'OWNER'
    },
    clientsAccess () {
      return this.clients.filter(item => item.has_access === true)
    }
  },
  mounted() {
    this.orgId = this.$route.params.orgId
    this.userId = this.$route.params.userId
    this.clientId = this.$route.params.clientId
    if (this.orgId && this.userId) {
      this.getClientsWithAccess(this.orgId, this.userId)
      this.getUserData(this.orgId, this.userId)
    }
    if (this.clientId) {
      this.selectedWorkspace = this.clientId
    }
  },
  methods: {
    getClientsWithAccess (orgId, userId) {
      getUserAccessInOrgApi(orgId, userId, this.pagination).then(response => {
        this.clients = response.results || []
        this.orgRole = this.clients && this.clients[0] ? this.clients[0].has_access_with_role : ''
        if (this.orgRole && this.orgRole === 'CLIENT') this.showAlert = true
      }).catch(() => {})
    },
    getUserData (orgId, userId) {
      getUserInfoInOrgApi(orgId, userId).then(response => {
        this.userData = response.user || {}
      }).catch(() => {})
    },
    checkBeforeUpdate (client) {
      this.updatedClient = {...client}
      if (this.updatedClient && this.updatedClient.has_access && this.updatedClient.has_access_with_role === 'CLIENT') {
        this.showConfirm = true
      } else {
        this.showConfirm = false
        this.updateUserAccess()
      }
    },
    resetData () {
      this.clients.some((client) => {
        if (client.id === this.updatedClient.id) {
          client.has_access = !client.has_access
          return true
        }
      })
      this.updatedClient = null
    },
    updateUserAccess () {
      const data = {
        client_ids: [this.updatedClient.id],
        has_access: this.updatedClient.has_access
      }
      updateUserAccessInOrgApi(this.orgId, this.userId, data).then(response => {
        // update table
        this.getClientsWithAccess(this.orgId, this.userId)
        if (this.updatedClient.has_access === false && this.$route.params.clientId && this.$route.params.clientId === this.updatedClient.id) {
          this.$router.push({name: 'ps-OrgClientAccess', params: {orgId: this.orgId, userId: this.userId}})
        }
      }).catch(() => {})
    },
    selectAll () {
      if (this.clients && this.clients.length) {
        const clientIds = this.clients.map(client => client.id)
        const data = {
          client_ids: clientIds,
          has_access: true
        }
        updateUserAccessInOrgApi(this.orgId, this.userId, data).then(response => {
          this.clients.forEach((client) => {
            client.has_access = true
          })
        }).catch(() => {})
      }
    },
    deselectAll () {
      if (this.clients && this.clients.length) {
        const clientIds = this.clients.map(client => client.id)
        const data = {
          client_ids: clientIds,
          has_access: false
        }
        updateUserAccessInOrgApi(this.orgId, this.userId, data).then(response => {
          this.clients.forEach((client) => {
            client.has_access = false
          })
          if (this.$route.params.clientId) {
            this.$router.push({name: 'ps-OrgClientAccess', params: {orgId: this.orgId, userId: this.userId}})
          }
        }).catch(() => {})
      }
    },
    goToUserPermissionPage (clientId) {
      if (clientId) {
        this.$router.push({name: 'ps-OrgUserPermissions', params: {orgId: this.orgId, userId: this.userId, clientId}})
        this.selectedWorkspace = clientId
      }
    },
    goBack () {
      if (window.history.length > 1) {
        this.$router.back()
      } else if (this.$route.params.clientId) {
        this.$router.push({
          name: 'ps-OrgClientAccess',
          params: {orgId: this.orgId, userId: this.userId},
          query: {clientId: this.$route.params.clientId}
        })
      } else {
        if (this.$route.query.user_type === 'org') {
          this.$router.push({name: 'ps-OrgUsers', params: {orgId: this.orgId, type: 'org'}})
        } else {
          this.$router.push({name: 'ps-OrgUsers', params: {orgId: this.orgId, type: 'client'}})
        }
      }
    },
    chooseWorkspace() {
      this.$router.replace({name: 'ps-OrgUserPermissions', params: {orgId: this.orgId, userId: this.userId, clientId: this.selectedWorkspace}})
    }
  },
  watch: {
    '$route.params.orgId' (newVal) {
      this.orgId = newVal
      if (this.orgId && this.userId) {
        this.getClientsWithAccess(this.orgId, this.userId)
        this.getUserData(this.orgId, this.userId)
      }
    },
    '$route.params.userId' (newVal) {
      this.userId = newVal
      if (this.orgId && this.userId) {
        this.getClientsWithAccess(this.orgId, this.userId)
        this.getUserData(this.orgId, this.userId)
      }
    },
    '$route.params.clientId' (newVal) {
      this.clientId = newVal
      if (this.clientId) {
        this.selectedWorkspace = this.clientId
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/scss/Table.scss';
  .select-group {
    padding-right: 8px;
    &.disabled {
      .fake-link {
        cursor: not-allowed;
        opacity: 0.8;
        pointer-events: none;
      }
    }
  }
  .cls-fullname {
    position: relative;
    top: 7px;
  }
  .cls-btn-back {
    position: relative;
    top: 3px;
  }
</style>
