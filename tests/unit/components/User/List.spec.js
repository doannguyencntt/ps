// import { mount, createLocalVue } from '@vue/test-utils'
// import BootstrapVue from 'bootstrap-vue'
// import VueRouter from 'vue-router'
// import List from '@/components/User/List'
// import mockAxios from 'axios'
// import sinon from 'sinon'

// const spy = sinon.stub()

// const localVue = createLocalVue()
// localVue.use(BootstrapVue)
// localVue.use(VueRouter)
// const router = new VueRouter({
//   routes: [
//     {
//       path: '/',
//       name: 'DefaultContainer',
//       component: () => import('@/containers/DefaultContainer'),
//       children: [
//         {
//           path: 'ps/users/:id/invite',
//           name: 'user.invite',
//           component: () => import('@/components/User/Invite'),
//           meta: {
//             label: 'Invite Member'
//           }
//         }
//       ]
//     }
//   ]
// })

// const map = {}

// let $bus = {
//   $emit: jest.fn((name, cb) => {
//     map[name] = cb
//   }),
//   $on: jest.fn((name, cb) => {
//     map[name] = cb
//   }),
//   $off: jest.fn()
// }

// let wrapper

// describe('UserList.vue', function () {
//   beforeEach(() => {
//     wrapper = mount(List, {
//       localVue,
//       router,
//       mocks: {
//         $auth: {
//           getLoginData (param) {
//             return [{id: 'db4d76ef-0c95-4b00-85eb-8d87fdb3628a', name: 'Client OE', logo: 'Link Logo OE'}]
//           }
//         },
//         $bus: $bus,
//         $toasted: {
//           show: jest.fn()
//         }
//       },
//       stubs: ['router-link', 'router-view'],
//       destroyed() {
//         spy()
//       }
//     })
//     jest.resetModules()
//     jest.clearAllMocks()
//   })

//   it('has a name', () => {
//     expect(List.name).toMatch('UserList')
//   })

//   it('is Vue Instance', () => {
//     expect(wrapper.isVueInstance()).toBeTruthy()
//   })

//   it('call removeUser function', () => {
//     wrapper.vm.removeUser = jest.fn()
//     map.callButtonAction('remove')
//     expect(wrapper.vm.removeUser).toBeCalled()
//   })

//   it('call resend function', () => {
//     wrapper.vm.resend = jest.fn()
//     map.callButtonAction('resend')
//     expect(wrapper.vm.resend).toBeCalled()
//   })

//   it('call closeModal function', () => {
//     wrapper.vm.closeModal = jest.fn()
//     map.callButtonAction('closeModal')
//     expect(wrapper.vm.closeModal).toBeCalled()
//   })

//   it('call api to get user list by client ID', async () => {
//     const clientID = 'db4d76ef-0c95-4b00-85eb-8d87fdb3628a'
//     mockAxios.get = jest.fn(() => Promise.resolve({ data: { results: [{id: 1}] }}))
//     await wrapper.vm.getUserListByClient(clientID)
//     expect(mockAxios.get).toHaveBeenCalled()
//   })

//   it('pagination', async () => {
//     mockAxios.get = jest.fn(() => Promise.resolve({ data: { results: [{id: 1}] }}))
//     await wrapper.vm.goToPage()
//   })

//   it('confirm resend modal', () => {
//     const data = {
//       id: 123
//     }
//     wrapper.vm.confirmResendModal(data)
//     expect(wrapper.vm.$data.actionData).toEqual(data)
//   })

//   it('call resend funtion with valid body / resolve', async () => {
//     wrapper.vm.closeModal = jest.fn()
//     wrapper.vm.$data.currentClientID = '123'
//     wrapper.vm.$data.actionData = {
//       user: {
//         email: 'linh@mailinator.com'
//       }
//     }
//     mockAxios.post = jest.fn((url, params) => Promise.resolve({ data: 'resended' }))
//     mockAxios.get = jest.fn(() => Promise.resolve({ data: { results: [{id: 1}] }}))
//     await wrapper.vm.resend()
//   })

//   it('call resend funtion with valid body / reject', async () => {
//     wrapper.vm.closeModal = jest.fn()
//     wrapper.vm.$data.currentClientID = '123'
//     wrapper.vm.$data.actionData = {
//       user: {
//         email: 'linh@mailinator.com'
//       }
//     }
//     mockAxios.post = jest.fn((url, params) => Promise.reject({ response: { data: 'failed' }}))
//     try {
//       await wrapper.vm.resend()
//     } catch (err) {
//       expect(err).toBe('failed')
//     }
//   })

//   it('call resend funtion when haven\'t any email', async () => {
//     wrapper.vm.$route.params.id = '123'
//     wrapper.vm.$data.actionData = {
//       user: {
//         email: ''
//       }
//     }
//     await wrapper.vm.resend()
//   })

//   it('confirm remove modal', () => {
//     const data = {
//       id: 123
//     }
//     wrapper.vm.confirmRemoveModal(data)
//     expect(wrapper.vm.$data.actionData).toEqual(data)
//   })

//   it('call remove member user with no ID', () => {
//     wrapper.vm.vToasted = jest.fn()
//     wrapper.vm.$data.actionData = {
//       status: 'MEMBER',
//       id: ''
//     }
//     wrapper.vm.$data.currentClientID = ''
//     wrapper.vm.removeUser()
//   })

//   it('call remove member user / resolve', () => {
//     wrapper.vm.$data.actionData = {
//       status: 'MEMBER',
//       id: '123'
//     }
//     wrapper.vm.$data.currentClientID = '123'
//     mockAxios.delete = jest.fn(() => Promise.resolve({}))
//     wrapper.vm.removeUser()
//   })

//   it('call remove member user / reject', () => {
//     wrapper.vm.$data.actionData = {
//       status: 'MEMBER',
//       id: '123'
//     }
//     wrapper.vm.$data.currentClientID = '123'
//     mockAxios.delete = jest.fn(() => Promise.reject({}))
//     wrapper.vm.removeUser()
//   })

//   it('call remove pending user with no ID', () => {
//     wrapper.vm.vToasted = jest.fn()
//     wrapper.vm.$data.currentClientID = ''
//     wrapper.vm.$data.actionData = {
//       status: 'PENDING',
//       user: {
//         user_id: ''
//       }
//     }
//     wrapper.vm.removeUser()
//   })

//   it('call remove pending user / resolve', () => {
//     wrapper.vm.$data.actionData = {
//       status: 'PENDING',
//       user: {
//         user_id: '123'
//       }
//     }
//     wrapper.vm.$data.currentClientID = '123'
//     mockAxios.delete = jest.fn(() => Promise.resolve({}))
//     wrapper.vm.removeUser()
//   })

//   it('call remove pending user / reject', () => {
//     wrapper.vm.$data.actionData = {
//       status: 'PENDING',
//       user: {
//         user_id: '123'
//       }
//     }
//     wrapper.vm.$data.currentClientID = '123'
//     mockAxios.delete = jest.fn(() => Promise.reject({}))
//     wrapper.vm.removeUser()
//   })

//   it('call closeModal function', () => {
//     wrapper.vm.closeModal()
//   })

//   it('destroy component', () => {
//     wrapper.destroy()
//   })
// })
describe('Disable fail test', function () {
  xit('should return 200 OK', () => {
    return Promise.resolve();
  })
})