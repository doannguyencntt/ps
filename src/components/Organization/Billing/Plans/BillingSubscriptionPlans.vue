<template>
  <div class="d-flex flex-column py-2 px-4 h-100">

    <!-- Billing View -->

    <!-- Mode List -->
    <div key="list" v-show="view.mode === 'list'">
      <div v-if="plans.length" class="w-50">
        <label>Plan Type:</label>
        <b-select
          :disabled="cardLoading"
          :options="planObj.plansTypes"
          v-model="planObj.keyword" />
      </div>

      <div>
        <!-- Loading -->
        <template v-if="cardLoading">
          <p class="mb-0 text-center py-4">
            <i class="fa fa-circle-o-notch fa-spin"></i>
            Loading...
          </p>
        </template>

        <!-- No data -->
        <template v-else-if="!plans.length || (!filterList.length && planObj.keyword)">
          <div class="mt-4">
            <b-alert show variant="primary">
              <h3 class="mb-0">There is no plan {{ this.planObj.keyword ? 'found' : '' }}.</h3>
            </b-alert>
          </div>
        </template>

        <!-- Plan list -->
        <template v-else>
          <div class="billing-list row">
            <template v-for="plan in filterList">
              <div :key="plan.id" class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-12">
                <div class="py-3 h-100">
                  <plan
                    ref="planRef"
                    :plan="plan"
                    :subscription-config="mapSubscriptionConfig"
                    @subscribe="subscribePlan"
                    @unsubscribe="unsubscribePlan"
                    @upgrade="upgradePlan"
                    @downgrade="downgradePlan"
                  />
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>

      <!-- compare mode -->
      <div v-if="isEnableCompareMode && !cardLoading && filterList.length"
           class="d-flex justify-content-center mt-2 mb-3">
        <button class="btn btn--custom" @click="view.mode = 'compare'">
          Compare plans
        </button>
      </div>

      <!-- downgrade, upgrade modal -->
      <modal-up-down-confirm ref="updownModal" :org-id="orgId" />

      <stripe-checkout
        v-if="stripeConfig.sessionId && stripeConfig.publicKey"
        ref="stripRef"
        :pk="stripeConfig.publicKey"
        :session-id="stripeConfig.sessionId"
        :success-url="stripeConfig.successUrl"
        :cancel-url="stripeConfig.cancelUrl" />
    </div>

    <!-- Mode Compare -->
    <div key="compare" v-show="view.mode === 'compare'">
      <button class="btn btn-secondary mt-2" @click="view.mode = 'list'">
        <i class="fa fa-arrow-left mr-1 p-0"></i>
        Back
      </button>
      <compare-plan-config
        class="mt-3"
        :plans="ignoreCustomPlans"
        :configs="ignoreCustomCompareConfig"
        :loading="comparePlan.isLoading"
        :subscription-config="mapSubscriptionConfig"
        @subscribe="subscribePlan"
        @unsubscribe="unsubscribePlan"
        @upgrade="upgradePlan"
        @downgrade="downgradePlan"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import {
  FETCH_PLAN_LIST,
  FETCH_BILLING_SESSION,
  GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID,
  FETCH_REQUEST_UNSUBSCRIBE,
  ACTION_UPDATE_SUBSCRIPTION_DATA,
  GET_REGISTER_PLAN,
  ACTION_REGISTER_PLAN,
  FETCH_PREVIEW_UP_DOWN_SUBSCRIPTION,
  FETCH_AND_STORE_BILLING_SUBSCRIPTION_LIST,
  ACTION_CHANGE_FIRST_CHECK, FETCH_COMPARE_PLAN_CONFIGS
} from '@/store/_constant'
import { StripeCheckout } from '@vue-stripe/vue-stripe'
import vToast from '@/shared/notification'
import commons from '@/shared/mixins'
import Plan from '@/components/Organization/Billing/Plans/Plan'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import defaultsDeep from 'lodash/defaultsDeep'
import ModalUpDownConfirm from '@/components/Organization/Billing/Plans/ModalUpDownConfirm'
import {
  checkingBillingPagePermissions,
  checkingOrganizationPermission
} from '@/components/CustomPermission/billingMixin'
import { isConfigActivated } from '@/shared/utils'
import { googleAnalyticsEventMixins } from '@/shared/googleAnalyticsMixins'
import ComparePlanConfig from '@/components/Organization/Billing/Plans/ComparePlanConfig'

