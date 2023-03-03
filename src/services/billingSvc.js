import api from '@/api'

const getPlanList = async (orgId, pagination) => {
  try {
    const response = await api.get(`/v1/organizations/${orgId}/plans/`, {
      params: pagination
    })
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const checkout = async (orgId, data) => {
  try {
    const response = await api.post(`/v1/organizations/${orgId}/checkout/`, data)
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const balanceCheckout = async (orgId, data) => {
  try {
    const response = await api.post(`/v1/organizations/${orgId}/balance/checkout/`, data)
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const unsubscribe = async (orgId) => {
  try {
    const response = await api.get(`/v1/organizations/${orgId}/unsubscription/`)
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const getSubscriptionList = async (query) => {
  try {
    const response = await api.get(`v1/me/organizations/and/subscriptions/${query}`, {
      params: {
        ignoreLoading: true
      }
    })
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const changeGradeSubscription = async (orgId, data) => {
  try {
    const response = await api.post(`/v1/organizations/${orgId}/grade-changes/checkout/`, data)
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const previewUpDownSubscription = async (orgId, data) => {
  try {
    const response = await api.post(`/v1/organizations/${orgId}/grade-changes/preview/`, data)
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const getComparePLanConfigs = async (orgId, appName) => {
  try {
    const response = await api.get(`/v1/organizations/${orgId}/config/plans`, {
      params: {
        app: appName
      }
    })
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const getPaymentMethods = async (orgId, queryParams) => {
  try {
    const response = await api.get(`/v1/organizations/${orgId}/payment-methods/`, {
      params: queryParams
    })
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const paymentMethodsCheckout = async (orgId, payload) => {
  try {
    const response = await api.post(`/v1/organizations/${orgId}/payment-methods/checkout/`, payload)
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const modifyPaymentMethod = async (orgId, payload) => {
  try {
    const response = await api.post(`/v1/organizations/${orgId}/payment-methods/modification/`, payload)
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

const removePaymentMethod = async (orgId, payload) => {
  try {
    const response = await api.delete(`/v1/organizations/${orgId}/payment-methods/modification/`, {
      data: payload
    })
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

export default {
  // billing module
  getPlanList,
  getSubscriptionList,
  checkout,
  unsubscribe,
  changeGradeSubscription,
  previewUpDownSubscription,
  // dashboard feature
  balanceCheckout,
  getComparePLanConfigs,
  // payment methods
  getPaymentMethods,
  paymentMethodsCheckout,
  modifyPaymentMethod,
  removePaymentMethod
}
