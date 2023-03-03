<template>
  <AppHeaderDropdown class="custom-app-dropdown" right no-caret>
    <template slot="header">
      <i class="icon-bell" />
      <b-badge variant="danger" v-if="newNotificationCount && newNotificationCount > 0">{{ newNotificationCount }}</b-badge>
    </template>
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center"><strong>You have {{newNotificationCount}} new notification<span v-if="newNotificationCount > 1">s</span></strong></b-dropdown-header>
      <div v-if="filteredNotification && filteredNotification.length > 0" class="notification-dropdown mt-2">
        <div v-for="(item, index) in filteredNotification" v-bind:key="index">
          <b-dropdown-item class="dropdown-content">
            <div @click.stop.prevent="">
              <div class="inline-block-dropdown" v-bind:class="{ 'font-weight-bold': !item.is_seen }">
                <div class="limit-width-message">
                  <i class="icon-info" />
                  <span :title="item.extra_message">{{item.extra_message}}</span>
                </div>
                <div class="pull-right">
                  <div v-if="!item.is_seen && item.type === 'INVITATION' && item.status === 'OPEN'" class="ml-2 d-inline custom-btn-notification" @click.stop.prevent="handleAcceptInvitation(item)">
                    <i class="icon-check"></i> Accept
                  </div>
                  <div v-if="!item.is_seen && item.type === 'INVITATION' && item.status === 'OPEN'" class="ml-2 d-inline custom-btn-notification decline-btn" @click.stop.prevent="handleDeclineInvitation(item)">
                    <i class="icon-close"></i> Decline
                  </div>
                  <div v-if="!item.is_seen && item.status !== 'OPEN'" class="ml-2 d-inline custom-btn-notification read-btn" @click.stop.prevent="handleReadInvitation(item)">
                    <i class="icon-eye"></i> Read
                  </div>
                </div>
              </div>
              <div class="">
                <p v-bind:class="{ 'font-weight-bold': !item.is_seen }" class="time">
                  {{item.created | moment('from')}}
                </p>
              </div>
            </div>
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
        </div>
        <div class="text-center" @click.stop.prevent="loadMoreNotifications()" v-if="this.limit < this.count && this.count !== 0">
          <div class="custom-btn-notification load-btn"><i class="icon-clock"></i> Load more ... <b-spinner small v-if="loading"></b-spinner></div>
        </div>
      </div>
      <div v-else class="mt-2">
        <b-dropdown-item class="dropdown-content">
            <div @click.stop.prevent="">
              <p class="text-center">And there is no message at all. Thank you.</p>
            </div>
          </b-dropdown-item>
      </div>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
