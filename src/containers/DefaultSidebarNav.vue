<template>
  <SidebarNav :navItems="nav"></SidebarNav>
</template>

<script>
import { mapGetters } from 'vuex'
import { GET_CURRENT_CHANNEL, GET_CURRENT_CLIENT } from '@/store/_constant'
import concat from 'lodash/concat'
// import each from 'lodash/each'
import SidebarNav from './SidebarNav'
import psNav from '@/_nav'

export default {
  name: 'DefaultSidebarNav',
  components: {
    SidebarNav
  },
  computed: {
    ...mapGetters({
      currentChannel: `ps/userModule/${GET_CURRENT_CHANNEL}`,
      currentClient: `ps/userModule/${GET_CURRENT_CLIENT}`,
      getCustomDashboardList: 'mt/RaDashboardID/getCustomDashboardList'
    }),
    nav () {
      var self = this
      const currentClientID = self.currentClient.id || ''
      psNav.setItem = currentClientID
      self.$_nav = psNav.items || []
      if (!currentClientID) return self.$_nav
      if (self.currentChannel[currentClientID] === 'MAP') {
        if (self.appNameIs('mwrw')) {
          return concat(self.$_nav, self.$_moduleNav.mw.items)
        } else {
          return concat(self.$_nav, self.$_moduleNav.mt.items)
        }
      } else if (self.currentChannel[currentClientID] === 'ROG') {
        return concat(self.$_nav, self.$_moduleNav.rw.items)
      } else if (self.currentChannel[currentClientID] === 'RA') {
        return concat(self.$_nav, self.$_moduleNav.ra.items)
      } else if (self.currentChannel[currentClientID] === 'DS') {
        return concat(self.$_nav, self.$_moduleNav.ra.items)
      } else if (self.currentChannel[currentClientID] === 'MT') {
        return concat(self.$_nav, self.$_moduleNav.mt.items)
      } else if (self.currentChannel[currentClientID] === 'TR') {
        return concat(self.$_nav, self.$_moduleNav.dtd.items)
      } else if (self.currentChannel[currentClientID] === 'PF') {
        return concat(self.$_nav, self.$_moduleNav.pf.items)
      } else if (self.currentChannel[currentClientID] === 'SKUF') {
        return concat(self.$_nav, self.$_moduleNav.skuflex.items)
      } else if (self.currentChannel[currentClientID] === 'SA') {
        return concat(self.$_nav, self.$_moduleNav.sa.items)
      } else {
        return self.$_nav
      }
    },
    appNameIs() {
      return name => process.env.VUE_APP_PS_BUILD_APP === name
    }
  },
  methods: {
  },
  created() {
  }
}
</script>
