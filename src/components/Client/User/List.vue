<template>
  <b-card>
    <div slot="header">
      <b-row align-v="center">
        <b-col class="col-6">
          <span>
            <strong>Users</strong>
          </span>
        </b-col>
        <b-col v-if="checkRole(['ADMIN', 'OWNER'])" class="col-6 text-right">
          <!-- canAddUser get from mixin -->
          <b-button variant="primary" size="sm" v-if="currentClientID && !userId && canAddUser([])" v-on:click="goToInvitePage(currentClientID)">
            <i class="icons icon-cursor"></i> Invite
          </b-button>
          <!-- canAddUser get from mixin -->
          <b-button class="ml-2" variant="primary" size="sm" v-if="currentClientID && !userId && canAddUser([])" v-on:click="goToAddPage(currentClientID)">
            <i class="icons icon-plus"></i> Add
          </b-button>
          <b-button class="btn btn-secondary btn-sm" v-if="userId" @click="back()">
            <i class="icon-arrow-left-circle"></i> Back
          </b-button>
        </b-col>
      </b-row>
    </div>
      <!-- User List -->
        <b-row class="justify-content-center">
          <!-- <b-col class="mb-3" :class="$route.params.userId ? 'col-md-5 col-lg-4 col-xl-3' : 'col-md-4 col-lg-3 col-xl-2'"> -->
          <b-col class="mb-3" md="4" lg="3" xl="2">
            <b-form-select v-model="role_selected" :options="listRole" class="custom-select-width" text-field="name" @change="searchChange()"></b-form-select>
          </b-col>
          <b-col md="5" lg="4" class="mt-0 mb-4">
            <b-form-group class="mb-0">
              <b-input-group class="search cancel-action">
                <b-form-input v-model="search" @keypress.enter=" searchChange()" placeholder="Search for name or email">
                </b-form-input>
                  <i v-show="search"  @click="search = '';searchChange()" class="icon-close cancel-icon"></i>
                <b-input-group-append>
                  <b-button @click="searchChange()">
                    <i class="icons icon-magnifier"></i>
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-col>
        </b-row>
    <b-row>
      <b-col :class="$route.params.userId ? 'col-8' : 'col-12'">
        <b-table
          v-if="userList"
          hover
          outlined
          striped
          responsive="xl"
          thead-class="thead-light"
          :items="userList"
          :fields="getRole.userRole === 'STAFF' ? fields.filter(f => f.key !== 'action') : fields"
          id="user-table"
          :tbody-tr-class="rowClass"
          :class="{'table-blur': $route.params.userId}"
          show-empty
        >
          <template v-slot:cell(userAvatar)="data">
            <img
              :src="data.item.user.avatar || placeholderURL"
              class="img img__circle"
              :alt="data.item.user.first_name"
              width="35"
              height="35"
            />
          </template>
          <template v-slot:cell(userEmail)="data">
            <span v-if="data.item.user.email === getUserEmail">{{ data.item.user.email }} (You)</span>
            <span v-else>{{ data.item.user.email }}</span>
          </template>
          <template v-slot:cell(userEnabled)="data">
            <b-badge variant="dark" v-if="data.item && data.item.status === 'PENDING'">Pending</b-badge>
            <b-badge variant="success" v-else>Enabled</b-badge>
          </template>
          <template v-slot:cell(roleName)="data">
            <span v-if="data.item && data.item.role.name === 'Staff'">User</span>
            <span v-else>{{data.item.role.name}}</span>
          </template>
          <template v-slot:cell(action)="data">
            <!--Manage dropdown-->
            <!-- <b-dropdown
              variant="primary" size="sm" class="mr-1"
              v-if="hasUserAction(isLoginedUser(data.item), getRole.userRole, data.item.role.key, data.item.status)"
            >
              <template slot="button-content">
                <i class="icon-settings"></i> Manage
              </template>
              <b-dropdown-item-button class="btn-sm p-0"
                v-if="compare2Roles(getRole.userRole, data.item.role.key)"
                @click="goToUserPermissionPage(data.item.user.user_id)"
              >
                <span class="text"><i class="icons icon-lock small-icon"></i> Permissions</span>
              </b-dropdown-item-button>
              <b-dropdown-item-button class="btn-sm p-0"
                v-if="compare2Roles(getRole.userRole, data.item.role.key, currentOrg.role) && !isLoginedUser(data.item)"
                @click="goToEditPage(data.item.user.user_id)">
                <span class="text"><i class="icons icon-pencil small-icon"></i> Change base role</span>
              </b-dropdown-item-button>
              <b-dropdown-item-button class="btn-sm p-0"
                @click="actionData=data.item" v-b-modal.resend
                v-if="data.item && data.item.status && data.item.status !== 'MEMBER' && checkRole(['ADMIN', 'OWNER'])"
              >
                <span class="text"><i class="icons icon-cursor"></i> Resend</span>
              </b-dropdown-item-button>
              <b-dropdown-item-button class="btn-sm p-0"
                @click="actionData=data.item" v-b-modal.remove
                v-if="compare2Roles(getRole.userRole, data.item.role.key) && !isLoginedUser(data.item) && data.item.role.key !== 'OWNER'"
              >
                <span class="text"><i class="icons icon-close small-icon"></i> Remove</span>
              </b-dropdown-item-button>
            </b-dropdown> -->
            <b-dropdown variant="primary" size="sm" split text="Permissions" v-if="hasUserAction(isLoginedUser(data.item), getRole.userRole, data.item.role.key, data.item.status) && compare2Roles(getRole.userRole, data.item.role.key)" @click="goToUserPermissionPage(data.item.user.user_id)" class="drp-actions" :class="(compare2Roles(getRole.userRole, data.item.role.key, currentOrg.role) && !isLoginedUser(data.item)) && (data.item && data.item.status && data.item.status !== 'MEMBER' && checkRole(['ADMIN', 'OWNER'])) && (compare2Roles(getRole.userRole, data.item.role.key) && !isLoginedUser(data.item) && data.item.role.key !== 'OWNER') ? '' : 'remove-empty-dropdown'">
              <b-dropdown-item v-if="compare2Roles(getRole.userRole, data.item.role.key, currentOrg.role) && !isLoginedUser(data.item)" @click="goToEditPage(data.item.user.user_id)">
                <i class="icon-pencil cls-icon-pencil"></i>Change base role
              </b-dropdown-item>
              <b-dropdown-item v-if="data.item && data.item.status && data.item.status !== 'MEMBER' && checkRole(['ADMIN', 'OWNER'])" @click="actionData=data.item" v-b-modal.resend>
                <i class="icon-cursor cls-icon-cursor"></i>Resend
              </b-dropdown-item>
              <b-dropdown-item variant="danger" v-if="compare2Roles(getRole.userRole, data.item.role.key) && !isLoginedUser(data.item) && data.item.role.key !== 'OWNER'" @click="actionData=data.item" v-b-modal.remove>
                <i class="icon-trash cls-icon-trash"></i>Remove
              </b-dropdown-item>
            </b-dropdown>
          </template>
          <template v-slot:empty>
          <div class="d-flex justify-content-center align-items-center" v-if="isLoading">
            <div class="spinner-border thin-spinner spinner-border-sm"></div>&nbsp;Loading...
          </div>
          <div class="align-items-center d-flex justify-content-center" v-else>
            <div>There are no users to show.</div>
          </div>
        </template>
        </b-table>
        <b-alert show v-else>No results found</b-alert>
        <nav class="d-flex justify-content-center">
          <b-pagination @click.native="goToPage" v-if="totalRows > dataFilter.limit" :total-rows="totalRows" :per-page="dataFilter.limit" v-model="dataFilter.page" prev-text="Prev" next-text="Next" hide-goto-end-buttons />
        </nav>
      </b-col>
      <!-- Edit role -->
      <b-col class="col-4" v-if="$route.params.userId">
        <router-view />
      </b-col>
    </b-row>
    <div v-if="isAPIReady && !canAddUser([])">
      <p class="text-danger text-center mb-0">
        You already create max number of internal users. Please
        <router-link :to="{name: 'ps-BillingPlans', params: { orgId: _getCurrentOrg.id }}">
          change your plan
        </router-link>
        in order to have more capabilities.
      </p>
    </div>
    <b-modal
        id="resend"
        centered title="Please confirm"
        @ok="resend()"
        @cancel="actionData=null">
      Are you sure you want to resend the invitation email?
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
    <b-modal
        id="remove"
        title="Please confirm"
        centered
        @ok="removeUser()"
        @cancel="actionData=null"
    >
      Are you sure you want to remove this account?
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
import apiUser from '@/services/user'
import apiUserClient from '@/services/userClient'
import vToast from '@/shared/notification'
import pageAction from '@/shared/page-action'
import { mapGetters, mapActions } from 'vuex'
import * as TYPE from '@/store/_constant'
import placeholderURL from '@/assets/img/profile-placeholder.png'
import commons from '@/shared/mixins'
import { checkingUserPermissions } from '@/components/CustomPermission/billingMixin'

