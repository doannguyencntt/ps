import moment from 'moment';
<template>
  <b-card
    class="mb-0"
    header-class="d-none"
    body-class="p-3 d-flex flex-nowrap">
    <div class="w-100">
      <div class="d-flex">
        <div class="logo-card">
          <img :src="getTemplateLogo" :alt="card.brand">
        </div>
        <div class="px-2 w-100 overflow-hidden">
          <p class="mb-0 text-truncate" v-b-tooltip.hover
             :title="`${card.brand} •••• ${card.last4 }`">
            <b class="text-capitalize">{{ card.brand }}</b>
            <b> •••• {{ card.last4 }} </b>
          </p>
          <p class="mb-0 text-muted text-truncate"
             :title="`Expires ${ card.exp_month } - ${ card.exp_year }`">
            Expires {{ card.exp_month | getMonthName}} {{ card.exp_year }}
          </p>
        </div>
      </div>
      <div class="d-flex mt-2">
        <div class="overflow-hidden w-100">
          <div class="d-flex">
            <div class="font-weight-bold">Name:</div>
            <div v-b-tooltip.hover :title="holder.name" class="pl-2 text-truncate">
              {{ holder.name }}
            </div>
          </div>
          <div class="d-flex">
            <div class="font-weight-bold">Email:</div>
            <div v-b-tooltip.hover :title="holder.email" class="pl-2 text-truncate">
              {{ holder.email }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showActions" class="d-flex flex-column align-items-center">
      <template v-if="isCurrentMethod">
        <b-button
          variant="primary"
          size="sm"
          class="mb-2 square-button custom-effect"
          title="Current payload method">
          <i class="fa fa-toggle-on"></i>
        </b-button>
      </template>
      <template v-else>
        <b-button
          variant="outline-primary"
          size="sm"
          class="mb-2 square-button"
          :disabled="card.isLoading"
          title="Set as default payload method"
          @click="fireEvent('set_default')">
          <i class="fa fa-toggle-off"></i>
        </b-button>
      </template>
      <b-button v-if="showRemoveBtn"
        class="square-button mb-2"
        variant="outline-danger"
        size="sm"
        :disabled="card.isLoading"
        title="Remove payload method"
        @click="fireEvent('remove')">
        <i class="fa fa-trash"></i>
      </b-button>
    </div>
  </b-card>
</template>

<script>
import moment from 'moment'

export default {
  name: 'CreditCard',
  props: {
    totalPaymentMethods: Number,
    paymentId: String,
    card: Object,
    holder: Object,
    isCurrentMethod: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getTemplateLogo() {
      switch (this.card.brand) {
        case 'visa':
        case 'visa_debit':
          return require('../../../../assets/img/card-logo/visa.svg')
        case 'mastercard':
        case 'mastercard_debit':
        case 'mastercard_prepaid':
          return require('../../../../assets/img/card-logo/mastercard.svg')
        case 'amex':
          return require('../../../../assets/img/card-logo/amex.svg')
        case 'discover':
          return require('../../../../assets/img/card-logo/discover.svg')
        case 'diners':
          return require('../../../../assets/img/card-logo/diners.svg')
        case 'jcb':
          return require('../../../../assets/img/card-logo/jcb.svg')
        case 'unionpay':
          return require('../../../../assets/img/card-logo/unionpay.svg')
        default:
          return null
      }
    },
    showRemoveBtn() {
      return !(this.totalPaymentMethods === 1)
    }
  },
  methods: {
    fireEvent(type) {
      // do not fire action when fetching api
      if (this.card.isLoading) return
      this.$emit('actions', { type, id: this.paymentId })
    }
  },
  filters: {
    getMonthName(value) {
      return moment(value, 'MM').format('MMM')
    }
  }
}
</script>

<style scoped lang="scss">
.logo-card img {
  width: 42px;
  height: 42px;
}

.square-button {
  width: 30px;
  height: 30px;
}

.custom-effect {
  cursor: default;
  border: 1px solid #20a8d8!important;
  background-color: #20a8d8!important;
  outline: none!important;
  box-shadow: none!important;
}
</style>
