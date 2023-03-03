import { mount, createLocalVue } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue'
import Redirect from '@/components/common/Redirect'

const localVue = createLocalVue()
localVue.use(BootstrapVue)

const $route = {
  path: '/some/path',
  params: {
    path: '/some/path'
  }
}

const $router = {
  routes: [
    {
      path: '/',
      name: 'DefaultContainer',
      component: () => import('@/containers/DefaultContainer')
    }
  ],
  replace: jest.fn()
}

let wrapper

describe('Redirect.vue', function () {
  beforeEach(() => {
    wrapper = mount(Redirect, {
      localVue,
      mocks: {
        $route,
        $router
      }
    })
  })

  it('has a name', () => {
    expect(Redirect.name).toMatch('Redirect')
  })

  it('is Vue Instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
