<template>
  <b-card>
    <div slot="header">
      <b-row align-v="center">
        <b-col class="col-6">
          <span>
            <strong>Access Rules</strong>
          </span>
        </b-col>
        <b-col class="col-6 text-right">
          <b-button variant="primary" size="sm" v-if="canShowManage"
            @click="goToPage('CreateRule')">
            <i class="icons icon-plus"></i> Create
          </b-button>
        </b-col>
      </b-row>
    </div>
    <b-row class="justify-content-center">
      <b-col class="col-2">
        <b-form-select v-model="selectedType" :options="types" text-field="name" @change="searchChange()"></b-form-select>
      </b-col>
      <b-col class="col-4">
        <b-form-group>
          <b-input-group class="search cancel-action">
            <b-form-input v-model="dataFilter.keyword" @keyup.enter="searchChange()" placeholder="Search">
            </b-form-input>
            <i v-show="dataFilter.keyword"  @click="dataFilter.keyword = ''; searchChange()" class="icon-close cancel-icon"></i>
            <b-input-group-append>
              <b-button @click="searchChange()">
                <i class="icons icon-magnifier"></i>
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <div>
      <b-table
        hover
        outlined
        striped
        show-empty
        responsive="sm"
        thead-class="thead-light"
        :items="accessRules.results || []"
        :fields="userRole === 'STAFF' ? fields.filter(f => f.key !== 'action') : fields">
        <template v-slot:empty>
          <div class="text-center py-2" v-if="accessRulesLoading">
            <i class="fa fa-circle-o-notch fa-spin"></i>
            Loading...
          </div>
          <div class="align-middle d-flex justify-content-center align-items-center" v-else>There are no access rules to show</div>
        </template>
        <template v-slot:cell(ownerEmail)="data">
          {{ data.item.type_created === 'USER' ? data.item.owner.email : 'System' }}
        </template>
        <template v-slot:cell(action)="data">
          <!--Manage dropdown-->
          <b-dropdown variant="primary" size="sm" class="mr-1"
            v-if="canShowManage"
            :disabled="!canEnableManage(data.item)"
          >
            <template slot="button-content">
              <i class="icon-settings"></i> Manage
            </template>
            <b-dropdown-item-button class="btn-sm p-0"
              :disabled="!canEnableManage(data.item)"
              @click="goToPage('EditRule', data.item.id)">
              <span class="text"><i class="icons icon-cursor"></i> Edit</span>
            </b-dropdown-item-button>
            <b-dropdown-item-button class="btn-sm p-0"
              :disabled="!canEnableManage(data.item)"
              @click="actionData=data.item, $bvModal.show('remove')">
              <span class="text"><i class="icons icon-close small-icon"></i> Remove</span>
            </b-dropdown-item-button>
          </b-dropdown>
        </template>
      </b-table>
      <nav class="mt-3 custom-pagination" v-if="accessRules.count && accessRules.count > dataFilter.limit">
        <b-pagination
          align="center"
          @input="loadPage()"
          :total-rows="accessRules.count"
          :per-page="dataFilter.limit"
          v-model="dataFilter.page"
          hide-goto-end-buttons
          prev-text="Prev"
          next-text="Next"
          hide-ellipsis
        >
        </b-pagination>
      </nav>
    </div>
    <!-- <b-alert show v-else-if="isInitialized && (!accessRules.results || !accessRules.results.length)">No access rules</b-alert> -->
    <b-modal
        id="remove"
        title="Please confirm"
        centered
        @ok="removeAccessRule()"
        @cancel="actionData=null, $bvModal.hide('remove')"
    >
      Are you sure you want to remove this rule?
      <template slot="modal-footer" slot-scope="{ok, cancel}">
        <b-button variant="warning" @click="ok()">
          <i class="icon-check"></i> Yes, I understand &amp; confirm!
        </b-button>
        <b-button variant @click="cancel()">
          <i class="icon-close"></i> No
        </b-button>
      </template>
    </b-modal>
  </b-card>
</template>

<script>
import { getAccessRulesFn, deleteAccessRuleFn } from '@/services/rulesSvc'
import vToast from '@/shared/notification'
import { mapGetters } from 'vuex'
import { GET_USER_ID } from '@/store/_constant'
import { sizes } from '@/shared/utils'
import permissionMixin from '@/components/CustomPermission/permissionMixin'

