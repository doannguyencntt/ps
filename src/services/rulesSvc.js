import api from '../api'
import { getSize } from '@/shared/utils'

export const getAccessRulesFn = (sizeId, dataFilter, sizeType) => {
  return new Promise((resolve, reject) => {
    const getRulesUrl = `/v1/${getSize(sizeType)}/${sizeId}/access-rules/`
    api.get(getRulesUrl, { params: dataFilter }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getAccessRuleFn = (sizeId, ruleId, sizeType) => {
  return new Promise((resolve, reject) => {
    const getRulesUrl = `/v1/${getSize(sizeType)}/${sizeId}/access-rules/${ruleId}/`
    api.get(getRulesUrl).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const createAccessRuleFn = (sizeId, data, sizeType) => {
  return new Promise((resolve, reject) => {
    const createRuleUrl = `/v1/${getSize(sizeType)}/${sizeId}/access-rules/`
    api.post(createRuleUrl, data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const updateAccessRuleFn = (sizeId, ruleId, data, sizeType) => {
  return new Promise((resolve, reject) => {
    const ruleUrl = `/v1/${getSize(sizeType)}/${sizeId}/access-rules/${ruleId}/`
    api.put(ruleUrl, data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const deleteAccessRuleFn = (sizeId, ruleId, sizeType) => {
  return new Promise((resolve, reject) => {
    const getRulesUrl = `/v1/${getSize(sizeType)}/${sizeId}/access-rules/${ruleId}/`
    api.delete(getRulesUrl).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getPemissionGroupsFn = (sizeId, dataFilter, sizeType) => {
  dataFilter.ignoreLoading = true
  return new Promise((resolve, reject) => {
    const permissionUrl = `/v1/${getSize(sizeType)}/${sizeId}/permission-groups/`
    api.get(permissionUrl, { params: dataFilter }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}
