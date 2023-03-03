
<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col md="12" lg="12">
        <b-nav>
          <b-nav-item :to="{ name: 'ps-OrgDetail'}" :class="'btn'" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-info"></i> Information</b-nav-item>
          <b-nav-item :to="{ name: 'ps-OrgClients'}" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-grid"></i> Workspaces</b-nav-item>
          <b-nav-item :to="{ name: 'ps-OrgUsers', params: {orgId, type: 'org'}}" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-people"></i> Users</b-nav-item>
          <b-nav-item :to="{ name: 'ps-OrgUsers', params: {orgId, type: 'client'}}" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-lock-open"></i> External Users</b-nav-item>
          <b-nav-item v-if="role === 'OWNER' || role === 'ADMIN'" :to="{ name: 'ps-OrgActivities' }" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-clock"></i> Activities</b-nav-item>
          <b-nav-item :to="{ name: 'ps-OrgAccessRules' }" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-shield"></i> Access Rules</b-nav-item>
          <b-nav-item :to="{ name: 'ps-OrgCustomRoles' }" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-lock"></i> Custom Roles</b-nav-item>
          <template v-if="isBillingEnabled">
            <b-nav-item v-if="role === 'OWNER' || role === 'ADMIN'" :to="{ name: 'ps-BillingSubscription' }" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-credit-card"></i> Billing </b-nav-item>
          </template>
        </b-nav>
        <router-view class="mt-1"></router-view>
      </b-col>
    </b-row>
    <!--Profile-->
  </div>
</template>

<script>
import { getOrgsAndClientsApi } from '@/services/organization'
import { isBillingEnabled } from '@/shared/utils'

export default {
  name: 'ps-OrgSettings',
  data() {
    return {
      isBillingEnabled: isBillingEnabled(),
      orgId: '',
      role: ''
    }
  },
  methods: {
    getRoll() {
      getOrgsAndClientsApi().then((response) => {
        if (response && response.results) {
          response.results.forEach(element => {
            if (element.organization.id === this.orgId) {
              this.role = element.organization.role.key
            }
          })
        }
      }).catch(() => {})
    }
  },
  created () {
    this.orgId = this.$route.params.orgId
    this.getRoll()
  },
  watch: {
    '$route.params.orgId' (newVal) {
      this.orgId = newVal
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
