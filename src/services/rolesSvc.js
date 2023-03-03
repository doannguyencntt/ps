import api from '../api'
import { getSize } from '@/shared/utils'

export const getCustomRolesFn = (clientId, dataFilter, sizeType) => {
  return new Promise((resolve, reject) => {
    const url = `/v1/${getSize(sizeType)}/${clientId}/custom-roles/`
    api.get(url, { params: dataFilter }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getCustomRoleFn = (clientId, roleId, sizeType) => {
  return new Promise((resolve, reject) => {
    const url = `/v1/${getSize(sizeType)}/${clientId}/custom-roles/${roleId}/`
    api.get(url).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const createCustomRoleFn = (clientId, data, sizeType) => {
  return new Promise((resolve, reject) => {
    const url = `/v1/${getSize(sizeType)}/${clientId}/custom-roles/`
    api.post(url, data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const updateCustomRoleFn = (clientId, roleId, data, sizeType) => {
  return new Promise((resolve, reject) => {
    const url = `/v1/${getSize(sizeType)}/${clientId}/custom-roles/${roleId}/`
    api.put(url, data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const previewCustomRoleFn = (clientId, data, sizeType) => {
  return new Promise((resolve, reject) => {
    const url = `/v1/${getSize(sizeType)}/${clientId}/custom-roles-preview/`
    api.post(url, data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const assignCustomRoleFn = (clientId, userId, data, sizeType) => {
  return new Promise((resolve, reject) => {
    const url = `/v1/${getSize(sizeType)}/${clientId}/users/${userId}/custom-roles/`
    api.post(url, data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const deleteCustomRoleFn = (clientId, roleId, sizeType) => {
  return new Promise((resolve, reject) => {
    const url = `/v1/${getSize(sizeType)}/${clientId}/custom-roles/${roleId}/`
    api.delete(url).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getUserCustomRolesFn = (clientId, userId, sizeType) => {
  return new Promise((resolve, reject) => {
    const url = `/v1/${getSize(sizeType)}/${clientId}/users/${userId}/custom-roles/`
    api.get(url).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}
