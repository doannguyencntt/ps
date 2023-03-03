import api from '../api'

const getClientInfo = (currentClientId) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/clients/' + currentClientId + '/').then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const updateClientInfo = (currentClientId, clientUpdate) => {
  return new Promise((resolve, reject) => {
    api.patch('/v1/clients/' + currentClientId + '/', clientUpdate).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const addNewClient = (newClient) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/clients/', newClient).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const getUserRoleByClient = (clientId, userId) => {
  return new Promise((resolve, reject) => {
    api.get(`/v1/clients/${clientId}/users/${userId}/settings/`).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

// org
const getWorkspacesByOrg = (id, dataFilter) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/organizations/' + id + '/clients/', { params: dataFilter }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const updateWorkspaceInOrg = (orgId, clientId, data) => {
  return new Promise((resolve, reject) => {
    api.put('/v1/organizations/' + orgId + '/clients/' + clientId + '/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const deleteWorkspaceInOrg = (orgId, clientId) => {
  return new Promise((resolve, reject) => {
    api.delete('/v1/organizations/' + orgId + '/clients/' + clientId + '/').then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const addWorkspaceToOrg = (orgId, data) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/organizations/' + orgId + '/clients/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

export default {
  getClientInfo,
  updateClientInfo,
  addNewClient,
  getUserRoleByClient,
  getWorkspacesByOrg,
  updateWorkspaceInOrg,
  deleteWorkspaceInOrg,
  addWorkspaceToOrg
}
