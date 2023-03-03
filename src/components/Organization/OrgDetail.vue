
<template>
  <div class="">
    <b-card no-body>
      <div slot="header">
        <span class="align-middle">
          <strong>Organization Information</strong>
        </span>
        <div class="pull-right">
        </div>
      </div>
      <b-card-body>
        <b-row>
          <div class="input-group">
            <b-col md="12" lg="12">
              <label>Name</label>
              <b-form-input :readonly="userRole !== 'ADMIN' && userRole !== 'OWNER'" v-on:input="setName()" type="text" v-model.trim="org.name" :class="{'is-invalid': $v.org.name.$dirty && $v.org.name.$anyError}">
              </b-form-input>
              <div class="invalid-feedback" v-if="$v.org.name.$dirty && !$v.org.name.required">Name is required</div>
              <div class="invalid-feedback" v-if="$v.org.name.$dirty && !$v.org.name.minLength">Name must have at least {{$v.org.name.$params.minLength.min}} characters.</div>
            </b-col>
          </div>
        </b-row>
      </b-card-body>
      <div v-if="userRole === 'ADMIN' || userRole === 'OWNER'" slot="footer">
        <b-button v-on:click.prevent="updateClientInfo()" :disabled="this.$v.org.$anyError" variant="primary" size="sm">
          <i class="fa fa-dot-circle-o"/> Update
        </b-button>
      </div>
    </b-card>
  </div>
</template>

<script>
import apiOrg from '@/services/organization'
import { required, minLength } from 'vuelidate/lib/validators'
import vToast from '@/shared/notification'
import commons from '@/shared/mixins'
import { mapActions, mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import { getUserInfoInOrgApi } from '@/services/userOrg'

export default {
  name: 'OrgDetail',
  data () {
    return {
      org: {
        name: null,
        logo: null
      },
      currentOrgId: null,
      userRole: ''
    }
  },
  mixins: [vToast, commons],
  validations: {
    org: {
      name: {
        required,
        minLength: minLength(1)
      }
    }
  },
  computed: {
    ...mapGetters({
      userIdFromStore: `ps/userModule/${TYPE.GET_USER_ID}`
    })
  },
  methods: {
    ...mapActions({
      updateOrgToStore: `ps/userModule/${TYPE.UPDATE_ORG}`
    }),
    setName () {
      this.$v.org.name.$touch()
    },
    updateClientInfo () {
      this.$v.org.name.$touch()
      var data = {
        name: this.org.name
      }
      if (this.org.logo) {
        data.logo = this.org.logo
      }
      apiOrg.updateOrgInfo(this.currentOrgId, data)
        .then(response => {
          this.updateOrgToStore(response)
          this.vToasted('success', 'Organization information has been updated successfully')
        })
        .catch(response => {
          this.vToasted('error', 'Fail to update organization information. Please try again or contact administrator.')
        })
    },
    getOrgInfo (id) {
      apiOrg.getOrgInfo(id).then(response => {
        this.org = Object.assign({}, response)
      }).catch(response => {
        this.org = {}
      })
    },
    getOrgRole () {
      if (this.userIdFromStore) {
        getUserInfoInOrgApi(this.currentOrgId, this.userIdFromStore).then(response => {
          if (response && response.role) {
            this.userRole = response.role && response.role.key ? response.role.key : ''
          }
        }).catch(() => {
          this.userRole = ''
        })
      }
    }
  },
  mounted () {
    this.currentOrgId = this.$route.params.orgId
    if (this.currentOrgId) {
      this.getOrgInfo(this.currentOrgId)
      this.getOrgRole()
    } else {
      this.org = {}
    }
  },
  watch: {
    '$route.params.orgId': function(newVal, oldVal) {
      this.currentOrgId = newVal
      if (this.currentOrgId) {
        this.getOrgInfo(this.currentOrgId)
        this.getOrgRole()
      } else {
        this.org = {}
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  // @import "ClientDetail.scss";
</style>
