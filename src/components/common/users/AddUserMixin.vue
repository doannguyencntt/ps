<script>
import apiUser from '@/services/user'

export default {
  methods: {
    setEmail (index) {
      this.$v.invitedMembers.$each[index].email.$touch()
      if (this.invitedMembers[index].password === 'Not allowed') {
        this.invitedMembers[index].password = this.generateRandomPassword()
      }
      if (this.$v.invitedMembers.$each[index].email.email && this.$v.invitedMembers.$each[index].email.required) {
        this.setPassword(index)
      }
    },
    async setPassword(index) {
      const checkNewEmailUser = await apiUser.checkNewEmailUser(this.invitedMembers[index].email)
      if (!checkNewEmailUser) {
        this.invitedMembers[index].password = 'Not allowed'
      }
    }
  }
}
</script>
