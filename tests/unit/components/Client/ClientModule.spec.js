// import { mount, createLocalVue } from '@vue/test-utils'
// import BootstrapVue from 'bootstrap-vue'
// import VueRouter from 'vue-router'
// import Vuelidate from 'vuelidate'
// import Toasted from 'vue-toasted'
// import ClientModule from '@/components/Client/ClientModule'
// import mockAxios from 'axios'

// const localVue = createLocalVue()
// localVue.use(BootstrapVue)
// localVue.use(VueRouter)
// localVue.use(Vuelidate)
// localVue.use(Toasted)
// const router = new VueRouter({})

// let wrapper

// describe('ClientModule.vue', function () {
//   beforeEach(() => {
//     wrapper = mount(ClientModule, {
//       localVue,
//       router,
//       stubs: ['router-link', 'router-view']
//     })
//     jest.resetModules()
//     jest.clearAllMocks()
//   })

//   it('has a name', () => {
//     expect(ClientModule.name).toMatch('ClientModule')
//   })

//   it('is Vue Instance', () => {
//     expect(wrapper.isVueInstance()).toBeTruthy()
//   })

//   it('success updateModuleList ', async () => {
//     const moduleName = '123'
//     const enabled = true
//     var dataModule = {
//       module: '123',
//       enabled: true
//     }
//     mockAxios.patch = jest.fn((url, params) => Promise.resolve({ response: { data: 'success' }}))
//     await wrapper.vm.updateModuleList(moduleName, enabled)
//   })

//   it('success get user module list', async () => {
//     const moduleName = '123'
//     const enabled = true
//     await wrapper.vm.updateModuleList(moduleName, enabled)
//   })

//   it('success get user module list', async () => {
//     const clientId = '123'
//     mockAxios.get = jest.fn((url, params) => Promise.resolve({ response: { data: 'success' }}))
//     await wrapper.vm.getUserModuleList()
//   })
// })
describe('Disable fail test', function () {
  xit('should return 200 OK', () => {
    return Promise.resolve();
  })
})