export default {
  name: 'UserList',
  data: () => {
    return {
      isAPIReady: false,
      role_selected: null,
      listRole: [
        {
          value: null,
          name: 'All Roles'
        }, {
          value: 'OWNER',
          name: 'Workspace Owner'
        }, {
          value: 'ADMIN',
          name: 'Workspace Admin'
        }, {
          value: 'STAFF',
          name: 'Workspace User'
        }
      ],
      search: '',
      currentClientID: '',
      userData: {},
      userList: [],
      dataFilter: {
        page: 1,
        limit: 10
      },
      fields: [
        {
          key: 'userAvatar',
          label: 'Avatar',
          class: 'vertical-content'
        },
        {
          key: 'user.first_name',
          label: 'First Name',
          class: 'vertical-content'
        },
        {
          key: 'user.last_name',
          label: 'Last Name',
          class: 'vertical-content'
        },
        {
          key: 'userEmail',
          label: 'Email',
          class: 'vertical-content'
        },
        {
          key: 'roleName',
          label: 'Base Role',
          class: 'vertical-content'
        },
        {
          key: 'userEnabled',
          label: 'Status',
          class: 'status-td vertical-content'
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
      placeholderURL: placeholderURL,
      userId: null,
      userRoleInOrg: '',
      isLoading: true
    }
  },
  mixins: [vToast, pageAction, commons, checkingUserPermissions('client')],
  computed: {
    ...mapGetters({
      getUserId: `ps/userModule/${TYPE.GET_USER_ID}`,
      getRole: `ps/userModule/${TYPE.GET_ROLE_INFO}`,
      getUserEmail: `ps/userModule/${TYPE.GET_USER_EMAIL}`,
      currentOrg: `ps/userModule/${TYPE.GET_CURRENT_ORG}`
    }),
    totalRows: function () { return this.userData.count ? this.userData.count : 0 }
  },
  methods: {
    ...mapActions({
      fetchRole: `ps/userModule/${TYPE.FETCH_ROLE_IN_WORKSPACE}`
    }),
    getUserListByClient (clientId) {
      this.isLoading = true
      const filter = {
        ...this.dataFilter,
        key: this.search,
        roles: this.role_selected ? [this.role_selected] : ['OWNER', 'ADMIN', 'STAFF']
      }
      apiUser.getUsersByClientId(clientId, filter).then(response => {
        if (response) {
          this.userData = response
          this.userList = response.results || []
        }
      }).finally(() => {
        this.isAPIReady = true
        this.isLoading = false
      })
    },
    removeUser () {
      const userID = this.actionData && this.actionData.user && this.actionData.user.user_id ? this.actionData.user.user_id : ''
      if (userID && this.currentClientID) {
        apiUserClient.deleteUser(this.currentClientID, userID).then(response => {
          this.vToasted('success', 'This account is deleted successfully')
          this.closeModal()
          this.reloadPage()
        }).catch(() => {
          this.vToasted('error', 'There is a problem when delete this staff. Please try again or contact administrator.')
          this.closeModal()
        })
      } else {
        this.vToasted('error', 'Something went wrong!')
        this.closeModal()
      }
    },
    resend () {
      const email = this.actionData && this.actionData.user && this.actionData.user.email ? this.actionData.user.email : ''
      if (email && this.currentClientID) {
        const data = {
          email: email,
          activation_link_template: window.location.protocol + '//' + window.location.host + '/#/ps/invitation?token={token}'
        }
        apiUser.inviteUser(this.currentClientID, data).then(response => {
          this.vToasted('success', 'The invitation has been resent. Please let that member know to check their inbox.')
          this.getUserListByClient(this.currentClientID)
          this.closeModal()
        }).catch((error) => {
          this.vToasted('error', error.message)
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
    goToPage () {
      this.$router.push({
        params: {id: this.currentClientID},
        query: {
          page: this.dataFilter.page
        }
      })
    },
    isOwnerOrLoginedUser (data) {
      const currentUserEmail = data.user && data.user.email ? data.user.email : ''
      return (data.role && data.role.key && data.role.key === 'OWNER' && data.status === 'MEMBER') || (this.getUserEmail === currentUserEmail)
    },
    isLoginedUser (data) {
      const currentUserEmail = data.user && data.user.email ? data.user.email : ''
      return this.getUserEmail === currentUserEmail
    },
    goToUserPermissionPage (userId) {
      this.$router.push({name: 'ps-Permissions', params: { clientId: this.currentClientID, userId: userId }})
    },
    goToInvitePage (currentClientID) {
      this.$router.push({ name: 'ps-ClientInvitation', params: { id: currentClientID } })
    },
    goToAddPage (currentClientID) {
      this.$router.push({name: 'ps-ClientAddition', params: { id: currentClientID }})
    },
    searchChange() {
      this.dataFilter.page = 1
      this.$router.push({
        params: {id: this.currentClientID},
        query: {
          role: this.role_selected ? this.role_selected : undefined,
          search: this.search.trim() !== '' ? this.search.trim() : undefined
        }
      })
    },
    goToEditPage (userId) {
      if (userId) {
        this.$router.push({ name: 'ps-UserRole', params: { id: this.currentClientID, userId } })
      }
    },
    rowClass (item, type) {
      if (this.$route.params.userId && item.user && item.user.user_id === this.$route.params.userId) {
        return 'active'
      } else {
        return ''
      }
    },
    back () {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push({name: 'ps-UserList'})
      }
    }
  },
  mounted () {
    // modal event
    this.currentClientID = this.$route.params.id
    this.search = this.$route.query.search
      ? this.$route.query.search
      : this.search
    this.dataFilter.page = this.$route.query.page
      ? +this.$route.query.page
      : this.dataFilter.page
    this.role_selected = this.$route.query.role
      ? this.$route.query.role
      : this.role_selected
    if (this.currentClientID) {
      this.getUserListByClient(this.currentClientID)
    }
  },
  created() {
    this.currentClientId = this.$route.params.id
    this.userId = this.$route.params.userId
    if (this.getUserId && this.currentClientId) {
      this.fetchRole({clientId: this.currentClientId, userId: this.getUserId})
    }
  },
  watch: {
    $route(to, from) {
      if (to.fullPath !== from.fullPath) {
        this.currentClientID = this.$route.params.id
        this.userId = this.$route.params.userId
        this.getUserListByClient(this.currentClientID, this.dataFilter)
        this.fetchRole({clientId: this.currentClientId, userId: this.getUserId})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/scss/Table.scss';
  .drp-actions ::v-deep {
    .dropdown-menu {
      min-width: 50%;
      height: auto;
      .cls-icon-trash {
        color: #DC3545;
        margin-right: 5px;
      }
      .cls-icon-pencil, .cls-icon-cursor {
        color: #23282c;
        margin-right: 5px;
      }
      .dropdown-item {
        padding: 6px 15px;
        font-size: 12px;
      }
    }
  }
  .remove-empty-dropdown ::v-deep {
    .dropdown-menu {
      border: none;
    }
  }
</style>
