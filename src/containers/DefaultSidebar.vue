<template>
  <AppSidebar fixed>
    <SidebarHeader/>
    <SidebarForm/>
    <!--Custom Sidebar-->
    <component v-bind:is="customSidebar" :key="currentClient.id"></component>
    <!--/ Custom Sidebar-->
    <SidebarFooter/>
    <SidebarMinimizer/>
  </AppSidebar>
</template>

<script>
import { Sidebar as AppSidebar, SidebarFooter, SidebarForm, SidebarHeader, SidebarMinimizer } from '@coreui/vue'
import DefaultSidebarNav from '@/containers/DefaultSidebarNav'
import isEmpty from 'lodash/isEmpty'
import { mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'

export default {
  name: 'DefaultSidebar',
  components: {
    AppSidebar,
    SidebarForm,
    SidebarFooter,
    SidebarHeader,
    DefaultSidebarNav,
    SidebarMinimizer
  },
  created() {},
  computed: {
    ...mapGetters({
      currentChannel: `ps/userModule/${TYPE.GET_CURRENT_CHANNEL}`,
      currentClient: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`,
      orgParam: `ps/userModule/${TYPE.GET_ORG_PARAM}`
    }),
    customSidebar () {
      var self = this
      const currentClientID = self.currentClient.id || ''
      if (self.appNameIs('sa')) {
        return !isEmpty(this.$_customSidebar.sa) ? this.$_customSidebar.sa : DefaultSidebarNav
      }
      if (!currentClientID) return DefaultSidebarNav
      if (self.currentChannel[currentClientID] === 'MAP') {
        if (self.appNameIs('mwrw')) {
          return !isEmpty(this.$_customSidebar.mw) ? this.$_customSidebar.mw : DefaultSidebarNav
        } else {
          return !isEmpty(this.$_customSidebar.mt) ? this.$_customSidebar.mt : DefaultSidebarNav
        }
      } else if (self.currentChannel[currentClientID] === 'ROG') {
        return !isEmpty(this.$_customSidebar.rw) ? this.$_customSidebar.rw : DefaultSidebarNav
      } else if (self.currentChannel[currentClientID] === 'RA') {
        return !isEmpty(this.$_customSidebar.ra) ? this.$_customSidebar.ra : DefaultSidebarNav
      } else if (self.currentChannel[currentClientID] === 'DS') {
        return !isEmpty(this.$_customSidebar.ds) ? this.$_customSidebar.ds : DefaultSidebarNav
      } else if (self.currentChannel[currentClientID] === 'DC') {
        return !isEmpty(this.$_customSidebar.dc) ? this.$_customSidebar.dc : DefaultSidebarNav
      } else if (self.currentChannel[currentClientID] === 'MT') {
        return !isEmpty(this.$_customSidebar.mt) ? this.$_customSidebar.mt : DefaultSidebarNav
      } else if (self.currentChannel[currentClientID] === 'PF') {
        return !isEmpty(this.$_customSidebar.pf) ? this.$_customSidebar.pf : DefaultSidebarNav
      } else if (self.currentChannel[currentClientID] === 'TR') {
        return !isEmpty(this.$_customSidebar.dtd) ? this.$_customSidebar.dtd : DefaultSidebarNav
      } else if (self.currentChannel[currentClientID] === 'SKUF') {
        return !isEmpty(this.$_customSidebar.skuflex) ? this.$_customSidebar.skuflex : DefaultSidebarNav
      } else {
        return DefaultSidebarNav
      }
    },
    appNameIs() {
      return name => process.env.VUE_APP_PS_BUILD_APP === name
    }
  }
}
</script>

<style lang="scss" scoped>
  .sidebar {
    ::v-deep .router-link-active {
      color: #fff;
      background: #3a4248;
      .nav-icon {
        color: #20a8d8;
      }
    }
  }
</style>
