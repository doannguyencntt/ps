<template>
  <b-card>
    <div slot="header">
      <b-row align-v="center">
        <b-col class="col-6">
          <span>
            <strong>Users</strong>
          </span>
        </b-col>
        <b-col v-if="userType && userType === 'org' && (userRole === 'OWNER' || userRole === 'ADMIN')" class="col-6 text-right">
          <!-- canAddUser get from mixin -->
          <b-button variant="primary" size="sm" v-if="currentOrgId && canAddUser([])" v-on:click="goToInvitePage(currentOrgId)">
            <i class="icons icon-cursor"></i> Invite
          </b-button>
          <!-- canAddUser get from mixin -->
          <b-button class="ml-2" variant="primary" size="sm" v-if="currentOrgId && canAddUser([])" v-on:click="goToAddPage(currentOrgId)">
            <i class="icons icon-plus"></i> Add
          </b-button>
        </b-col>
      </b-row>
    </div>
    <b-row class="justify-content-center">
      <b-col md="2" v-if="userType === 'org'">
        <b-form-select v-model="role_selected" :options="listRole" text-field="name" @change="searchChange()"></b-form-select>
      </b-col>
      <b-col md="4" class="mt-0 mb-4">
        <b-form-group class="mb-0">
          <b-input-group class="search cancel-action">
            <b-form-input v-model="search" @keypress.enter=" searchChange()" placeholder="Search for name or email">
            </b-form-input>
              <i v-show="search" @click="search = '';searchChange()" class="icon-close cancel-icon"></i>
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
      <b-col :cols="$route.params.userId ? 8 : 12" class="table-responsive">
        <b-table
          show-empty
          hover
          outlined
          striped
          responsive="sm"
          thead-class="thead-light"
          :items="userList"
          :fields="userRole === 'STAFF' || userRole === 'CLIENT' ? fields.filter(f => f.key !== 'action') : fields"
          id="user-table"
          :tbody-tr-class="rowClass"
          :class="{'table-blur': $route.params.userId}"
        >
          <template v-slot:empty>
            <div class="text-center py-2" v-if="userLoading">
              <i class="fa fa-circle-o-notch fa-spin"></i>
              Loading...
            </div>
            <div class="align-middle d-flex justify-content-center align-items-center" v-else>There are no users to show</div>
          </template>
          <template v-slot:cell(userAvatar)="data">
            <img
              :src="data.item.user.avatar || placeholderURL"
              class="img img__circle"
              :alt="data.item.user.first_name"
              width="35"
              height="35"
            />
          </template>
          <template v-slot:cell(roleName)="data">
            <span v-if="data.item && data.item.role.name === 'Staff'">User</span>
            <span v-else>{{data.item.role.name}}</span>
          </template>
          <template v-slot:cell(userEmail)="data">
            <span v-if="data.item.user.email === getUserEmail">{{ data.item.user.email }} (You)</span>
            <span v-else>{{ data.item.user.email }}</span>
          </template>
          <template v-slot:cell(userEnabled)="data">
            <b-badge variant="dark" v-if="data.item && data.item.status === 'PENDING'">Pending</b-badge>
            <b-badge variant="success" v-else>Enabled</b-badge>
          </template>
          <template v-slot:cell(action)="data">
            <!--Manage dropdown-->
            <!-- <b-dropdown variant="primary" size="sm" class="mr-1" v-if="data.item && hasUserAction(isLoggedUser(data.item), userRole, data.item.role.key, data.item.status)">
              <template slot="button-content">
                  <i class="icon-settings"></i> Manage
              </template>
              <b-dropdown-item-button class="btn-sm p-0"
                v-if="compare2Roles(userRole, data.item.role.key)"
                @click="goToClientAcess(data.item.user.user_id)">
                <span class="text"><i class="icons icon-lock small-icon"></i> Permissions</span>
              </b-dropdown-item-button>
              <b-dropdown-item-button class="btn-sm p-0"
                v-if="compare2Roles(userRole, data.item.role.key) && !isLoggedUser(data.item)"
                @click="goToEditPage(data.item.user.user_id)">
                <span class="text"><i class="icons icon-pencil small-icon"></i> Change base role</span>
              </b-dropdown-item-button>
              <b-dropdown-item-button class="btn-sm p-0"
                @click="actionData=data.item"
                v-if="data.item && data.item.status && data.item.status !== 'MEMBER' && (userRole === 'ADMIN' || userRole === 'OWNER')"
                v-b-modal.resend>
                <span class="text"><i class="icons icon-cursor small-icon"></i> Resend</span>
              </b-dropdown-item-button>
              <b-dropdown-item-button class="btn-sm p-0"
                size="sm" @click="actionData=data.item" v-b-modal.remove
                v-if="compare2Roles(userRole, data.item.role.key) && !isLoggedUser(data.item) && data.item.role.key !== 'OWNER'">
                <span class="text"><i class="icons icon-close small-icon"></i> Remove</span>
              </b-dropdown-item-button>
            </b-dropdown> -->
            <b-dropdown variant="primary" size="sm" split text="Permissions" v-if="data.item && hasUserAction(isLoggedUser(data.item), userRole, data.item.role.key, data.item.status) && compare2Roles(userRole, data.item.role.key)" @click="goToClientAcess(data.item.user.user_id)" class="drp-actions" :class="(compare2Roles(userRole, data.item.role.key) && !isLoggedUser(data.item)) && (data.item && data.item.status && data.item.status !== 'MEMBER' && (userRole === 'ADMIN' || userRole === 'OWNER')) && (compare2Roles(userRole, data.item.role.key) && !isLoggedUser(data.item) && data.item.role.key !== 'OWNER') ? '' : 'remove-empty-dropdown'">
              <b-dropdown-item v-if="compare2Roles(userRole, data.item.role.key) && !isLoggedUser(data.item)" @click="goToEditPage(data.item.user.user_id)">
                <i class="icon-pencil cls-icon-pencil"></i>Change base role
              </b-dropdown-item>
              <b-dropdown-item v-if="data.item && data.item.status && data.item.status !== 'MEMBER' && (userRole === 'ADMIN' || userRole === 'OWNER')" @click="actionData=data.item" v-b-modal.resend>
                <i class="icon-cursor cls-icon-cursor"></i>Resend
              </b-dropdown-item>
              <b-dropdown-item variant="danger" v-if="compare2Roles(userRole, data.item.role.key) && !isLoggedUser(data.item) && data.item.role.key !== 'OWNER'" @click="actionData=data.item" v-b-modal.remove>
                <i class="icon-trash cls-icon-trash"></i>Remove
              </b-dropdown-item>
            </b-dropdown>
            <!--Manage dropdown-->
          </template>
        </b-table>
        <!--No users-->
        <nav class="d-flex justify-content-center">
          <b-pagination @click.native="goToPage" v-if="totalRows > dataFilter.limit" :total-rows="totalRows" :per-page="dataFilter.limit" v-model="dataFilter.page" prev-text="Prev" next-text="Next" hide-goto-end-buttons />
        </nav>
      </b-col>
      <b-col cols="4" v-if="$route.params.userId">
        <router-view />
      </b-col>
    </b-row>
    <!-- getting from mixins -->
    <div v-if="isAPIReady && $route.params.type === 'org' &&  _getSubscriptionConfigByOrg($route.params.orgId) && !canAddUser([])">
      <p class="text-danger text-center mb-0">
        You already create max number of internal users. Please
        <router-link :to="{name: 'ps-BillingPlans', params: { orgId: $route.params.orgId }}">
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
    <b-modal
            id="removeConfirm"
            title="Please confirm"
            centered
            @ok="removeUserWithOption()"
            @cancel="actionData=null"
        >
            <b-form-group label="
          This account has access in workspaces. Are you sure you want to remove this account?