import notificationsSvc from '@/services/notificationSvc'
import { declineOrgInvitationApi } from '@/services/userOrg'
import forEach from 'lodash/forEach'
import vToast from '@/shared/notification'
import apiUserClient from '@/services/userClient'
import { mapActions, mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
// import Vue from 'vue'

export default {
  name: 'NotificationDropdown',
  components: {
    AppHeaderDropdown
  },
  mixins: [vToast],
  data: () => {
    return {
      newNotificationCount: 0,
      notificationData: null,
      intervalEvent: null,
      currentPage: 1,
      limit: 10,
      loading: false,
      count: null,
      globalToastForNetworkError: 'errorNetwork'
    }
  },
  computed: {
    filteredNotification: function() {
      return this.notificationData || []
    },
    ...mapGetters({
      getGlobalToastInfo: `ps/globalToast/${TYPE.GET_GLOBAL_TOAST_INFO}`,
      getErrorNetworkToastInfo: `ps/globalToast/${TYPE.GET_ERROR_NETWORK_TOAST_INFO}`
    })
  },
  methods: {
    ...mapActions({
      dismissGlobalToastInfo: `ps/globalToast/${TYPE.DISMISS_GLOBAL_TOAST_INFO}`,
      resetErrorNetworkToastInfo: `ps/globalToast/${TYPE.RESET_ERROR_NETWORK_TOAST_INFO}`
    }),
    async handleGetNotifications() {
      try {
        let payload = { page: 1, limit: this.limit }
        let res = await notificationsSvc.getNotifications(payload)
        if (res) {
          this.notificationData = res.results
          this.count = res.count
          if (this.getGlobalToastInfo.includes(this.globalToastForNetworkError)) {
            await this.dismissGlobalToastInfo(this.globalToastForNetworkError)
            if (this.getErrorNetworkToastInfo) {
              await this.getErrorNetworkToastInfo.goAway()
            }
            await this.resetErrorNetworkToastInfo()
          }
        }
      } catch (err) {
        this.vToasted('error', 'Get notification list has problem, please try again.')
      }
    },
    async handleGetNotificationsCount() {
      try {
        let res = await notificationsSvc.getNotificationCount()
        if (res) {
          this.newNotificationCount = res.count
          if (this.getGlobalToastInfo.includes(this.globalToastForNetworkError)) {
            this.dismissGlobalToastInfo(this.globalToastForNetworkError)
            await this.dismissGlobalToastInfo(this.globalToastForNetworkError)
            if (this.getErrorNetworkToastInfo) {
              await this.getErrorNetworkToastInfo.goAway()
            }
            await this.resetErrorNetworkToastInfo()
          }
        }
      } catch (err) {
        this.vToasted('error', 'Get notification count has problem, please try again.')
      }
    },
    async verifyClientToken (token) {
      await apiUserClient.confirmTokenClientInvitation({token}).then((response) => {
        if (response) {
          this.vToasted('success', 'Your account has been activated for the new workspace.')
          // reload data
          this.$bus.$emit('ps_reload_data')
        } else {
          this.vToasted('danger', 'Oops! There may be a problem with the verification. Please try reloading this page. Thank you.')
        }
      }).catch(() => {
        this.vToasted('danger', 'Oops! There may be a problem with the verification. Please try reloading this page. Thank you.')
      })
    },
    async verifyOrgToken (token) {
      await apiUserClient.confirmTokenOrgInvitation({token}).then((response) => {
        if (response) {
          this.vToasted('success', 'Your account has been activated for the new organization.')
          // reload data
          this.$bus.$emit('ps_reload_data')
        } else {
          this.vToasted('danger', 'Oops! There may be a problem with the verification. Please try reloading this page. Thank you.')
        }
      }).catch(() => {
        this.vToasted('danger', 'Oops! There may be a problem with the verification. Please try reloading this page. Thank you.')
      })
    },
    async handleAcceptInvitation(item) {
      // await window.open(
      //   window.location.protocol + '//' + window.location.host + `/#/ps/invitation?token=${item.meta.invitation_token}&activeFromClient=true&type=${item.meta.type}`,
      //   '_blank'
      // )
      if (item.meta && item.meta.invitation_token) {
        if (item.meta.type && item.meta.type === 'client') {
          await this.verifyClientToken(item.meta.invitation_token)
        } else if (item.meta.type && item.meta.type === 'organization') {
          await this.verifyOrgToken(item.meta.invitation_token)
        }
      }
      this.newNotificationCount--
      this.handleSeeNotification(item)
    },
    async handleDeclineInvitation(item) {
      declineOrgInvitationApi(item.id, item.meta.type).then(() => {
        this.newNotificationCount--
        this.handleSeeNotification(item)
      })
    },
    async handleReadInvitation(item) {
      this.newNotificationCount--
      this.handleSeeNotification(item)
    },
    async handleSeeNotification(item) {
      await notificationsSvc.seeNotification(item.id)
      forEach(this.notificationData, (e) => {
        if (e.id === item.id) {
          e.is_seen = true
        }
      })
    },
    loadNotificationEvent() {
      this.handleGetNotifications()
      this.handleGetNotificationsCount()
    },
    async loadMoreNotifications() {
      this.loading = true
      this.limit = this.limit + 10
      await this.handleGetNotifications()
      this.loading = false
    }
  },
  created() {
    this.loadNotificationEvent()
    this.intervalEvent = setInterval(() => this.loadNotificationEvent(), 60000)
  },
  destroyed() {
    if (this.intervalEvent) {
      clearInterval(this.intervalEvent)
    }
  }
}
</script>

<style lang="scss">
  .notification-dropdown {
    max-height: 220px;
    width: 600px;
    overflow: scroll;
    overflow-x: hidden;
    @media (max-width: 865px) {
      max-width: 430px;
    }
    @media (max-width: 500px) {
      max-width: 300px;
    }
  }
  .notification-dropdown i {
    margin: 0 5px 0 -3px;
  }
  .notification-dropdown .btn i {
    color: white;
    margin: 0px 0 3px -6px;
  }
  .notification-dropdown p {
    margin: 0px;
  }
  .notification-dropdown p.time{
    font-size: 12px;
    position: relative;
    left: 25px;
  }
  .custom-btn-notification{
    padding: 0.25rem 0.5rem;
    font-size: 0.76563rem;
    line-height: 1.5;
    border-radius: 0.2rem;
    color: #fff;
    background-color: #4dbd74;
    border-color: #4dbd74;
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    border: 1px solid transparent;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    &:hover{
      background-color: #218838;
      border-color: #1e7e34;
    }
    i {
      color: white;
      margin: 0px 0 3px -6px;
    }
  }
  .custom-btn-notification.decline-btn {
    background-color: #f86c6b;
    border-color: #f86c6b;
    &:hover{
      background-color: #f64846;
      border-color: #f63c3a;
    }
  }
  .custom-btn-notification.read-btn {
    background-color: #20a8d8;
    border-color: #20a8d8;
    &:hover{
      background-color: #0069d9;
      border-color: #0062cc;
    }
  }
  .custom-btn-notification.load-btn {
    background-color: #6c757d;
    border-color: #6c757d;
    width: 98%;
    margin: 5px;
    cursor: pointer;
    &:hover{
      background-color: #5a6268;
      border-color: #545b62;
    }
  }
  .dropdown-content a{
    // cursor: default !important;
    padding: 0 0 0 0;
  }
  .dropdown-content a > div {
    padding: 0 15px 0 15px;
  }
  .inline-block-dropdown {
    display: flex;
    justify-content: space-between;
  }
  .dropdown-content .dropdown-item:active {
    color: #181b1e;
    text-decoration: none;
    background-color: #f0f3f5;
  }
  .notification-dropdown li:last-child hr {
    margin: 10px 0 0 0;
  }
  .limit-width-message{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

<style lang="scss" scoped>
.custom-app-dropdown {
  min-width: 25px;
  margin: 0 10px;
}
</style>
