import api from '../api'
import portalAxios from './portalAxios'

const deleteUser = (clientID, userID) => {
  return new Promise((resolve, reject) => {
    api.delete('/v1/clients/' + clientID + '/users/' + userID + '/').then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

const confirmTokenClientInvitation = (data) => {
  return new Promise((resolve, reject) => {
    portalAxios.post('/v1/clients/users/invitation/accept/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

const confirmTokenOrgInvitation = (data) => {
  return new Promise((resolve, reject) => {
    portalAxios.post('/v1/organizations/users/invitation/accept/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

const updateUserClientRole = (clientID, userID, data) => {
  return new Promise((resolve, reject) => {
    portalAxios.put('/v1/clients/' + clientID + '/users/' + userID + '/roles/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data || error)
    })
  })
}

const searchUserClient = (clientId, filter = {}) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/clients/' + clientId + '/users/', { params: filter }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export default {
  deleteUser,
  confirmTokenClientInvitation,
  confirmTokenOrgInvitation,
  updateUserClientRole,
  searchUserClient
}
