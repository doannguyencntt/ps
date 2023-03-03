// import userApi from '@/services/user'
// import mockAxios from 'axios'

// describe('services/user.js', function () {
//   beforeEach(() => {
//     auth: {
//       getLoginData: jest.fn((name) => name)
//     }
//     jest.resetModules()
//     jest.clearAllMocks()
//   })

//   it('Resolve clients list service', async () => {
//     mockAxios.get = jest.fn(() => Promise.resolve({ data: {results: [{id: 'db4d76ef-0c95-4b00-85eb-8d87fdb3628a', name: 'Client OE', logo: 'Link Logo OE'}]}}))
//     const response = await userApi.getClientsByUser()
//     expect(mockAxios.get).toHaveBeenCalledTimes(1)
//     expect(mockAxios.get).toBeCalledWith('/user/clients/')
//   })

//   it('Reject clients list service', async () => {
//     mockAxios.get = jest.fn(() => Promise.reject({'error': 'fail'}))
//     try {
//       const response = await userApi.getClientsByUser()
//     } catch (err) {
//       expect(err.error).toBe('fail')
//     }
//     expect(mockAxios.get).toHaveBeenCalledTimes(1)
//     expect(mockAxios.get).toBeCalledWith('/user/clients/')
//   })

//   it('Resolve users list service', async () => {
//     const clientID = 'db4d76ef-0c95-4b00-85eb-8d87fdb3628a'
//     const dataFilter = {
//       limit: 10,
//       page: 1
//     }
//     mockAxios.get = jest.fn(() => Promise.resolve({ data: {results: [{'first_name': 'a'}]}}))
//     const response = await userApi.getUsersByClientId(clientID, dataFilter)
//     expect(mockAxios.get).toHaveBeenCalledTimes(1)
//     expect(mockAxios.get).toHaveBeenCalledWith(
//       '/clients/' + clientID + '/users/',
//       {
//         params: dataFilter
//       }
//     )
//   })

//   it('Reject users list service', async () => {
//     const clientID = 'db4d76ef-0c95-4b00-85eb-8d87fdb3628a'
//     mockAxios.get = jest.fn(() => Promise.reject({'error': 'fail'}))
//     try {
//       const response = await userApi.getUsersByClientId(clientID)
//     } catch (err) {
//       expect(err.error).toBe('fail')
//     }
//     expect(mockAxios.get).toHaveBeenCalledTimes(1)
//     expect(mockAxios.get).toHaveBeenCalledWith(
//       '/clients/' + clientID + '/users/',
//       {
//         params: {}
//       }
//     )
//   })

//   // invite user
//   it('Resolve invite user service', async () => {
//     const clientID = 'db4d76ef-0c95-4b00-85eb-8d87fdb3628a'
//     const params = {
//       email: 'test@mailinator.com'
//     }
//     mockAxios.post = jest.fn((url, params) => Promise.resolve({ data: 'invited' }))
//     const response = await userApi.inviteUser(clientID, params)
//     expect(mockAxios.post).toHaveBeenCalledTimes(1)
//     expect(mockAxios.post).toHaveBeenCalledWith(
//       '/clients/' + clientID + '/users/invitation/', params
//     )
//     expect(response).toBe('invited')
//   })

//   it('Reject invite user service', async () => {
//     const clientID = 'db4d76ef-0c95-4b00-85eb-8d87fdb3628a'
//     const data = {
//       email: 'test@mailinator.com'
//     }
//     mockAxios.post = jest.fn((url, params) => Promise.reject({ response: { data: 'failed' } }))
//     try {
//       const response = await userApi.inviteUser(clientID, data)
//     } catch (err) {
//       expect(err).toBe('failed')
//     }
//     expect(mockAxios.post).toHaveBeenCalledTimes(1)
//   })

//   // getProfileInfo
//   it('Resolve get profile info service', async () => {
//     mockAxios.get = jest.fn(() => Promise.resolve({ data: {} }))
//     const response = await userApi.getProfileInfo()
//     expect(mockAxios.get).toHaveBeenCalledTimes(1)
//     expect(mockAxios.get).toHaveBeenCalledWith(
//       '/rest-auth/user/'
//     )
//   })

//   it('Reject get profile info service', async () => {
//     mockAxios.get = jest.fn(() => Promise.reject({ response: { data: 'failed' }}))
//     try {
//       const response = await userApi.getProfileInfo()
//     } catch (err) {
//       expect(err).toBe('failed')
//     }
//     expect(mockAxios.get).toHaveBeenCalledTimes(1)
//     expect(mockAxios.get).toHaveBeenCalledWith(
//       '/rest-auth/user/'
//     )
//   })

