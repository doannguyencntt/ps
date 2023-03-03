<template>
  <b-card>
    <div slot="header">
      <b-row align-v="center">
        <b-col class="col-6">
          <span>
            <strong>Activities</strong>
          </span>
        </b-col>
      </b-row>
    </div>
    <b-row class="justify-content-center">
      <b-col md="3" class="pl-5 mt-0 mb-4">
        <b-form-select v-model="params.action" :options="listAction" text-field="name" @change="searchChange()"></b-form-select>
      </b-col>
      <b-col md="4" class="mt-0 mb-4">
        <b-form-group class="mb-0">
          <b-input-group class="search cancel-action">
            <b-form-input v-model="params.key" @keypress.enter="searchChange()" placeholder="Search for user and data">
            </b-form-input>
            <i v-show="params.key" @click="params.key = '';searchChange()" class="icon-close cancel-icon"></i>
            <b-input-group-append>
              <b-button @click="searchChange()">
                <i class="icons icon-magnifier"></i>
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="table-responsive col-12">
        <b-table
          show-empty
          hover
          outlined
          striped
          responsive="sm"
          thead-class="thead-light"
          :fields="fields"
          :items="activitiesList.results"
          id="activity-table"
        >
          <template v-slot:empty>
            <div class="text-center py-2" v-if="activitiesLoading">
              <i class="fa fa-circle-o-notch fa-spin"></i>
              Loading...
            </div>
            <div class="align-middle d-flex justify-content-center align-items-center" v-else>There are no activities to show</div>
          </template>
          <template v-slot:cell(user)="row">
            <div class="d-flex">
              <img
                :src="row.item.user.avatar || placeholderURL"
                class="img img__circle"
                :alt="row.item.user.first_name"
                width="35"
                height="35"
              />
              <div>
                <div v-if="row.item.user.first_name && row.item.user.last_name">{{row.item.user.first_name}} {{row.item.user.last_name}}</div>
                <div>{{row.item.user.email}}</div>
              </div>
            </div>
          </template>
          <template v-slot:cell(data)="row">
            <div
              v-b-popover.hover.right.html="showData(row.item.data)"
            >
              {...}
            </div>
          </template>
          <template v-slot:cell(time)="row">
            <div>{{row.item.created | moment('from')}}</div>
          </template>
        </b-table>
        <nav class="d-flex justify-content-center">
          <b-pagination @click.native="goToPage" v-if="activitiesList.count && activitiesList.count > params.limit" :total-rows="activitiesList.count || 0" :per-page="params.limit" v-model="params.page" prev-text="Prev" next-text="Next" hide-goto-end-buttons />
        </nav>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import placeholderURL from '@/assets/img/profile-placeholder.png'

export default {
  name: 'OrgActivitie',
  data: () => {
    return {
      fields: [
        { key: 'user', label: 'User', class: 'vertical-content user-td' },
        { key: 'action_label', label: 'Action', class: 'vertical-content action-td' },
        { key: 'data', label: 'Data', class: 'vertical-content data-td' },
        { key: 'time', label: 'Time', class: 'vertical-content time-td' }
      ],
      params: {
        page: 1,
        limit: 10,
        id: '',
        key: '',
        action: null
      },
      listAction: [
        { value: null, name: 'All' },
        { value: 'SIGN_IN', name: 'Sign in' },
        { value: 'DOWNLOAD_MAP_REPORT', name: 'Download Map Report' },
        // Remove RW Module
        // { value: 'DOWNLOAD_ROG_REPORT', name: 'Download ROG Report' },
        { value: 'ACCESS_WORKSPACE', name: 'Access Workspace' }
      ],
      placeholderURL: placeholderURL
    }
  },
  computed: {
    ...mapGetters({
      activitiesList: `ps/activities/${TYPE.GET_ACTIVITIES_LIST}`,
      activitiesLoading: `ps/activities/${TYPE.GET_ACTIVITIES_LOADING}`
    })
  },
  methods: {
    ...mapActions({
      getActivitiesList: `ps/activities/${TYPE.GET_ACTIVITIES_LIST}`
    }),
    searchChange() {
      this.params.page = 1
      this.getActivitiesList(this.params)
    },
    goToPage () {
      this.getActivitiesList(this.params)
    },
    showData (data) {
      let content = '<div>{'
      if ((typeof data) === 'object') {
        for (let key in data) {
          content += `<div style="margin-left: 15px;">${key} : ${data[key]}</div>`
        }
      }
      content += '}</div>'
      return content
    }
  },
  created() {
    this.params.id = this.$route.params.orgId
    this.getActivitiesList(this.params)
  }
}
</script>

<style lang="scss" scoped>
  .table-responsive {
    overflow-x: visible;
  }
  ::v-deep #activity-table {
    .img.img__circle {
      border-radius: 50%;
      margin-right: 5px;
    }
    thead {
      th {
        &.action-td {
          width: 400px;
        }
        &.data-td {
          width: 70px;
        }
        &.time-td {
          width: 150px;
        }
      }
    }
  }
</style>
