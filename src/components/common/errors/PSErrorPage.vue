<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="6" sm="6">
          <div class="clearfix">
            <p class="text-muted">Oops! You are no longer connected or have access to that workspace.</p>
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
  name: 'PSErrorPage',
  computed: {
    ...mapGetters({
      currentClientFromStore: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`
    })
  }
}
</script>
