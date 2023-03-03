<template>
  <div class="h-100">
    <b-card
      class="h-100 mb-0"
      :header-bg-variant="getVariantOfHeader"
      header-class="font-1_25x d-flex justify-content-center align-items-center"
      body-class="pb-0">
      <template v-slot:header>
        <p class="mb-0">
          {{ plan.name }}
        </p>
        <b-badge v-if="isCurrentPlanSubscribed && subscriptionConfig.subscription.status" class="ml-2" variant="light">
          {{ getLabelStatus(subscriptionConfig.subscription.status) }}
        </b-badge>
      </template>

      <div class="billing-info text-center">
        <!-- price -->
        <template v-if="plan.type !== 'CUSTOM'">
          <div class="billing-price hr">
            <span class="font-2x font-weight-bold">${{ plan.price }}</span>
            <span class="font-1_25x"> / </span>
            <span class="font-1_25x text-capitalize">{{ plan.period }}</span>
          </div>
        </template>
        <template v-else>
          <div class="billing-price hr">
            <span class="font-2x font-weight-bold">CUSTOM</span>
          </div>
        </template>

        <!-- criteria list -->
        <div
          :class="[isCurrentPlanSubscribed && plan.criteria.length ? 'hr' : 'mb-3']"
          class="billing-criteria">
          <template v-if="plan.criteria && plan.criteria.length">
            <template v-for="(criteria, index) in plan.criteria">
              <p :key="index"
                 :class="[index === plan.criteria.length - 1 ? 'mb-0' : 'mb-3']"
                 class="prefix-icon font-weight-bold">
                ✔ {{ criteria }}
              </p>
            </template>
          </template>
        </div>

        <!-- Resource config list -->

        <!-- expired data -->
        <div
          v-if="isCurrentPlanSubscribed"
          class="billing-criteria"
        >
          <p :class="[shouldHideNextBillingDate ? 'mb-0' : 'mb-3']">
            Expiration Date:
            <template v-if="subscriptionConfig.subscription.expired_in">
              <b>{{ subscriptionConfig.subscription.expired_in | moment('MMM Do, YYYY') }}</b>
            </template>
            <template v-else>
              <b>None</b>
            </template>
          </p>
          <p v-if="!shouldHideNextBillingDate" class="mb-3">
            Next Billing Date:
            <template v-if="subscriptionConfig.subscription.expired_in">
              <b>{{ subscriptionConfig.subscription.expired_in | moment('MMM Do, YYYY') }}</b>
            </template>
            <template v-else>
              <b>None</b>
            </template>
          </p>
        </div>
      </div>

      <template v-slot:footer>
        <div class="text-center">
          <!-- loading state -->
          <b-button v-if="_getLoadingStatus" disabled>
            <div class="d-inline-block">
              <i class="fa fa-spin fa-circle-o-notch" />
            </div>
          </b-button>
          <b-button
            v-else
            :disabled="_getLoadingStatus"
            :variant="statusOfSubscriberBtn"
            v-ga-click-event="{ gaHandleClickEvent, params: { action: `${plan.name}_btn_clicked`, gaValue: 1 } }"
            @click="handleSubscribeAction(plan.id)">
            {{ getTextOfSubscriberBtn }}
          </b-button>
        </div>
      </template>
    </b-card>

    <!-- unsubscribe modal -->
    <b-modal
      title="Please confirm"
      centered
      @ok="unsubscribePlan()"
      v-model="unsubscribeModal.show">
      Are you sure you want to unsubscribe this plan?
      <template slot="modal-footer" slot-scope="{ok, cancel}">
        <b-button variant="warning" @click="ok()">
          <i class="icon-check"></i> Yes, I understand &amp; confirm!
        </b-button>
        <b-button @click="cancel()">
          <i class="icon-close"></i> No
        </b-button>
      </template>
    </b-modal>

    <!-- custom type plan -->
    <b-modal
      modal-sm
      title="Notification"
      header-bg-variant="info"
      ok-variant="info"
      v-model="futureFeatureModal.show">
      <div>
        <p>{{ supportMsg }}</p>
      </div>
      <template #modal-footer>
        <div class="text-right">
          <b-button @click="futureFeatureModal.show = false" class="text-white" variant="info">
            Ok
          </b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  GET_BILLING_SUBSCRIPTION_LOADING_STATUS
} from '@/store/_constant'
import startCase from 'lodash/startCase'
import get from 'lodash/get'
import { googleAnalyticsEventMixins } from '@/shared/googleAnalyticsMixins'

