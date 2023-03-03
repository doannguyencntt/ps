
<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col md="12" lg="12">
        <b-nav>
          <b-nav-item :to="{ name: 'ps-ClientDetail'}" :class="'btn'" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-info"></i> Information</b-nav-item>
          <b-nav-item :to="{ name: 'ps-UserList'}" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-people"></i> Users</b-nav-item>
          <b-nav-item :to="{ name: 'ps-ClientModule'}" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-grid"></i> Modules</b-nav-item>
          <b-nav-item :to="{ name: 'ps-AccessRules'}" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-shield"></i> Access Rules</b-nav-item>
          <b-nav-item :to="{ name: 'ps-CustomRoles'}" class="btn" active-class="btn btn-outline-dark btn-pill disabled text-dark"><i class="icon icon-lock"></i> Custom Roles</b-nav-item>
        </b-nav>
        <router-view class="mt-1"></router-view>
      </b-col>
    </b-row>
    <!--Profile-->
  </div>
</template>

<script>
export default {
  name: 'ps-ClientSettings',
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
@import 'ClientDetail.scss';
</style>
