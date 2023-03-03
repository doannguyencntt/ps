export default {
  setItem: (name, data) => {
    localStorage.setItem(name, data)
  },
  getItem: (name) => {
    return localStorage.getItem(name)
  },
  removeItem: (name) => {
    localStorage.removeItem(name)
  },
  removeAll: () => {
    localStorage.clear()
  }
}
