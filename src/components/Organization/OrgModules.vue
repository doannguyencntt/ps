
<template>
  <div>
    <b-table
      hover
      outlined
      striped
      responsive="sm"
      thead-class="thead-light"
      :items="listDataModule"
      :fields="fields"
      id="module-table"
    >
      <template v-slot:cell(enabled)="data">
        <toggle-button v-if="data.item.module !== 'seller'"
          :disabled="userRole !== 'OWNER' && userRole !== 'ADMIN'"
          :sync="true"
          v-model="data.item.enabled"
          @input="updateModuleList(data.item && data.item.module || null, data.item.enabled)"
        />
        <toggle-button v-else
          disabled
          :sync="true"
          :value="data.item.enabled"
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
import get from 'lodash/get'

export default {
  name: 'ps-OrgModules',
  components: {
    ToggleButton
  },
  data () {
    return {
      currentClientId: null,
      currentOrgId: null,
      listDataModule: [],
      fields: [
        {
          key: 'label',
          label: 'Module Name',
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
      updateCurrentModulesFromStore: `ps/userModule/${TYPE.EDIT_CURRENT_CLIENT_MODULES}`,
      updateCurrentChannel: `ps/userModule/${TYPE.EDIT_CURRENT_CHANNEL}`,
      updateModulesFromStore: `ps/userModule/${TYPE.EDIT_CLIENT_MODULES}`
    }),
    getUserModuleList (clientId) {
      const clientIDFromStore = get(this.currentClientFromStore, 'id', '')
      const clientModulesFromStore = get(this.currentClientFromStore, 'modules', [])
      apiUser.getUserModuleList(clientId)
        .then(response => {
          // Remove RW Module
          // this.listDataModule = response.results
          this.listDataModule = response.results.filter(mod => {
            return (mod.module !== 'ROG' && this.appProfile !== 'matrix') || (mod.module !== 'MAP' && this.appProfile === 'matrix')
          })
          if (clientId === clientIDFromStore && !clientModulesFromStore.length) {
            // update modules to store for current client
            this.updateCurrentModulesFromStore({clientId: clientIDFromStore, modules: response.results})
          }
        })
        .catch(response => {
          console.log('data fail', response)
        })
    },
    updateModuleList (moduleName, enabled) {
      let dataModule = {
        module: moduleName,
        enabled: enabled
      }
      apiUser.updateModuleList(this.currentClientId, dataModule.module, dataModule)
        .then(response => {
          this.updateModuleStatus(moduleName, enabled)
          this.vToasted('success', 'Switch module status successfully')
        })
        .catch(response => {
          this.vToasted('error', 'Fail to switch module status. Please try again or contact administrator.')
          this.reloadPage()
        })
    },
    updateModuleStatus (moduleName, enabled) {
      let modules = this.currentClientFromStore.modules || []
      const clientIDFromStore = get(this.currentClientFromStore, 'id', '')
      modules.some((mod) => {
        if (mod.module === moduleName) {
          mod.enabled = enabled
          return true
        }
      })
      if (this.currentClientId === clientIDFromStore) {
        // update modules for current client in store
        this.updateCurrentModulesFromStore({modules})
        // update current channel
        this.updateCurrentChannel({[this.currentClientId]: ''})
      } else {
        // update modules for client in store
        const module = {
          module: moduleName,
          enabled
        }
        this.updateModulesFromStore({module, clientId: this.currentClientId})
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
    }
  },
  created () {
    this.currentOrgId = this.$route.params.orgId
    this.currentClientId = this.$route.params.clientId
    // get modules list
    this.getUserModuleList(this.currentClientId)
    // get role
    this.getOrgRole()
  },
  watch: {
    '$route.params.clientId' (newVal, oldVal) {
      this.currentClientId = newVal
      this.getUserModuleList(this.currentClientId)
      // get role
      this.getOrgRole()
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/scss/Table.scss';
  ::v-deep .v-switch-core{
    top: 4px;
  }
</style>