export default {
  name: 'ps-RulesCommon',
  mixins: [vToast, permissionMixin],
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      query: '',
      accessRules: [],
      dataFilter: {
        page: this.$route.query.page || 1,
        limit: 10,
        keyword: '',
        option_filter: null,
        is_user_assignment: this.config.type === sizes.CLIENT
      },
      fields: [
        {
          key: 'name',
          label: 'Name',
          class: 'vertical-content'
        },
        {
          key: 'ownerEmail',
          label: 'Author',
          class: 'vertical-content'
        },
        {
          key: 'action',
          label: 'Actions',
          class: 'action-td vertical-content'
        }
      ],
      actionData: null,
      isInitialized: false,
      types: [{
        name: 'All',
        value: null
      }, {
        name: 'System',
        value: 'SYSTEM'
      }, {
        name: 'Custom',
        value: 'USER'
      }],
      selectedType: null,
      accessRulesLoading: false
    }
  },
  computed: {
    ...mapGetters({
      getUserId: `ps/userModule/${GET_USER_ID}`
    }),
    canShowManage() {
      return this.userRole && this.userRole !== 'STAFF'
    },
    canEnableManage(data) {
      return (data) => {
        const validPermission =
          data.type_created !== 'SYSTEM' && this.userRole !== 'STAFF'
        if (this.config.type === sizes.ORG) {
          return validPermission
        }
        return validPermission && data.level !== 'ORGANIZATION'
      }
    }
  },
  mounted () {
    const isValidType = this.types.map(type => type.value).includes(this.$route.query.type)
    this.dataFilter.option_filter = isValidType ? this.$route.query.type : null
    this.dataFilter.keyword = this.$route.query.search
      ? this.$route.query.search
      : this.dataFilter.keyword
    this.selectedType = isValidType ? this.$route.query.type : null
    if (this.config.id) this.getRules(this.config.id, this.dataFilter)
    if (this.getUserId && this.config.id) {
      this.getUserData(this.config.id, this.getUserId)
    }
  },
  methods: {
    cleanObj (obj) {
      for (let prop in obj) {
        if (!obj[prop]) {
          delete obj[prop]
        }
      }
      return obj
    },
    getRules (sizeId, dataFilter = {}) {
      const params = this.cleanObj({...dataFilter})
      this.accessRulesLoading = true
      getAccessRulesFn(sizeId, params, this.config.type).then(res => {
        this.accessRules = res
        this.isInitialized = true
        this.accessRulesLoading = false
      }).catch(() => {
        this.accessRules = []
        this.isInitialized = true
        this.accessRulesLoading = false
      })
    },
    searchChange () {
      this.dataFilter.page = 1
      this.dataFilter.option_filter = this.selectedType
      this.getRules(this.config.id, this.dataFilter)
      const query = {
        search: this.dataFilter.keyword !== '' ? this.dataFilter.keyword.trim() : undefined
      }
      if (this.dataFilter.page) query.page = this.dataFilter.page
      if (this.dataFilter.option_filter) query.type = this.dataFilter.option_filter
      this.$router.push({
        params: {id: this.config.id},
        query
      })
    },
    loadPage () {
      this.getRules(this.config.id, this.dataFilter)
      const query = {}
      if (this.dataFilter.page) query.page = this.dataFilter.page
      if (this.dataFilter.option_filter) query.type = this.dataFilter.option_filter
      this.$router.push({
        params: {id: this.config.id},
        query
      })
    },
    removeAccessRule () {
      if (this.actionData && this.actionData.id) {
        deleteAccessRuleFn(this.config.id, this.actionData.id, this.config.type).then(res => {
          this.getRules(this.config.id, this.dataFilter)
        }).catch(() => {
          this.vToasted('error', 'Can not remove this access rule. Please try again or contact administrator.')
        })
      }
    },
    goToPage (routeName = 'CreateRule', ruleId = '') {
      const query = {}
      if (this.dataFilter.page) query.page = this.dataFilter.page
      if (this.dataFilter.option_filter) query.type = this.dataFilter.option_filter
      if (this.config.type === sizes.CLIENT) {
        const params = {id: this.config.id}
        if (ruleId) params.ruleId = ruleId
        this.$router.push({name: `ps-${routeName}`, params, query})
      } else {
        const params = {orgId: this.config.id}
        if (ruleId) params.ruleId = ruleId
        this.$router.push({name: `ps-Org${routeName}`, params, query})
      }
    }
  },
  watch: {
    'config.id' (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.getRules(newVal, this.dataFilter)
        if (this.getUserId && newVal) {
          this.getUserData(newVal, this.getUserId)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './AccessRules.scss'
</style>
