import api from '../api'
import portalAxios from './portalAxios'

export const deleteUserInOrgApi = (orgId, userId, data) => {
  return new Promise((resolve, reject) => {
    api.delete(`/v1/organizations/${orgId}/users/${userId}/`, {data}).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getUsersInOrgApi = (orgId, filter = {}) => {
  return new Promise((resolve, reject) => {
    api.get(`/v1/organizations/${orgId}/users/`, { params: filter }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const inviteUserToOrgApi = (orgId, data) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/organizations/' + orgId + '/users/invitation/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

export const forceInviteUserToOrgApi = (orgId, data) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/organizations/' + orgId + '/users/force-invitation/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

export const resendInvitationApi = (orgId, userId, data) => {
  return new Promise((resolve, reject) => {
    api.post(`/v1/organizations/${orgId}/users/${userId}/resend-invitation/`, data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

export const declineOrgInvitationApi = (notificationId) => {
  return new Promise((resolve, reject) => {
    portalAxios.put(`/v1/user/notification/${notificationId}/is-seen/decline/`).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getUserInfoInOrgApi = (orgId, userId) => {
  return new Promise((resolve, reject) => {
    api.get(`/v1/organizations/${orgId}/users/${userId}/`).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getUserAccessInOrgApi = (orgId, userId, params) => {
  return new Promise((resolve, reject) => {
    api.get(`/v1/organizations/${orgId}/users/${userId}/client/`, params).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const updateUserAccessInOrgApi = (orgId, userId, data) => {
  return new Promise((resolve, reject) => {
    api.post(`/v1/organizations/${orgId}/users/${userId}/clients/grant_access/`, data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const approvePendingWorkspace = (orgId, clientId) => {
  return new Promise((resolve, reject) => {
    api.post(`/v1/organizations/${orgId}/clients/${clientId}/approve/`).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const updateRoleApi = (orgId, userId, data) => {
  return new Promise((resolve, reject) => {
    api.put(`/v1/organizations/${orgId}/users/${userId}/role/`, data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const searchUserOrg = (clientId, filter = {}) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/organizations/' + clientId + '/users/', { params: filter }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}
