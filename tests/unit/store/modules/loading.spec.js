import loadingModule from '@/store/modules/loading'
import * as TYPE from '@/store/_constant'

let state

describe('store/modules/loading.js', () => {
  beforeAll(() => {
    state = {
      msg: 'Loading...',
      config: {
        msg: 'Loading...',
        size: 'large'
      },
      loading: {
        circle: 0,
        progress: 0
      }
    }
  })

  it('update count data', () => {
    const commit = (type, loading) => loadingModule.mutations[TYPE.SET_COUNT](state, {type, loading})
    loadingModule.actions[TYPE.SET_COUNT]({commit}, {type: 'decrease'})
  })

  it('call get loading data', () => {
    loadingModule.getters[TYPE.GET_LOADING_DATA](state)
  })

  it('call get count data', () => {
    loadingModule.getters[TYPE.GET_PROGRESS](state)
  })
})
