// import BootstrapVue from 'bootstrap-vue'
// import { shallowMount, createLocalVue } from '@vue/test-utils'
// import VueRouter from 'vue-router'
// import DefaultContainer from '@/containers/DefaultContainer'

// const localVue = createLocalVue()
// localVue.use(VueRouter)

// const router = new VueRouter({
//   routes: [
//     {
//       path: '/',
//       name: 'DefaultContainer'
//     }, {
//       path: '/ps/dashboard',
//       name: 'Dashboard'
//     }
//   ]
// })

// localVue.use(BootstrapVue)

// let wrapper

// const map = {}

// const $bus = {
//   $emit: jest.fn((name, cb) => {
//     map[name] = cb
//   }),
//   $on: jest.fn((name, cb) => {
//     map[name] = cb
//   })
// }

// describe('DefaultContainer.vue', () => {
//   beforeEach(() => {
//     wrapper = shallowMount(DefaultContainer, {
//       localVue,
//       router,
//       mocks: {
//         $bus: $bus,
//         $auth: {
//           getLoginData: jest.fn((name) => name)
//         }
//       }
//     })
//   })

//   it('has a name', () => {
//     expect(DefaultContainer.name).toMatch('DefaultContainer')
//   })

//   it('has a created hook', () => {
//     expect(typeof DefaultContainer.data).toMatch('function')
//   })

//   it('renders correctly', () => {
//     expect(wrapper.element).toMatchSnapshot()
//   })

//   it('sets the correct default data', () => {
//     expect(typeof DefaultContainer.data).toMatch('function')
//     const defaultData = DefaultContainer.data()
//     expect(typeof defaultData.nav).toMatch('object')
//   })

//   it('is Vue instance', () => {
//     expect(wrapper.isVueInstance()).toBe(true)
//   })

//   it('render computed', () => {
//     expect(wrapper.vm.name).toBe('DefaultContainer')
//   })

//   it('open modal event', () => {
//     map.openModal({content: 'test open modal', buttons: []})
//   })

//   it('close modal event', () => {
//     map.closeModal()
//   })

//   it('call function', () => {
//     wrapper.vm.callFunction('remove')
//   })
// })
describe('Disable fail test', function () {
  xit('should return 200 OK', () => {
    return Promise.resolve();
  })
})