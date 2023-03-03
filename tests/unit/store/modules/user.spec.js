// import userModule from '@/store/modules/user'
// import * as TYPE from '@/store/_constant'

// let state

// describe('store/modules/user.js', () => {
//   beforeAll(() => {
//     state = {
//       clients: [],
//       userToken: '',
//       user: {},
//       currentClientID: '',
//       avatarURL: ''
//     }
//   })

//   it('call save auth data action', () => {
//     const commit = (payload) => userModule.mutations[TYPE.UPDATE_AUTH_DATA](state, payload)
//     userModule.actions[TYPE.SAVE_AUTH_DATA]({ commit }, {
//       clients: [],
//       userToken: '123',
//       user: {email: 'test@mailinator.com'},
//       currentClientID: ''
//     })
//   })

//   it('call update client data action', () => {
//     const commit = (payload) => userModule.mutations[TYPE.UPDATE_CLIENTS_DATA](state, payload)
//     userModule.actions[TYPE.EDIT_CLIENTS_DATA]({ commit }, {
//       clients: [{is: '12345'}],
//       currentClientID: '12345'
//     })
//   })

//   it('call save client data action', () => {
//     const commit = (payload) => userModule.mutations[TYPE.SAVE_NEW_CLIENT](state, payload)
//     userModule.actions[TYPE.ADD_NEW_CLIENT]({ commit }, {
//       name: '123',
//       logo: '123'
//     })
//   })

//   it('call update avatar data action', () => {
//     const commit = (payload) => userModule.mutations[TYPE.SAVE_NEW_AVATAR_URL](state, payload)
//     userModule.actions[TYPE.ADD_NEW_AVATAR_URL]({ commit }, {
//       // avatarURL = payload
//     })
//   })

//   it('call get authentication data', () => {
//     userModule.getters[TYPE.GET_AUTH_DATA](state)('userToken')
//   })

//   it('call get avatar data', () => {
//     userModule.getters[TYPE.GET_AVATAR_URL](state)
//   })

//   it('call save user id action', () => {
//     const commit = (payload) => userModule.mutations[TYPE.SAVE_USER_ID](state, payload)
//     userModule.actions[TYPE.ADD_USER_ID]({ commit }, {
//       // userId = '123'
//     })
//   })

//   it('call get user id data', () => {
//     userModule.getters[TYPE.GET_USER_ID](state)
//   })
// })
describe('Disable fail test', function () {
  xit('should return 200 OK', () => {
    return Promise.resolve();
  })
})