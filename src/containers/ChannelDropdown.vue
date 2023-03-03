<template>
  <div class="d-flex">
    <b-nav-item :to="{name: 'ps-ClientModule', params: {id: currentClientID}}" v-if="!checkActivedModules(['ROG','MAP','DS','RA','MT','DC','PF','TR','SKUF', 'SA']) && isAdminOrOwner() && currentClientID">
      <i class="icon icon-settings"></i> Manage modules
    </b-nav-item>
    <AppHeaderDropdown right no-caret v-else-if="checkActivedModules(moduleKeys) > 1">
      <template slot="header">
        <i class="icons icon-grid"></i> Channel:
        <span>
          {{ currentChannel && currentChannel[currentClientID] ? getModuleName(currentChannel[currentClientID]) : 'None' }} <i class="fa fa-caret-down"></i>
        </span>
      </template>
      <template slot="dropdown" class="channel-dropdown">
        <div v-for="(mod, key, index) in appModules" :key="index">
          <b-dropdown-item v-if="checkActivedModules([key])" @click="switchChannel(key)">
            <i :class="mod.icon"></i> {{ mod.name}}
          </b-dropdown-item>
        </div>
      </template>
    </AppHeaderDropdown>
    <span class="custom-padd"
       v-if="(!checkActivedModules(['ROG','MAP','DS','RA','MT','DC','PF','TR','SKUF', 'SA']) && isAdminOrOwner() && currentClientID)
        || (checkActivedModules(moduleKeys) > 1)"
    >of</span>
  </div>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
import { mapActions, mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import commons from '@/shared/mixins'
import { modules } from '@/shared/utils'

export default {
  name: 'ChannelDropdown',
  components: {
    AppHeaderDropdown
  },
  mixins: [commons],
  data () {
    return {
      appProfile: process.env.VUE_APP_PS_BUILD_APP || 'mwrw',
      appModules: {},
      moduleKeys: []
    }
  },
  computed: {
    ...mapGetters({
      currentClient: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`,
      role: `ps/userModule/${TYPE.GET_ROLE_INFO}`,
      currentChannel: `ps/userModule/${TYPE.GET_CURRENT_CHANNEL}`
    }),
    appNameIs() {
      return name => process.env.VUE_APP_PS_BUILD_APP === name
    },
    currentClientID () {
      return this.currentClient && this.currentClient.id ? this.currentClient.id : ''
    }
  },
  mounted () {
    this.appModules = modules && modules[this.appProfile] ? modules[this.appProfile] : {}
    this.moduleKeys = this.appModules ? Object.keys(this.appModules) : []
  },
  methods: {
    ...mapActions({
      updateCurrentChannel: `ps/userModule/${TYPE.EDIT_CURRENT_CHANNEL}`
    }),
    getModuleName (key) {
      return this.appModules && this.appModules[key] && this.appModules[key].name ? this.appModules[key].name : 'None'
    },
    isAdminOrOwner () {
      if (this.role && this.role.userRole && (this.role.userRole === 'ADMIN' || this.role.userRole === 'OWNER')) {
        return true
      }
      return false
    },
    switchChannel (channel) {
      const currentChannel = {
        [this.currentClientID]: channel
      }
      this.updateCurrentChannel(currentChannel)
      if (channel === 'ROG') {
        this.$router.push({name: 'RWDashboard', params: {client_id: this.currentClientID}})
      } else if (channel === 'MAP') {
        if (this.appProfile === 'matrix') {
          this.$router.push({name: 'MTMAPDashboard', params: {client_id: this.currentClientID}})
        } else {
          this.$router.push({name: 'MWDashboardMain', params: {client_id: this.currentClientID}})
        }
      } else if (channel === 'RA') {
        this.$router.push({name: 'RADashboardList', params: {client_id: this.currentClientID}})
      } else if (channel === 'DS') {
        this.$router.push({name: 'RADataSourceList', params: {client_id: this.currentClientID}})
      } else if (channel === 'MT') {
        this.$router.push({name: 'MTClientDashboard', params: {client_id: this.currentClientID}})
      } else if (channel === 'DC') {
        this.$router.push({name: 'DCClientDashboard', params: {client_id: this.currentClientID}})
      } else if (channel === 'PF') {
        this.$router.push({name: 'PFAnalysis', params: {client_id: this.currentClientID}})
      } else if (channel === 'TR') {
        this.$router.push({name: 'DTDHome', params: {client_id: this.currentClientID}})
      } else if (channel === 'SKUF') {
        this.$router.push({name: 'SKUFAnalysis', params: {client_id: this.currentClientID}})
      } else if (channel === 'SA') {
        this.$router.push({name: 'SAAnalysis', params: {client_id: this.currentClientID}})
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'DefaultHeaderDropdownAccnt.scss';

.custom-padd {
    padding: 0 7px;
    color: #73818f;
  }
</style>
