<template>
  <div class="">
    <b-card>
      <div slot="header">
        <b-row>
          <b-col md="4" class="my-0">
            <strong>Workspace Modules</strong>
          </b-col>
        </b-row>
      </div>
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
            :disabled="getRole.userRole === 'STAFF'"
            v-model="data.item.enabled"
            :sync="true"
            @change="updateModuleList(data.item && data.item.module || null, data.item.enabled)"
          />
          <toggle-button v-else
            disabled
            v-model="data.item.enabled"
          />
        </template>
      </b-table>
    </b-card>
  </div>
</template>

<script>
import apiUser from '@/services/user'
import vToast from '@/shared/notification'
import { mapGetters, mapActions } from 'vuex'
import * as TYPE from '@/store/_constant'
import { ToggleButton } from 'vue-js-toggle-button'
import get from 'lodash/get'

export default {
  name: 'ClientModule',
  components: {
    'toggle-button': ToggleButton
  },
  data () {
    return {
      currentClientId: null,
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
      appProfile: process.env.VUE_APP_PS_BUILD_APP
    }
  },
  mixins: [vToast],
  computed: {
    ...mapGetters({
      currentClientFromStore: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`,
      getUserId: `ps/userModule/${TYPE.GET_USER_ID}`,
      getRole: `ps/userModule/${TYPE.GET_ROLE_INFO}`,
      currentChannel: `ps/userModule/${TYPE.GET_CURRENT_CHANNEL}`
    })
  },
  methods: {
    ...mapActions({
      updateCurrentModulesFromStore: `ps/userModule/${TYPE.EDIT_CURRENT_CLIENT_MODULES}`,
      fetchRole: `ps/userModule/${TYPE.FETCH_ROLE_IN_WORKSPACE}`,
      updateCurrentChannel: `ps/userModule/${TYPE.EDIT_CURRENT_CHANNEL}`,
      updateModulesFromStore: `ps/userModule/${TYPE.EDIT_CLIENT_MODULES}`
    }),
    getUserModuleList () {
      const clientIDFromStore = get(this.currentClientFromStore, 'id', '')
      const clientModulesFromStore = get(this.currentClientFromStore, 'modules', [])
      apiUser.getUserModuleList(this.currentClientId)
        .then(response => {
          // Remove RW Module
          // this.listDataModule = response.results
          this.listDataModule = response.results.filter(mod => {
            return (mod.module !== 'ROG' && this.appProfile !== 'matrix') || (mod.module !== 'MAP' && this.appProfile === 'matrix')
          })
          if (this.currentClientId === clientIDFromStore && !clientModulesFromStore.length) {
            // update modules to store for current client
            this.updateCurrentModulesFromStore({modules: response.results})
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
          this.vToasted('success', 'Switch module status successfully.')
        })
        .catch(response => {
          this.vToasted('error', 'Fail to switch module status. Please try again or contact administrator.')
          this.getUserModuleList()
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
    }
  },
  created () {
    this.currentClientId = this.$route.params.id
    // get modules list
    this.getUserModuleList()
    if (this.getUserId && this.currentClientId) {
      this.fetchRole({clientId: this.currentClientId, userId: this.getUserId})
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
