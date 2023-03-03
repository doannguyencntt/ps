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
import apiUser from '@/services/user'
import apiUserClient from '@/services/userClient'
import get from 'lodash/get'

export default {
  name: 'ps-UserRole',
  data() {
    return {
      clientId: null,
      userId: null,
      userData: null,
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
      }]
    }
  },
  mixins: [vToast, commons, pageAction],
  methods: {
    getUser(clientId, userId) {
      apiUser.getUserInformation(clientId, userId).then(response => {
        this.userData = response.user
        this.selectedRole = get(response, 'role.key', '')
      }).catch(() => {})
    },
    updateRole() {
      if (this.selectedRole) {
        const formatedKey = this.selectedRole.toLowerCase() || ''
        const updatedData = {
          role_update: formatedKey
        }
        apiUserClient.updateUserClientRole(this.clientId, this.userId, updatedData).then((response) => {
          this.vToasted('success', 'This user base role has been changed successfully.')
          this.reloadPage()
        }).catch(() => {
          this.vToasted('error', 'There is a problem when updating the role. Please try again or contact the administrator.')
          this.reloadPage()
        })
      }
    }
  },
  created() {
    this.clientId = this.$route.params.id
    this.userId = this.$route.params.userId
    this.getUser(this.clientId, this.userId)
  },
  computed: {
    ...mapGetters({
      getUserEmail: `ps/userModule/${TYPE.GET_USER_EMAIL}`
    }),
    fullName: function() {
      return this.userData ? this.userData.first_name && this.userData.last_name ? `${this.userData.first_name} ${this.userData.last_name}` : this.userData.email ? `${this.userData.email}` : `User ` : `User`
    }
  },
  watch: {
    '$route.params.userId' (value) {
      this.userId = value
      this.getUser(this.clientId, this.userId)
    },
    '$route.params.id' (value) {
      this.clientId = value
      this.getUser(this.clientId, this.userId)
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
