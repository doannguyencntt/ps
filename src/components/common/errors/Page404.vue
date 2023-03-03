<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="6" sm="6">
          <div class="clearfix">
            <h1 class="float-left display-3 mr-4">404</h1>
            <h4 class="pt-3">Oops! You're lost.</h4>
            <p class="text-muted">The page you are looking for was not found.</p>
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-center">
        <b-col md="3" sm="3">
          <router-link
            :to="currentClientFromStore && currentClientFromStore.id ?
              {'name': 'ps-dashboard', params: {client_id: currentClientFromStore.id}} : {'name': 'ps-dashboard'}"
            class="btn btn-primary btn-sm">
            Back to the homepage
          </router-link>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'

export default {
  name: 'Page404',
  computed: {
    ...mapGetters({
      currentClientFromStore: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`
    })
  }
}
</script>
