
<template>
  <div>
    <b-card class="rounded-0">
      <div slot="header">
        <div class="pull-left align-middle">
          <span class="align-middle">
            <span class="ml-2 user-role-title">
              {{fullName}}'s base role
            </span>
          </span>
        </div>
      </div>
      <b-form-select v-model="selectedRole" @change="updateRole">
        <option v-for="(item, _i) in roles" :key="_i" :value="item.key">{{item.name}}</option>
      </b-form-select>
    </b-card>
  </div>
</template>

<script>
import vToast from '@/shared/notification'
import commons from '@/shared/mixins'
import { mapGetters } from 'vuex'
import pageAction from '@/shared/page-action'
import * as TYPE from '@/store/_constant'
import { getUserInfoInOrgApi, updateRoleApi } from '@/services/userOrg'

export default {
  name: 'EditRole',
  data() {
    return {
      orgId: null,
      userId: null,
      userType: '',
      userData: null,
      selectedRole: '',
      roles: [{
        key: 'ADMIN',
        name: 'Organization Admin'
      }, {
        key: 'STAFF',
        name: 'Organization User'
      }, {
        key: 'CLIENT',
        name: 'External User'
      }],
      userRole: ''
    }
  },
  mixins: [vToast, commons, pageAction],
  methods: {
    getUser(orgId, userId) {
      getUserInfoInOrgApi(orgId, userId).then(response => {
        this.userData = response.user
        this.userRole = response && response.role && response.role.key ? response.role.key : ''
        this.selectedRole = response && response.role && response.role.key ? response.role.key : ''
      }).catch(() => {})
    },
    updateRole() {
      if (this.selectedRole) {
        const formatedKey = this.selectedRole.toLowerCase() || ''
        const updatedData = {
          role_update: formatedKey
        }
        updateRoleApi(this.orgId, this.userId, updatedData).then((response) => {
          this.vToasted('success', 'This user base role has been changed successfully.')
          if (this.userType === 'client' && formatedKey !== 'client') {
            this.$router.push({name: 'ps-OrgUsers', params: {orgId: this.orgId, type: 'client'}})
          } else if (this.userType === 'org' && formatedKey === 'client') {
            this.$router.push({name: 'ps-OrgUsers', params: {orgId: this.orgId, type: 'org'}})
          }
          this.reloadPage()
        }).catch(() => {
          this.vToasted('error', 'There is a problem when updating the role. Please try again or contact the administrator.')
          this.reloadPage()
        })
      }
    }
  },
  created() {
    this.orgId = this.$route.params.orgId
    this.userId = this.$route.params.userId
    this.userType = this.$route.params.type
    this.getUser(this.orgId, this.userId)
    // filter role list
    if (this.loginedUserRole === 'OWNER') {
      this.roles.unshift({
        key: 'OWNER',
        name: 'Organization Owner'
      })
    }
  },
  computed: {
    ...mapGetters({
      getUserEmail: `ps/userModule/${TYPE.GET_USER_EMAIL}`
    }),
    loginedUserRole () {
      return this.getOrgRole(this.orgId)
    },
    fullName: function() {
      return this.userData ? this.userData.first_name && this.userData.last_name ? `${this.userData.first_name} ${this.userData.last_name}` : this.userData.email ? `${this.userData.email}` : `User ` : `User`
    }
  },
  watch: {
    '$route.params.userId' (value) {
      this.userId = value
      this.getUser(this.orgId, this.userId)
    },
    '$route.params.orgId' (value) {
      this.orgId = value
      this.getUser(this.orgId, this.userId)
      if (this.loginedUserRole === 'OWNER') {
        this.roles.unshift({
          key: 'OWNER',
          name: 'Organization Owner'
        })
      } else {
        this.roles = [{
          key: 'ADMIN',
          name: 'Organization Admin'
        }, {
          key: 'STAFF',
          name: 'Organization User'
        }, {
          key: 'CLIENT',
          name: 'External User'
        }]
      }
    },
    '$route.params.type' (value) {
      this.userType = value
    }
  }
}
</script>
<style lang="scss" scoped>
  .user-role-title {
    color: #5c6873;
    font-weight: 700;
  }
</style>