" v-slot="{ ariaDescribedby }">
                  <b-form-radio v-model="selectedRemoveOption" :aria-describedby="ariaDescribedby" name="some-radios" value="DELETE_ALL">Delete this account completely.</b-form-radio>

                  <b-form-radio v-model="selectedRemoveOption" :aria-describedby="ariaDescribedby" name="some-radios" value="DELETE_AND_KEEP_IN_WS">Delete this account and keep it in its workspaces.</b-form-radio>
            </b-form-group>
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
import { deleteUserInOrgApi, resendInvitationApi, getUsersInOrgApi, getUserInfoInOrgApi } from '@/services/userOrg'
import vToast from '@/shared/notification'
import { mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import placeholderURL from '@/assets/img/profile-placeholder.png'
import commons from '@/shared/mixins'
import { checkingUserPermissions } from '@/components/CustomPermission/billingMixin'

export default {
  name: 'OrgUsers',
  data: () => {
    return {
      isAPIReady: false,
      search: '',
      role_selected: null,
      listRole: [
        {
          value: null,
          name: 'All Roles'
        }, {
          value: 'OWNER',
          name: 'Organization Owner'
        }, {
          value: 'ADMIN',
          name: 'Organization Admin'
        }, {
          value: 'STAFF',
          name: 'Organization User'
        }
      ],
      currentOrgId: '',
      userType: '',
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
      userRole: '',
      selectedRemoveOption: 'DELETE_AND_KEEP_IN_WS',
      userLoading: false
    }
  },
  mixins: [
    vToast,
    commons,
    checkingUserPermissions('custom', false)
  ],
  computed: {
    ...mapGetters({
      userIdFromStore: `ps/userModule/${TYPE.GET_USER_ID}`,
      getUserEmail: `ps/userModule/${TYPE.GET_USER_EMAIL}`,
      currentOrgFromStore: `ps/userModule/${TYPE.GET_CURRENT_ORG}`
    }),
    totalRows: function () { return this.userData.count ? this.userData.count : 0 }
  },
  methods: {
    getUserList (orgId) {
      let roleSelected = []
      if (this.userType && this.userType === 'client') {
        roleSelected = ['Client']
      } else if (this.userType && this.userType === 'org') {
        !this.role_selected ? roleSelected = ['OWNER', 'ADMIN', 'STAFF'] : roleSelected.push(this.role_selected)
      }
      this.userLoading = true
      this.dataFilter.roles = roleSelected
      this.dataFilter.key = this.search
      getUsersInOrgApi(orgId, this.dataFilter).then(response => {
        if (response) {
          this.userData = response
          this.userList = response.results || []
          if ((!this.userList.length && this.$route.params.userId) ||
            (this.actionData && this.actionData.user && this.actionData.user.user_id && this.actionData.user.user_id === this.$route.params.userId)) {
            if (this.userType === 'client') {
              this.$router.push({name: 'ps-OrgUsers', params: {orgId, type: 'client'}})
            } else if (this.userType === 'org') {
              this.$router.push({name: 'ps-OrgUsers', params: {orgId, type: 'org'}})
            }
          }
        }
        this.actionData = null
      }).finally(() => {
        this.isAPIReady = true
        this.userLoading = false
      })
    },
    removeUser () {
      const userID = this.actionData && this.actionData.user && this.actionData.user.user_id ? this.actionData.user.user_id : ''
      if (userID && this.currentOrgId) {
        deleteUserInOrgApi(this.currentOrgId, userID).then(response => {
          this.vToasted('success', 'This account is deleted successfully')
          // reset user list
          this.getUserList(this.currentOrgId)
        }).catch((error) => {
          if (error.response && error.response.status === 406) {
            if (this.actionData.role.key !== 'CLIENT') {
              this.$bvModal.show('removeConfirm')
            } else {
              this.selectedRemoveOption = 'DELETE_ALL'
              this.removeUserWithOption()
            }
          } else {
            this.vToasted('error', 'There is a problem when delete this staff. Please try again or contact administrator.')
            this.closeModal()
          }
        })
      } else {
        this.vToasted('error', 'Something went wrong!')
        this.closeModal()
      }
    },
    removeUserWithOption() {
      const userID = this.actionData && this.actionData.user && this.actionData.user.user_id ? this.actionData.user.user_id : ''
      if (userID && this.currentOrgId) {
        deleteUserInOrgApi(this.currentOrgId, userID, {delete_option: this.selectedRemoveOption}).then(response => {
          this.vToasted('success', 'This account is deleted successfully')
          // reset user list
          this.getUserList(this.currentOrgId)
        }).catch(() => {
          this.vToasted('error', 'There is a problem when delete this staff. Please try again or contact administrator.')
          this.closeModal()
        })
      }
    },
    resend () {
      const userId = this.actionData && this.actionData.user && this.actionData.user.user_id ? this.actionData.user.user_id : ''
      if (userId && this.currentOrgId) {
        const data = {
          activation_link_template: window.location.protocol + '//' + window.location.host + '/#/ps/organizations/invitation?token={token}'
        }
        resendInvitationApi(this.currentOrgId, userId, data).then(response => {
          this.vToasted('success', 'The invitation has been resent. Please let that member know to check their inbox.')
          this.getUserList(this.currentOrgId)
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
        params: {orgId: this.currentOrgId},
        query: {
          page: this.dataFilter.page
        }
      })
    },
    isLoggedUser (data) {
      const currentUserEmail = data.user && data.user.email ? data.user.email : ''
      return this.getUserEmail === currentUserEmail
    },
    goToClientAcess (userId) {
      if (userId) {
        this.$router.push({
          name: 'ps-OrgClientAccess',
          params: { orgId: this.currentOrgId, userId },
          query: { user_type: this.$route.params.type }
        })
      }
    },
    goToInvitePage (currentOrgId) {
      if (currentOrgId) {
        this.$router.push({ name: 'ps-OrgInvitation', params: { orgId: currentOrgId } })
      }
    },
    goToAddPage (currentOrgId) {
      if (currentOrgId) {
        this.$router.push({ name: 'ps-OrgAddition', params: { orgId: currentOrgId } })
      }
    },
    goToEditPage (userId) {
      if (userId) {
        this.$router.push({ name: 'ps-OrgUserRole', params: { orgId: this.currentOrgId, userId } })
      }
    },
    rowClass (item, type) {
      if (this.$route.params.userId && item.user && item.user.user_id === this.$route.params.userId) {
        return 'active'
      } else {
        return ''
      }
    },
    getOrgRole () {
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
    searchChange() {
      if (this.$route.params.userId) {
        this.$router.push({name: 'ps-OrgUsers', params: { orgId: this.currentOrgId, type: this.userType }})
      }
      this.dataFilter.page = 1
      this.$router.push({
        params: {orgId: this.currentOrgId},
        query: {
          page: this.dataFilter.page,
          search: this.search.trim() !== '' ? this.search.trim() : undefined,
          role: this.role_selected ? this.role_selected : undefined
        }
      })
    }
  },
  created () {
    this.currentOrgId = this.$route.params.orgId
    this.userType = this.$route.params.type
    this.dataFilter.page = this.$route.query.page
      ? +this.$route.query.page
      : this.dataFilter.page
    this.role_selected = this.$route.query.role
      ? this.$route.query.role
      : this.role_selected
    this.search = this.$route.query.search
      ? this.$route.query.search
      : this.search
    if (this.currentOrgId) {
      this.getUserList(this.currentOrgId)
      // get role
      this.userRole = this.getOrgRole()
    }
  },
  watch: {
    $route(to, from) {
      if (to.fullPath !== from.fullPath) {
        this.currentOrgId = to.params.orgId
        this.userType = to.params.type
        if (this.currentOrgId) {
          this.getUserList(this.currentOrgId)
          // get role
          if (to.params.orgId !== from.params.orgId) {
            this.userRole = this.getOrgRole()
          }
        }
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
