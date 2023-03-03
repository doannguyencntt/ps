<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="6" sm="6">
          <div class="clearfix">
            <h1 class="float-left display-3 mr-4">500</h1>
            <h4 class="pt-3">Oops! There is an server error.</h4>
            <p class="text-muted">Please try again after a few minutes.</p>
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
import { GET_CURRENT_CLIENT } from '@/store/_constant'

export default {
  name: 'Page500',
  computed: {
    ...mapGetters({
      currentClientFromStore: `ps/userModule/${GET_CURRENT_CLIENT}`
    })
  }
}
</script>
