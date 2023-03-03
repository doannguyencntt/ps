<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center text-center">
        <b-col md="6" sm="6">
          <p class="text-muted">Oops! You don't have permission to access that area.</p>
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
