
<template>
  <div>
    <b-card v-if="orgRole === 'ADMIN' || orgRole === 'OWNER'" class="rounded-0 custom-card">
      <div slot="header">
        <div class="pull-left align-middle">
          <span class="align-middle">
            <span class="ml-2">
              <strong>{{fullName}}'s</strong> role in <strong>{{ clientData && clientData.name ? clientData.name : '' }}</strong> workspace
            </span>
          </span>
        </div>
      </div>
      <div>
        <b-form-group class="text-center">
          <b-form-select v-model="selectedRole" @change="updateRole">
            <option v-for="(item, _i) in roles" :key="_i" :value="item.key">{{item.name}}</option>
          </b-form-select>
        </b-form-group>
      </div>
    </b-card>
    <div role="tablist" v-if="userPermissions">
      <b-card no-body class="mb-1 rounded-0 custom-card" v-for="(mod, index) in userPermissions" :key="index">
        <b-card-header header-tag="header" class="custom-header" role="tab">
          <b-button block href="#"
            :class="mod.visible ? null : 'collapsed'"
            :aria-expanded="mod.visible ? 'true' : 'false'"
            :aria-controls="'accordion-' + index"
            @click="mod.visible = !mod.visible"
            class="border-0"
          >
            {{ mod.label }}
          </b-button>
        </b-card-header>
        <b-collapse :id="'accordion-' + index" v-model="mod.visible" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-table
              class ="no-top-border"
              hover
              fixed
              responsive="sm"
              table-class="mb-0"
              :items="mod.permissions"
              :fields="fields"
            >
              <template v-slot:cell(allowed)="data">
                <toggle-button
                  class="mb-0"
                  :sync="true"
                  v-model="data.item.allowed"
                  @change="updateUserPermission(data.item, mod)"
                />
              </template>
            </b-table>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
  </div>
</template>

<script>
import apiUser from '@/services/user'
import apiUserClient from '@/services/userClient'
import vToast from '@/shared/notification'
import commons from '@/shared/mixins'
import { getUserInfoInOrgApi } from '@/services/userOrg'
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
      userData: {
        first_name: '',
        last_name: ''
      },
      currentOrgId: '',
      currentClientId: '',
      currentUserId: '',
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
      roles: [{
        key: 'OWNER',
        name: 'Workspace Owner'
      }, {
        key: 'ADMIN',
        name: 'Workspace Admin'
      }, {
        key: 'STAFF',
        name: 'Workspace User'
      }],
      orgRole: '',
      clientData: null
    }
  },
  mixins: [vToast, commons],
  computed: {
    ...mapGetters({
      userIdFromStore: `ps/userModule/${TYPE.GET_USER_ID}`
    }),
    fullName: function() {
      return this.userData ? this.userData.first_name && this.userData.last_name ? `${this.userData.first_name} ${this.userData.last_name}` : this.userData.email ? `${this.userData.email}` : `User ` : `User`
    }
  },
  methods: {
    getUserData (orgId, userId) {
      getUserInfoInOrgApi(orgId, userId).then(response => {
        this.userData = response.user || {}
      }).catch(() => {})
    },
    getUserPermission(clientId, userId) {
      apiUser
        .getUserPermission(clientId, userId)
        .then(response => {
          if (response && response.length) {
            response.forEach((mod, index) => {
              if (index === 0) {
                mod.visible = true
              } else {
                mod.visible = false
              }
            })
            this.userPermissions = response
          }
        })
        .catch(() => {})
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
    getClient(clientId, userId) {
      apiUser
        .getUserInformation(clientId, userId)
        .then(response => {
          this.selectedRole = response && response.role && response.role.key ? response.role.key : {}
          this.clientData = response && response.client_information ? response.client_information : {}
        })
        .catch(err => console.error(err))
    },
    getOrgRole () {
      if (this.userIdFromStore) {
        getUserInfoInOrgApi(this.currentOrgId, this.userIdFromStore).then(response => {
          if (response && response.role) {
            this.orgRole = response.role && response.role.key ? response.role.key : ''
          }
        }).catch(() => {
          this.orgRole = ''
        })
      }
    },
    updateRole() {
      if (this.selectedRole) {
        const formatedKey = this.selectedRole.toLowerCase() || ''
        const updatedData = {
          role_update: formatedKey
        }
        apiUserClient.updateUserClientRole(this.currentClientId, this.currentUserId, updatedData).then((response) => {
          this.vToasted('success', 'This user role has been changed successfully.')
          this.getClient(this.currentClientId, this.currentUserId)
        }).catch((error) => {
          if (error && error.message) {
            this.vToasted('error', error.message)
          } else {
            this.vToasted('error', 'There is a problem when updating the role. Please try again or contact the administrator.')
          }
          this.getClient(this.currentClientId, this.currentUserId)
        })
      }
    }
  },
  created() {
    this.currentClientId = this.$route.params.clientId
    this.currentOrgId = this.$route.params.orgId
    this.currentUserId = this.$route.params.userId
    this.getUserPermission(this.currentClientId, this.currentUserId)
    this.getOrgRole()
    this.getClient(this.currentClientId, this.currentUserId)
    if (this.currentOrgId && this.currentUserId) {
      this.getUserData(this.currentOrgId, this.currentUserId)
    }
  },
  watch: {
    '$route.params.clientId' (newVal, oldVal) {
      this.currentClientId = newVal
      this.getUserPermission(this.currentClientId, this.currentUserId)
      this.getClient(this.currentClientId, this.currentUserId)
    },
    '$route.params.orgId' (newVal, oldVal) {
      this.currentOrgId = newVal
      this.getOrgRole()
      this.getUserData(this.currentOrgId, this.currentUserId)
    },
    '$route.params.userId' (newVal, oldVal) {
      this.currentUserId = newVal
      this.getClient(this.currentClientId, this.currentUserId)
      this.getUserData(this.currentOrgId, this.currentUserId)
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-card{
  width: 95%;
  margin-left: auto;
  .btn{
    box-shadow: 0 0 0 0.1rem #e1e1e1
  }
  .custom-header{
    border-radius: 0px;
  }
  .card-header{
    box-shadow: 0 0 1px 1px #e4e6e7;
  }
}
.actionCol {
  width: 100px;
}
.custom-header {
  padding: 0;
  a {
    border-radius: 0;
    text-align: left;
    background-color: rgba(0, 0, 0, 0.075);
    padding: 10px 15px;
  }
}
.no-top-border ::v-deep th{
  border-top: 0px !important
}
</style>
