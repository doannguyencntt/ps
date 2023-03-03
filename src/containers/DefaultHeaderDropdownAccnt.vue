<template>
  <AppHeaderDropdown right no-caret  id="menu-drop" >
    <template slot="header">
      <img
        :src="getAvatarURL || placeholderURL"
        class="img-avatar"
        alt="admin@bootstrapmaster.com"
        width="35px"
        height="35px"
      />
    </template>
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center">
        <strong>Settings</strong>
      </b-dropdown-header>
      <b-dropdown-item class="drop-down-client" :to="{ name: 'profile' }">
        <i class="icons icon-user text-dark" />Profile
      </b-dropdown-item>
      <b-dropdown-item class="drop-down-client" @click.native="processLogout">
        <i class="icons icon-lock-open text-dark" />Logout
      </b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
import { mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import placeholderURL from './../assets/img/profile-placeholder.png'

export default {
  name: 'DefaultHeaderDropdownAccnt',
  components: {
    AppHeaderDropdown
  },
  data: () => {
    return {
      placeholderURL: placeholderURL
    }
  },
  computed: {
    ...mapGetters({
      getAvatarURL: `ps/userModule/${TYPE.GET_AVATAR_URL}`
    })
  },
  methods: {
    async processLogout() {
      try {
        await this.$auth.logout()
      } catch (error) {
        console.log('error', error)
      }
      // this.$auth.clearAuth()
      // this.$router.replace({name: 'Login'})
      this.$bus.$emit('relogin')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'DefaultHeaderDropdownAccnt.scss';
</style>
