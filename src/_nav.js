export default {
  _items: [
    {
      name: 'Home',
      icon: 'icon-home',
      to: {name: 'ps-dashboard'}
    }
  ],
  set setItem (clientID = '') {
    var self = this
    self._items = [
      {
        name: 'Home',
        icon: 'icon-home',
        to: clientID ? {name: 'ps-dashboard', params: {client_id: clientID}} : {name: 'ps-dashboard'}
      }
    ]
  },
  get items () {
    return this._items
  }
}
