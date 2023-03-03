<template>
  <div class="p-4">
    <template v-if="isCustomPlan">
      <b-alert variant="info" show>This feature does not support for custom plan subscription</b-alert>
    </template>
    <template v-else>
    <b-card class="mb-0" body-class="p-3">

      <!-- Owner Card information -->
      <div class="owner-information mb-4">
        <h5 class="text-muted">
          Owner Information
          <i
            class="fa fa-info-circle"
            v-b-tooltip.hover
            :title="card.message"
          >
          </i>
        </h5>
        <div class="owner-detail">
          <template v-if="card.isLoading && !card.owner">
            <i class="fa fa-circle-o-notch fa-spin"></i>
          </template>

          <template v-else-if="card.owner">
            <div class="d-flex">
              <div class="font-weight-bold">Name:</div>
              <div class="pl-2 text-truncate">
                {{ `${card.owner.last_name} ${card.owner.first_name}` }}
              </div>
            </div>

            <div class="d-flex">
              <div class="font-weight-bold">Email:</div>
              <div class="pl-2 text-truncate">
                {{ card.owner.email }}
              </div>
            </div>
          </template>

          <template v-else>
            <p>Empty</p>
          </template>
        </div>
      </div>

      <!-- Card list -->
      <div class="card-list">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="text-muted mb-0">Payment methods</h5>
          <b-button
            :disabled="stripeLoading"
            variant="success"
            size="sm"
            @click="addNewMethodPayment">
            <i v-if="stripeLoading" class="fa fa-circle-o-notch fa-spin mr-1"></i>
            Add new
          </b-button>
        </div>
        <b-card class="mb-0 grid-card" :body-class="card.isLoading ? '' : 'ready'">
          <template v-if="card.isLoading">
            <div class="text-center">
              <i class="fa fa-circle-o-notch fa-spin"></i>
            </div>
          </template>

          <template v-else>
            <template v-for="method in card.paymentMethods">
              <credit-card
                :key="method.id"
                :totalPaymentMethods="card.paymentMethods.length"
                :payment-id="method.id"
                :card="method.card"
                :holder="method.billing_details"
                :is-current-method="method.id === card.defaultPaymentMethod"
                :show-actions="true"
                @actions="triggerAction"
              />
            </template>
          </template>
        </b-card>
      </div>

      <stripe-checkout
        v-if="stripe.sessionId && stripe.publicKey"
        ref="stripRef"
        :pk="stripe.publicKey"
        :session-id="stripe.sessionId"
        :success-url="stripe.successUrl"
        :cancel-url="stripe.cancelUrl" />
    </b-card>
    </template>
  </div>
</template>

<script>
import moment from 'moment'
import CreditCard from '@/components/Organization/Billing/Cards/CreditCard'
import { StripeCheckout } from '@vue-stripe/vue-stripe'
import { mapActions } from 'vuex'
import {
  FETCH_BILLING_SESSION,
  FETCH_MODIFY_PAYMENT_METHOD,
  FETCH_PAYMENT_METHODS,
  FETCH_PAYMENT_METHODS_SESSION, FETCH_REMOVE_PAYMENT_METHOD
} from '@/store/_constant'
import vToast from '@/shared/notification'
import get from 'lodash/get'

