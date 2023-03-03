# plat-portal-web

Web app of the portal

## Add private registry
npm set registry http://npm-registry.channelprecision.com

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### Run your end-to-end tests
```
yarn run test:e2e
```

### Run your unit tests
```
yarn run test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Install submodules
```
git submodule sync --recursive
git submodule update --init --recursive

```
### Build submodules
```
npm run build:rw
npm run build:mw
node server/build-module.js
```

### loading
Default loading type is progress bar on the top
To custom, Please pass another type to axios config
Ex: api.get('/v1/user/clients/', {loading: 'circle'})