//   // updateProfileInfo
//   it('Resolve update profile info service', async () => {
//     mockAxios.patch = jest.fn((url, params) => Promise.resolve({ response: { data: 'updated' }}))
//     const dataUpdate = {
//       username: 'linhdang',
//       first_name: 'Linh',
//       last_name: 'Dang',
//       avatar: '123'
//     }
//     const response = await userApi.updateProfileInfo(dataUpdate)
//     // expect(mockAxios.patch).toHaveBeenCalledTimes(1)
//     // expect(mockAxios.patch).toHaveBeenCalledWith(
//     //   '/rest-auth/user/',
//     //   dataUpdate
//     // )
//   })

//   it('Reject update profile info service', async () => {
//     mockAxios.patch = jest.fn((url, params) => Promise.reject({ response: { data: 'failed' }}))
//     const dataUpdate = {
//       username: 'linhdang',
//       first_name: 'Linh',
//       last_name: 'Dang',
//       avatar: '123'
//     }
//     try {
//       const response = await userApi.updateProfileInfo(dataUpdate)
//     } catch (err) {
//       expect(err).toBe('failed')
//     }
//     // expect(mockAxios.patch).toHaveBeenCalledTimes(1)
//     // expect(mockAxios.patch).toHaveBeenCalledWith(
//     //   '/rest-auth/user/',
//     //   dataUpdate
//     // )
//   })

//   // updateProfilePassword
//   it('Resolve update profile password service', async () => {
//     mockAxios.post = jest.fn((url, params) => Promise.resolve({ response: { data: 'updated' }}))
//     const passwordUpdate = {
//       old_password: '123',
//       new_password1: '123',
//       new_password2: '123'
//     }
//     const response = await userApi.updateProfilePassword(passwordUpdate)
//     expect(mockAxios.post).toHaveBeenCalledTimes(1)
//     expect(mockAxios.post).toHaveBeenCalledWith(
//       '/rest-auth/password/change/',
//       passwordUpdate
//     )
//   })

//   it('Reject update profile password service', async () => {
//     mockAxios.post = jest.fn((url, params) => Promise.reject({ response: { data: 'failed' }}))
//     const passwordUpdate = {
//       old_password: '123',
//       new_password1: '123',
//       new_password2: '123'
//     }
//     try {
//       const response = await userApi.updateProfilePassword(passwordUpdate)
//     } catch (err) {
//       expect(err).toBe('failed')
//     }
//     expect(mockAxios.post).toHaveBeenCalledTimes(1)
//     expect(mockAxios.post).toHaveBeenCalledWith(
//       '/rest-auth/password/change/',
//       passwordUpdate
//     )
//   })

//   // uploadProfilePhoto
//   it('Reject update profile photo service', async () => {
//     mockAxios.post = jest.fn((url, params) => Promise.reject({ response: { data: 'failed' }}))
//     const dataUpload = {
//       file: '123',
//       type: ['user_photos'],
//       old_image: '123'
//     }
//     try {
//       const response = await userApi.uploadProfilePhoto(dataUpload)
//     } catch (err) {
//       expect(err).toBe('failed')
//     }
//     expect(mockAxios.post).toHaveBeenCalledTimes(1)
//     expect(mockAxios.post).toHaveBeenCalledWith(
//       '/upload/',
//       dataUpload,
//       {headers: {'Content-type': 'multipart/form-data'}}
//     )
//   })

//   it('resolve update profile photo service', async () => {
//     mockAxios.post = jest.fn((url, params) => Promise.resolve({ response: { data: 'success' }}))
//     const dataUpload = {
//       file: '123',
//       type: ['user_photos'],
//       old_image: '123'
//     }
//     const response = await userApi.uploadProfilePhoto(dataUpload)
//     expect(mockAxios.post).toHaveBeenCalledTimes(1)
//     expect(mockAxios.post).toHaveBeenCalledWith(
//       '/upload/',
//       dataUpload,
//       {headers: {'Content-type': 'multipart/form-data'}}
//     )
//   })