export default {
  name: 'PlanComponent',
  props: {
    isAllowToSubscribe: {
      type: Boolean,
      default: true
    },
    subscriptionConfig: Object, // can be null
    plan: Object,
    type: String
  },
  mixins: [googleAnalyticsEventMixins()],
  data: () => ({
    isCurrentPlanSubscribed: false,
    futureFeatureModal: {
      show: false
    },
    unsubscribeModal: {
      show: false
    },
    supportMsg: process.env.VUE_APP_SUPPORT_MESSAGE
  }),
  filters: {
    toStartCase(label) {
      return startCase(label || '')
    }
  },
  computed: {
    ...mapGetters({
      _getLoadingStatus: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_LOADING_STATUS}`
    }),
    // basic function to get type of current plan
    getStateSubscriber() {
      switch (true) {
        case get(this.plan, 'type') === 'CUSTOM' && !this.isCurrentPlanSubscribed:
          return 'custom'
        case !get(this.subscriptionConfig, 'subscription.is_active'):
          return 'subscribe'
        case this.isCurrentPlanSubscribed:
          return 'unsubscribe'
        case this.plan.price > this.subscriptionConfig.subscription.plan.price:
          return 'upgrade'
        default:
          return 'downgrade'
      }
    },
    shouldHideNextBillingDate() {
      const status = get(this.subscriptionConfig, 'subscription.status')
      return ['expired', 'canceled'].includes(status)
    },
    statusOfSubscriberBtn() {
      const status = this.getStateSubscriber
      switch (status) {
        case 'custom':
        case 'subscribe':
        case 'upgrade':
          return 'info'
        case 'unsubscribe':
          return 'danger'
        case 'downgrade':
          return 'warning'
        default:
          return ''
      }
    },
    getTextOfSubscriberBtn() {
      if (this._getLoadingStatus) return 'Checking...'
      const status = this.getStateSubscriber
      // special case
      const currentType = get(this.subscriptionConfig, 'subscription.plan.type')
      if (currentType === 'CUSTOM' && status !== 'unsubscribe') return 'Downgrade'

      switch (status) {
        case 'custom':
          return 'Email Now'
        case 'subscribe':
          return 'Subscribe'
        case 'unsubscribe':
          return 'Unsubscribe'
        case 'upgrade':
          return 'Upgrade'
        case 'downgrade':
          return 'Downgrade'
        default:
          return ''
      }
    },
    getLabelStatus() {
      return status => {
        let text = null
        switch (status) {
          case 'active':
            text = 'Current'
            break
          default:
            text = status
            break
        }
        return startCase(String(text))
      }
    },
    getVariantOfHeader() {
      if (!this.subscriptionConfig || !this.isCurrentPlanSubscribed) return ''
      return this.subscriptionConfig.subscription.is_active
        ? 'success'
        : 'danger'
    }
  },
  methods: {
    // redirect action base on current state of plan
    handleSubscribeAction(planId, mode) {
      // return if api is fetching
      if (this._getLoadingStatus) return false
      // get state button
      const status = this.getStateSubscriber
      // special case when current subscription is CUSTOM, only show alert message
      const currentType = get(this.subscriptionConfig, 'subscription.plan.type')
      if (currentType === 'CUSTOM' && status !== 'custom') {
        this.customPlan()
        return false
      }
      // do action base on state
      switch (status) {
        case 'custom':
          this.customPlan()
          break
        case 'subscribe':
          this.subscribePlan(planId)
          break
        case 'unsubscribe':
          this.unsubscribeModal.show = true
          break
        case 'upgrade':
          this.upgradePlan(planId)
          break
        case 'downgrade':
          this.downgradePlan(planId)
          break
        default:
          break
      }
    },
    // subscribe a plan
    subscribePlan(subscribeData) {
      this.$emit('subscribe', subscribeData)
    },
    // un-subscribe a plan
    unsubscribePlan() {
      this.$emit('unsubscribe')
    },
    // upgrade a plan
    upgradePlan(planId) {
      this.$emit('upgrade', planId)
    },
    // downgrade a plan
    downgradePlan(planId) {
      this.$emit('downgrade', planId)
    },
    // custom plan
    customPlan() {
      this.futureFeatureModal.show = true
    }
  },
  watch: {
    subscriptionConfig: {
      immediate: true,
      handler(subscriptionConfig) {
        this.isCurrentPlanSubscribed = subscriptionConfig && subscriptionConfig.subscription.plan.id === this.plan.id
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.font-1_25x {
  font-size: 1.25rem
}

.font-2x {
  font-size: 2rem
}

.billing-description {
  color: rgb(117, 117, 117);
}

.hr::after {
  content: '';
  display: block;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, .1);
}
</style>
