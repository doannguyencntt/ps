
<template>
  <div>
    <b-table
      hover
      outlined
      striped
      responsive="sm"
      thead-class="thead-light"
      :items="listDataApplication"
      :fields="fields"
      id="module-table"
    >
      <template v-slot:cell(enabled)="data">
        <toggle-button
          :disabled="userRole !== 'OWNER' && userRole !== 'ADMIN'"
          :sync="true"
          v-model="data.item.enabled"
          @input="updateApplicationList(data.item && data.item.app || null, data.item.enabled)"
        />
      </template>
    </b-table>
  </div>
</template>

<script>
import apiUser from '@/services/user'
import vToast from '@/shared/notification'
import { mapGetters, mapActions } from 'vuex'
import * as TYPE from '@/store/_constant'
import pageAction from '@/shared/page-action'
import commons from '@/shared/mixins'
import { getUserInfoInOrgApi } from '@/services/userOrg'
import { ToggleButton } from 'vue-js-toggle-button'

export default {
  name: 'ps-OrgApplications',
  components: {
    ToggleButton
  },
  data () {
    return {
      currentClientId: null,
      currentOrgId: null,
      listDataApplication: [],
      fields: [
        {
          key: 'label',
          label: 'Application Name',
          class: 'vertical-content'
        },
        {
          key: 'enabled',
          label: 'Enabled',
          class: 'vertical-content text-center enabled-col'
        }
      ],
      userRole: '',
      appProfile: process.env.VUE_APP_PS_BUILD_APP
    }
  },
  mixins: [vToast, pageAction, commons],
  computed: {
    ...mapGetters({
      currentClientFromStore: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`,
      userIdFromStore: `ps/userModule/${TYPE.GET_USER_ID}`
    })
  },
  methods: {
    ...mapActions({
      updateCurrentChannel: `ps/userModule/${TYPE.EDIT_CURRENT_CHANNEL}`,
      updateModulesFromStore: `ps/userModule/${TYPE.EDIT_CLIENT_MODULES}`
    }),
    getUserApplicationList (OrgId, clientId) {
      apiUser.getUserApplicationList(OrgId, clientId)
        .then(response => {
          this.listDataApplication = response.filter(res => res.app === this.appProfile)
        })
        .catch(response => {
          console.log('data fail', response)
        })
    },
    updateApplicationList (appName, enabled) {
      let dataApp = {
        enabled: enabled
      }
      apiUser.updateApplicationList(this.currentOrgId, this.currentClientId, appName, dataApp)
        .then(response => {
          this.vToasted('success', 'Switch application status successfully')
        })
        .catch(response => {
          if (response.code === 1005) {
            this.vToasted('error', 'Fail to switch application status. Message: ' + response.message)
          } else {
            this.vToasted('error', 'Fail to switch application status. Please try again or contact administrator.')
          }
          this.reloadPage()
        })
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
    }
  },
  created () {
    this.currentOrgId = this.$route.params.orgId
    this.currentClientId = this.$route.params.clientId
    // get application list
    this.getUserApplicationList(this.currentOrgId, this.currentClientId)
    // get role
    this.getOrgRole()
  },
  watch: {
    '$route.params.clientId' (newVal, oldVal) {
      this.currentClientId = newVal
      this.getUserApplicationList(this.currentOrgId, this.currentClientId)
      // get role
      this.getOrgRole()
    }
  }
}
</script>

<style lang="scss">
  #module-table {
    .vertical-content{
      vertical-align: middle;
    }
    thead {
      .enabled-col {
        width: 100px;
      }
    }
  }
  .v-switch-core{
    top: 4px;
  }
</style>
