
<template>
  <div class>
    <b-card>
      <div slot="header">
        <div class="pull-left align-middle">
          <span class="align-middle">
            <span class="ml-2">
              <strong>{{fullName}} Permissions</strong>
            </span>
          </span>
        </div>
        <span class="pull-right">
          <b-button size="sm" @click="backToUserList()">
            <i class="icon-arrow-left-circle"></i> Back
          </b-button>
        </span>
      </div>
      <b-row>
        <b-col md="12" cols="12">
          <b-card class="mb-md-0">
            <div slot="header">
              <div class="pull-left align-middle">
                <span class="align-middle">
                  <span class="ml-2">
                    User Role
                  </span>
                </span>
              </div>
            </div>
            <div>
              <b-form-group class="text-center">
                <b-form-select v-model="selectedRole" @change="updateRole"
                  :disabled="!checkLoginedRoleWithAnother(selectedRole || '') || !canUpdateRole">
                  <option v-for="(item, _i) in selectableRoles" :key="_i" :value="item.key">{{item.name}}</option>
                </b-form-select>
              </b-form-group>
            </div>
          </b-card>
        </b-col>
      </b-row>
      <b-row class="custom-top" v-if="userPermissions">
        <b-col md="6" cols="12" v-for="(mod, index) in userPermissions" :key="index">
          <b-card class="mb-md-0" >
            <div slot="header">
              <div class="pull-left align-middle">
                <span class="align-middle">
                  <span class="ml-2">
                    {{ mod.label }}
                  </span>
                </span>
              </div>
            </div>
            <b-table
              hover
              outlined
              fixed
              striped
              responsive="sm"
              thead-class="thead-light"
              table-class="mb-0"
              :items="mod.permissions"
              :fields="fields"
            >
              <template v-slot:cell(allowed)="data">
                <toggle-button
                  :disabled="!checkLoginedRoleWithAnother(selectedRole || '')"
                  class="mb-0"
                  v-model="data.item.allowed"
                  :sync="true"
                  @change="updateUserPermission(data.item, mod)"
                />
              </template>
            </b-table>
          </b-card>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
import apiUser from '@/services/user'
import apiUserClient from '@/services/userClient'
import vToast from '@/shared/notification'
import commons from '@/shared/mixins'
import pageAction from '@/shared/page-action'
import { mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import { ToggleButton } from 'vue-js-toggle-button'

export default {
  name: 'UserPermissions',
  components: {
    ToggleButton
  },
  data() {
    return {
      currentClientId: null,
      currentUserId: null,
      userData: null,
      userPermissions: [],
      fields: [
        {
          key: 'label',
          label: 'Permission',
          thClass: 'border-bottom-0'
        },
        {
          key: 'allowed',
          label: 'Enabled',
          thClass: 'actionCol text-right border-bottom-0',
          tdClass: 'text-right'
        }
      ],
      selectedRole: '',
      haveAllPermission: false,
      userRole: '',
      canUpdateRole: true
    }
  },
  mixins: [vToast, commons, pageAction],
  methods: {
    getUserPermission(clientId, userId) {
      apiUser
        .getUserPermission(clientId, userId)
        .then(response => {
          this.userPermissions = response
        })
        .catch(() => {
          this.userPermissions = []
        })
    },
    getUserInformation(clientId, userId) {
      apiUser
        .getUserInformation(clientId, userId)
        .then(response => {
          this.userData = response.user
          this.selectedRole = response && response.role && response.role.key ? response.role.key : {}
          this.userRole = response && response.role ? response.role : {}
          if (this.isLoginedUser() || this.userRole.key === 'OWNER') {
            this.roles.push({
              key: 'OWNER',
              name: 'Workspace Owner'
            })
            this.canUpdateRole = false
          }
        })
        .catch(err => console.error(err))
    },
    updateUserPermission(data, mod) {
      let dataPermission = {
        module: mod.module,
        permission: data.key,
        enabled: data.allowed
      }
      apiUser.updateUserPermission(this.currentClientId, this.currentUserId, mod.module, data.key, dataPermission)
        .then(response => {
          console.log(response)
        })
        .catch(() => {
          // reset allowed
          this.getUserPermission(this.currentClientId, this.currentUserId)
        })
    },
    backToUserList() {
      this.$router.push({
        name: 'ps-UserList',
        params: { id: this.currentClientId }
      })
    },
    updateRole() {
      if (this.selectedRole) {
        const formatedKey = this.selectedRole.toLowerCase() || ''
        const updatedData = {
          role_update: formatedKey
        }
        apiUserClient.updateUserClientRole(this.currentClientId, this.currentUserId, updatedData).then((response) => {
          this.vToasted('success', 'This user role has been changed successfully.')
          this.reloadPage()
        }).catch((error) => {
          if (error && error.message) {
            this.vToasted('error', error.message)
          } else {
            this.vToasted('error', 'There is a problem when updating the role. Please try again or contact the administrator.')
          }
        })
      }
    },
    checkRoleWithPermissions(role) {
      this.haveAllPermission = ['OWNER', 'ADMIN', 'MANAGER'].includes(role) || false
    },
    isLoginedUser () {
      const currentUserEmail = this.userData && this.userData.email ? this.userData.email : ''
      return this.getUserEmail === currentUserEmail
    }
  },
  created() {
    this.currentClientId = this.$route.params.currentClientId
    this.currentUserId = this.$route.params.userId
    this.getUserPermission(this.currentClientId, this.currentUserId)
    this.getUserInformation(this.currentClientId, this.currentUserId)
  },
  mounted() {
    this.checkRoleWithPermissions(this.selectedRole)
  },
  computed: {
    fullName: function() {
      return this.userData ? this.userData.first_name && this.userData.last_name ? `${this.userData.first_name} ${this.userData.last_name}'s ` : this.userData.email ? `${this.userData.email}'s ` : `User's ` : `User's `
    },
    ...mapGetters({
      getRole: `ps/userModule/${TYPE.GET_ROLE_INFO}`,
      getUserEmail: `ps/userModule/${TYPE.GET_USER_EMAIL}`
    }),
    selectableRoles: function() {
      let roles = [{
        key: 'ADMIN',
        name: 'Workspace Admin'
      }, {
        key: 'STAFF',
        name: 'Workspace User'
      }]
      if (this.getRole.userRole === 'OWNER') {
        roles.unshift({
          key: 'OWNER',
          name: 'Workspace Owner'
        })
      }
      return roles
    }
  },
  watch: {
    selectedRole (value) {
      this.checkRoleWithPermissions(value)
    }
  }
}
</script>

<style lang="scss">
.actionCol {
  width: 100px;
}
.custom-top {
  margin-top: 1.25rem;
}
</style>
