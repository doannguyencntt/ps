import apiUser from '@/services/user'
import { sizes } from '@/shared/utils'
import { getUserInfoInOrgApi } from '@/services/userOrg'
import get from 'lodash/get'

export default {
  props: {
    props: {
      config: {
        type: Object,
        default: () => {}
      }
    }
  },
  data () {
    return {
      userData: null,
      userRole: null
    }
  },
  computed: {
    fullName: function() {
      return this.userData ? this.userData.first_name && this.userData.last_name ? `${this.userData.first_name} ${this.userData.last_name}` : this.userData.email ? `${this.userData.email}` : `User` : `User`
    }
  },
  methods: {
    async getUserData (sizeId, userId) {
      if (!sizeId || !userId) {
        this.userData = { user: {}, role: {} }
        return
      }
      try {
        let respone = {}
        if (this.config.type === sizes.CLIENT) {
          respone = await apiUser.getUserInformation(sizeId, userId)
        } else {
          respone = await getUserInfoInOrgApi(sizeId, userId)
        }
        this.userData = respone.user || {}
        this.userRole = get(respone, 'role.key', '')
      } catch {
        this.userData = { user: {}, role: {} }
      }
    }
  }
}