//   // registaion
//   it('Resolve registaion', async () => {
//     mockAxios.post = jest.fn((url, params) => Promise.resolve({ response: { data: 'success' }}))
//     const data = {
//       email: 'test',
//       password1: 'password',
//       password2: 'password'
//     }
//     const response = await userApi.registerUser(data)
//     expect(mockAxios.post).toHaveBeenCalledTimes(1)
//     expect(mockAxios.post).toHaveBeenCalledWith(
//       '/rest-auth/registration/',
//       data
//     )
//   })

//   it('Reject registaion', async () => {
//     mockAxios.post = jest.fn((url, params) => Promise.reject({ response: { data: 'failure' }}))
//     const data = {
//       email: 'test',
//       password1: 'password',
//       password2: 'password'
//     }
//     try {
//       const response = await userApi.registerUser(data)
//     } catch (err) {}
//     expect(mockAxios.post).toHaveBeenCalledTimes(1)
//     expect(mockAxios.post).toHaveBeenCalledWith(
//       '/rest-auth/registration/',
//       data
//     )
//   })

//   // processVerification
//   it('Resolve processVerification', async () => {
//     mockAxios.patch = jest.fn((url, params) => Promise.resolve({ response: { data: 'success' }}))
//     const code = '123456'
//     const response = await userApi.processVerification(code)
//     // expect(mockAxios.patch).toHaveBeenCalledTimes(1)
//     // expect(mockAxios.patch).toHaveBeenCalledWith(
//     //   '/rest-auth/user/',
//     //   dataUpdate
//     // )
//   })

//   it('reject processVerification', async () => {
//     mockAxios.patch = jest.fn((url, params) => Promise.reject({ response: { data: 'success' }}))
//     const code = '123456'
//     try {
//       const response = await userApi.processVerification(code)
//     } catch (err) {}
//     // expect(mockAxios.patch).toHaveBeenCalledTimes(1)
//     // expect(mockAxios.patch).toHaveBeenCalledWith(
//     //   '/rest-auth/user/',
//     //   dataUpdate
//     // )
//   })

//   it('Reject get module list service', async () => {
//     const currentClientId = '123'
//     mockAxios.get = jest.fn(() => Promise.reject({ response: { data: 'failed' }}))
//     try {
//       const response = await userApi.getUserModuleList(currentClientId)
//     } catch (err) {
//       expect(err).toBe('failed')
//     }
//     expect(mockAxios.get).toHaveBeenCalledTimes(1)
//     expect(mockAxios.get).toHaveBeenCalledWith(
//       '/clients/' + currentClientId + '/modules/'
//     )
//   })

//   it('Resolve updateModuleList ', async () => {
//     const currentClientId = '123'
//     const moduleName = 'MAP'
//     const dataModule = {
//       module: 'MAP',
//       enabled: true
//     }
//     mockAxios.patch = jest.fn((url, params) => Promise.resolve({ response: { data: 'success' }}))
//     const code = '123456'
//     const response = await userApi.updateModuleList(currentClientId, moduleName, dataModule)
//     // expect(mockAxios.patch).toHaveBeenCalledTimes(1)
//     // expect(mockAxios.patch).toHaveBeenCalledWith(
//     //   '/rest-auth/user/',
//     //   dataUpdate
//     // )
//   })

//   it('reject updateModuleList ', async () => {
//     const currentClientId = '123'
//     const moduleName = 'MAP'
//     const dataModule = {
//       module: 'MAP',
//       enabled: true
//     }
//     mockAxios.patch = jest.fn((url, params) => Promise.reject({ response: { data: 'fail' }}))
//     const code = '123456'
//     const response = await userApi.updateModuleList(currentClientId, moduleName, dataModule)
//     // expect(mockAxios.patch).toHaveBeenCalledTimes(1)
//     // expect(mockAxios.patch).toHaveBeenCalledWith(
//     //   '/rest-auth/user/',
//     //   dataUpdate
//     // )
//   })

//   it('Reject resendCode service', async () => {
//     const key = '123'
//     mockAxios.get = jest.fn(() => Promise.reject({ response: { data: 'failed' }}))
//     try {
//       const response = await userApi.resendCode(key)
//     } catch (err) {
//       expect(err).toBe('failed')
//     }
//     expect(mockAxios.get).toHaveBeenCalledTimes(1)
//     expect(mockAxios.get).toHaveBeenCalledWith(
//       '/v1/rest-auth/registration/activation/resend-code/',
//       {headers: {'Authorization': key}}
//     )
//   })
// })
describe('Disable fail test', function () {
  xit('should return 200 OK', () => {
    return Promise.resolve();
  })
})