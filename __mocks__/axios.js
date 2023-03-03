const mockAxios = jest.genMockFromModule('axios')

mockAxios.interceptors = mockAxios.interceptors || {}
mockAxios.interceptors.response = mockAxios.interceptors.response || {}
mockAxios.interceptors.response.use = jest.fn()

mockAxios.create = jest.fn(() => mockAxios)

mockAxios.get = jest.fn(() => Promise.resolve({ data: {} }))
mockAxios.post = jest.fn((url, params) => Promise.resolve({ data: {} }))

export default mockAxios