export default {
  name: 'CardManagement',
  components: {
    CreditCard,
    StripeCheckout
  },
  data: () => ({
    card: {
      selected: 0,
      isLoading: false,
      paymentMethods: [],
      defaultPaymentMethod: null,
      owner: null,
      message: null
    },
    stripeLoading: false,
    stripe: {
      sessionId: null,
      publicKey: null,
      cancelUrl: null,
      successUrl: null
    },
    isCustomPlan: false
  }),
  mixins: [vToast],
  methods: {
    ...mapActions({
      _fetchSession: `ps/billingModule/${FETCH_BILLING_SESSION}`,
      _fetchPaymentMethods: `ps/billingModule/${FETCH_PAYMENT_METHODS}`,
      _fetchPaymentMethodCheckout: `ps/billingModule/${FETCH_PAYMENT_METHODS_SESSION}`,
      _modifyPaymentMethod: `ps/billingModule/${FETCH_MODIFY_PAYMENT_METHOD}`,
      _removePaymentMethod: `ps/billingModule/${FETCH_REMOVE_PAYMENT_METHOD}`
    }),
    triggerAction({ type, id }) {
      switch (type) {
        case 'set_default':
          return this.setDefaultPayloadMethod(id)
        case 'remove':
          return this.removePaymentMethod(id)
      }
    },
    buildCallbackUrl() {
      let { protocol, port, hostname, hash } = window.location
      const successQuery = '?status=success'
      const cancelQuery = '?status=cancel'
      hash = hash.replace(successQuery, '')
      hash = hash.replace(cancelQuery, '')
      const baseUrl = `${protocol}//${hostname}${port ? ':' + port : port}/${hash}`
      this.stripe.successUrl = `${baseUrl}${successQuery}`
      this.stripe.cancelUrl = `${baseUrl}${cancelQuery}`
    },
    async addNewMethodPayment() {
      const response = await this.getStripePublicKey()
      if (!response) return null

      this.$nextTick(() => {
        this.$refs.stripRef.redirectToCheckout()
      })
    },
    async getStripePublicKey() {
      try {
        this.stripeLoading = true
        const { publicKey, sessionId } = await this._fetchPaymentMethodCheckout({
          orgId: this.$route.params.orgId,
          payload: {
            success_callback_url: this.stripe.successUrl,
            cancel_callback_url: this.stripe.cancelUrl
          }
        })
        this.stripe = {
          ...this.stripe,
          publicKey,
          sessionId
        }
        return true
      } catch (error) {
        const errMessage = get(error, 'plan', ['Cannot get Stripe config. Please try again later.'])
        this.vToasted('error', errMessage.join(', '))
        return false
      } finally {
        this.stripeLoading = false
      }
    },
    checkQueryStatus() {
      const status = get(this.$route, 'query.status')

      // Scope status
      switch (status) {
        case 'success':
          this.vToasted('success', 'A new payment method has been added successfully.')
          break
        case 'cancel':
          this.vToasted('error', 'Your request add new payment methods has been cancelled.')
          break
      }
      // replace query
      this.$router.replace({
        ...this.$router.currentRoute,
        query: {}
      })
    },
    async getPayloadMethods() {
      try {
        this.card.isLoading = true
        const {
          payment_methods: paymentMethods,
          default_payment_method: defaultPaymentMethod,
          owner,
          message
        } = await this._fetchPaymentMethods({
          orgId: this.$route.params.orgId,
          pagination: {
            limit: 999,
            page: 1
          }
        })

        // map isLoading into method
        const mappingMethods = paymentMethods.map(method => {
          method.card.isLoading = false
          return method
        })

        // set data into config
        this.card = {
          ...this.card,
          paymentMethods: mappingMethods,
          defaultPaymentMethod,
          owner,
          message
        }
      } catch (error) {
        if (error.plan) {
          this.isCustomPlan = true
        } else {
          this.vToasted('error', 'Fail to get payment methods. Please try again later.')
        }
      } finally {
        this.card.isLoading = false
      }
    },
    async setDefaultPayloadMethod(id) {
      this.card.paymentMethods.forEach((method, index) => {
        this.$set(this.card.paymentMethods[index].card, 'isLoading', true)
      })

      try {
        await this._modifyPaymentMethod({
          orgId: this.$route.params.orgId,
          payload: {
            payment_method_id: id
          }
        })

        this.card.defaultPaymentMethod = id
        this.vToasted('success', 'You have changed default payment method successfully.')
        const defaultPaymentMethod = this.card.paymentMethods.find(ele => ele.id === id)
        if (defaultPaymentMethod) {
          const message = `${moment(defaultPaymentMethod.card.exp_month, 'MM').format('MMM')} ${defaultPaymentMethod.card.exp_year}`
          this.vToasted('success', `This card is valid until ${message}.`)
        }
      } catch (error) {
        this.vToasted('error', error.message || 'Fail to set payment method as default. Please try again later.')
      } finally {
        this.card.paymentMethods.forEach((method, index) => {
          this.$set(this.card.paymentMethods[index].card, 'isLoading', false)
        })
      }
    },
    async removePaymentMethod(id) {
      const methodIndex = this.card.paymentMethods.findIndex(method => method.id === id)
      this.$set(this.card.paymentMethods[methodIndex].card, 'isLoading', true)

      try {
        await this._removePaymentMethod({
          orgId: this.$route.params.orgId,
          payload: {
            payment_method_id: id
          }
        })

        this.vToasted('success', 'You have removed a payment method successfully.')
        // fetch again data
        this.getPayloadMethods()
      } catch (error) {
        this.vToasted(
          'error',
          get(error, 'payment_method_id[0]', 'Fail to remove payment method. Please try again later.')
        )
      } finally {
        this.$set(this.card.paymentMethods[methodIndex].card, 'isLoading', false)
      }
    }
  },
  created() {
    this.getPayloadMethods()
    // build callback URL
    this.buildCallbackUrl()
    // show message when Stripe redirect back
    this.checkQueryStatus()
  }
}
</script>

<style lang="scss" scoped>
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins/breakpoints";

.grid-card {
  &::v-deep {
    > .card-body {
      width: 100%;
      max-height: 500px;
      overflow-y: auto;
      background-color: #e4e5e6;
      padding: 10px;
      display: grid;

      &.ready {
        grid-template-columns: 1fr;
        grid-gap: 10px;

        @include media-breakpoint-up(md) {
          grid-template-columns: 1fr 1fr;
        }
      }
    }
  }
}
</style>