export default {
  name: 'BillingSubscriptionPlans',
  props: {
    plans: Array
  },
  data: () => ({
    orgId: null,
    cardLoading: false,
    isEnableCompareMode: process.env.VUE_APP_PS_ENABLE_COMPARE_SUBSCRIPTION_PLAN === 'true',
    view: {
      mode: 'list' // list, compare
    },
    planObj: {
      keyword: null,
      plansTypes: [
        { text: 'Select All', value: null },
        { text: 'Basic', value: 'basic' },
        { text: 'Customized', value: 'customized' }
      ]
    },
    comparePlan: {
      configs: [],
      isLoading: false
    },
    stripeConfig: {
      cancelUrl: null,
      successUrl: null,
      publicKey: null,
      sessionId: null
    }
  }),
  components: {
    ComparePlanConfig,
    StripeCheckout,
    ModalUpDownConfirm,
    Plan
  },
  mixins: [vToast, commons, checkingBillingPagePermissions, checkingOrganizationPermission(false), googleAnalyticsEventMixins()],
  computed: {
    // getters from store
    ...mapGetters({
      _getRegisterPlan: `ps/billingModule/${GET_REGISTER_PLAN}`,
      _getSubscriptionConfig: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID}`
    }),
    mapSubscriptionConfig() {
      const subscriptionConfig = this._getSubscriptionConfig(this.orgId)
      const currentSubscriptionPlan = this.plans.find(plan => plan.id === get(subscriptionConfig, 'subscription.plan.id'))
      return currentSubscriptionPlan
        ? defaultsDeep(cloneDeep(subscriptionConfig), {
          subscription: {
            plan: currentSubscriptionPlan
          }
        })
        : null
    },
    filterList() {
      const keyword = this.planObj.keyword
      return keyword ? this.plans.filter(plan => {
        switch (keyword) {
          case 'basic':
            return plan.type !== 'DEMAND'
          case 'customized':
            return plan.type === 'DEMAND'
          default:
            return true
        }
      }) : this.plans
    },
    ignoreCustomPlans() {
      const subscribePlanId = get(this._getSubscriptionConfig(this.orgId), 'subscription.plan.id')
      return this.filterList
        .filter(plan =>
          plan.type !== 'CUSTOM' ||
          (plan.type === 'CUSTOM' && plan.id === subscribePlanId)
        )
    },
    ignoreCustomCompareConfig() {
      const subscribePlanId = get(this._getSubscriptionConfig(this.orgId), 'subscription.plan.id')
      return this.comparePlan.configs
        .filter(plan =>
          plan.type !== 'CUSTOM' ||
          (plan.type === 'CUSTOM' && plan.id === subscribePlanId)
        )
        .filter(config => {
          const plan = this.filterList.find(plan => plan.id === config.id)
          return !!plan
        })
    }
  },
  methods: {
    // actions from store
    ...mapActions({
      _changeFirstCheck: `ps/billingModule/${ACTION_CHANGE_FIRST_CHECK}`,
      _fetchAndStoreSubscriptionList: `ps/billingModule/${FETCH_AND_STORE_BILLING_SUBSCRIPTION_LIST}`,
      _fetchPlanList: `ps/billingModule/${FETCH_PLAN_LIST}`,
      _fetchSession: `ps/billingModule/${FETCH_BILLING_SESSION}`,
      _fetchComparePlanConfigs: `ps/billingModule/${FETCH_COMPARE_PLAN_CONFIGS}`,
      _upgradeSubscription: `ps/billingModule/${FETCH_PREVIEW_UP_DOWN_SUBSCRIPTION}`,
      _downgradeSubscription: `ps/billingModule/${FETCH_PREVIEW_UP_DOWN_SUBSCRIPTION}`,
      _unsubscribeSubscription: `ps/billingModule/${FETCH_REQUEST_UNSUBSCRIBE}`,
      _updateSubscriptionData: `ps/billingModule/${ACTION_UPDATE_SUBSCRIPTION_DATA}`,
      _updateRegisterPlan: `ps/billingModule/${ACTION_REGISTER_PLAN}`
    }),
    buildCallbackUrl() {
      let { protocol, port, hostname, hash } = window.location
      const successQuery = `?status=success&mode=${this.view.mode}`
      const cancelQuery = `?status=cancel&mode=${this.view.mode}`
      hash = hash.split(/[?]/)[0]
      const baseUrl = `${protocol}//${hostname}${port ? ':' + port : port}/${hash}`
      this.stripeConfig.successUrl = `${baseUrl}${successQuery}`
      this.stripeConfig.cancelUrl = `${baseUrl}${cancelQuery}`
    },
    checkQueryStatus() {
      const status = get(this.$route, 'query.status')
      const mode = get(this.$route, 'query.mode')

      // Scope status
      switch (status) {
        case 'success':
          this.vToasted('success', 'Subscription has been done successfully.')
          break
        case 'cancel':
          this.vToasted('error', 'Subscription has been cancelled.')
          break
      }

      this.view.mode = ['list', 'compare'].includes(mode) ? mode : 'list'

      // replace query
      this.$router.replace({
        ...this.$router.currentRoute,
        query: {
          mode: this.view.mode
        }
      })
    },
    async initState() {
      // build callback Url
      this.buildCallbackUrl()
      // w8 for rendered and check register plan and redirect
      this.$nextTick(async () => {
        await this.checkAndRedirect()
      })
    },
    async checkAndRedirect() {
      const orgId = this.orgId
      const registerPlan = this._getRegisterPlan
      const subscriptionConfig = this._getSubscriptionConfig(orgId)
      const isActive = isConfigActivated(subscriptionConfig)
      if (registerPlan && registerPlan !== 'CUSTOM' && !isActive) {
        const plan = this.plans.find(plan => plan.type === registerPlan)
        if (plan) {
          // remove register plan
          this._updateRegisterPlan(null)
          await this.subscribePlan(plan.id)
        }
      }
    },
    async getSessionByStripeCode(planId) {
      try {
        const orgId = this.orgId
        const { successUrl, cancelUrl } = this.stripeConfig
        let data = {
          success_callback_url: successUrl,
          cancel_callback_url: cancelUrl,
          plan_id: planId
        }
        return await this._fetchSession({
          orgId,
          data
        })
      } catch (err) {
        this.vToasted('error', err.message || 'Failed to checkout. Please try again later.')
        return null
      }
    },
    async subscribePlan(planId) {
      // show warning do not allow to subscribe another
      // check strip code
      if (!planId) {
        this.vToasted('error', 'Invalid Plan ID')
        return null
      }
      // get session from server
      const response = await this.getSessionByStripeCode(planId)
      if (!response) return null
      // assign to prop stripe component
      this.stripeConfig.sessionId = response.sessionId
      this.stripeConfig.publicKey = response.publicKey
      // wait for strip component render and start to checkout
      this.$nextTick(() => {
        this.$refs.stripRef.redirectToCheckout()
      })
    },
    async unsubscribePlan() {
      try {
        const orgId = this.orgId
        const response = await this._unsubscribeSubscription(orgId)
        this._updateSubscriptionData(response)
        this.vToasted('success', 'Your cancel request is processing.')

        await this._changeFirstCheck(true)
        await this._fetchAndStoreSubscriptionList('?page=1&limit=99')
      } catch (err) {
        this.vToasted('error', err.message || 'Failed to unsubscribe. Please try again later.')
      }
    },
    async upgradePlan(planId) {
      if (!planId) {
        this.vToasted('error', 'Invalid Plan ID')
        return null
      }
      this.$refs.updownModal.setPlan(planId)
      this.$refs.updownModal.show()
    },
    async downgradePlan(planId) {
      if (!planId) {
        this.vToasted('error', 'Invalid Plan ID')
        return null
      }
      this.$refs.updownModal.setPlan(planId)
      this.$refs.updownModal.show()
    },
    async getComparePlanConfigs() {
      try {
        this.comparePlan.isLoading = true
        const subscriptionData = this._getSubscriptionConfig(this.orgId)
        const isActivated = isConfigActivated(subscriptionData)
        const { results } = await this._fetchComparePlanConfigs({
          appName: process.env.VUE_APP_PS_BUILD_APP,
          orgId: this.$route.params.orgId
        })
        this.comparePlan.configs = results
          .map(config => {
            if (!isActivated || subscriptionData.subscription.plan.id !== config.id) return config

            config.tenancy_config = get(subscriptionData, 'subscription_config.tenancy_config', config.tenancy_config)
            return config
          })
      } catch (err) {
        this.vToasted('error', err.message || 'Failed to get plan config information. Please try again later.')
      } finally {
        this.comparePlan.isLoading = false
      }
    }
  },
  async created() {
    // show loaders
    this.cardLoading = true
    // get params
    this.orgId = this.$route.params.orgId
    // get config if enabled compare mode
    this.isEnableCompareMode && await this.getComparePlanConfigs()
    // get plan and build callback url
    await this.initState()
    // check status and show toast notify
    this.checkQueryStatus()
    // hide loaders
    this.cardLoading = false
  },
  mounted() {
    // View Plan - GA
    this.gaHandleViewItem('view_plan', 1)
  },
  watch: {
    'view.mode'(newMode, oldMode) {
      const replaceMode = (mode) => {
        this.stripeConfig[mode] = this.stripeConfig[mode].replace(`mode=${oldMode}`, `mode=${newMode}`)
      }
      replaceMode('successUrl')
      replaceMode('cancelUrl')

      this.$router.replace({
        ...this.$router.currentRoute,
        query: {
          mode: newMode
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.btn--custom {
  border-color: #39b2d5;
  border-radius: 0.25rem;
  color: #39b2d5;
  padding: 10px 30px;

  &:hover {
    color: #117a8b;
    border-color: #117a8b;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .25s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
