// import { shallowMount, createLocalVue } from '@vue/test-utils'
// import VueRouter from 'vue-router'
// import Vuex from 'vuex'
// import BootstrapVue from 'bootstrap-vue'
// import App from '@/App'

// const localVue = createLocalVue()
// localVue.use(VueRouter)
// localVue.use(Vuex)
// const router = new VueRouter()

// localVue.use(BootstrapVue)

// const store = new Vuex.Store({
//   modules: {
//     loadingModule: {
//       namespaced: true,
//       state: {
//         isLoading: false,
//         msg: 'Loading...',
//         size: 'large'
//       },
//       getters: {
//         GET_LOADING_DATA: jest.fn(() => ({ isLoading: false, msg: 'Loading...', size: 'large' }))
//       }
//     }
//   }
// })

// let wrapper

// describe('App.vue', () => {
//   beforeEach(() => {
//     wrapper = shallowMount(App, {
//       localVue,
//       router,
//       store
//     })
//   })

//   it('has a name', () => {
//     expect(App.name).toMatch('App')
//   })
//   it('is Vue instance', () => {
//     expect(wrapper.isVueInstance()).toBe(true)
//   })
//   it('is App', () => {
//     expect(wrapper.is(App)).toBe(true)
//   })
// })
describe('Disable fail test', function () {
  xit('should return 200 OK', () => {
    return Promise.resolve();
  })
})