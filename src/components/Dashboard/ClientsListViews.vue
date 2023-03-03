<template>
  <div v-if="org.clients && org.clients.length > 0">
    <b-row v-for="client in org.clients" :key="client.id" class="equal-height">
      <b-card class="full-width card-client-dashboard pb-0">
        <b-row>
          <b-col cols="10">
            <h4 :title="client.name" class="workspace-name">
              {{ client.name }}
            </h4>
          </b-col>
          <b-col cols="2" class="action-client">
            <b-button
              class="mr-1"
              variant="secondary"
              size="sm"
              @click="
                $router.push({
                  name: 'ps-ClientSettings',
                  params: { id: client.id }
                })
              "
              v-if="
                canOpenSetting(org.organization.role || {}, client.role || {})
              "
            >
              <i class="icons icon-settings"></i>
            </b-button>
            <div v-if="appProfile === 'mwrw'" class="btn-action">
              <b-button-group class="btn-block" v-if="client.modules">
                <!--Remove RW Module-->
                <!--<b-button
                  size="sm"
                  v-if="client.modules[1] && client.modules[1].module === 'ROG' ? client.modules[1].enabled : client.modules[0].enabled"
                  variant="primary"
                  @click="$router.push({name: 'RWDashboard', params: {client_id: client.id}})"
                >
                  <i class="icon-tag"></i> Rogue Watcher
                </b-button>-->
                <b-button
                  class="btn-module"
                  :style="getButtonStyles(client)"
                  size="sm"
                  v-if="
                    client.modules[0] && client.modules[0].module === 'MAP'
                      ? client.modules[0].enabled
                      : client.modules[1].enabled
                  "
                  @click="handleActionSwitchClient(appProfile, client)"
                  @mouseover="changeBgColor($event, client, -0.25)"
                  @mouseleave="changeBgColor($event, client, 0)"
                >
                  <i class="icon-calendar"></i> MAP Watcher
                </b-button>
              </b-button-group>
            </div>
            <div v-else-if="appProfile === 'matrix'" class="btn-action">
              <!-- open -> default is matrix module -->
              <b-button
                :style="getButtonStyles(client)"
                v-if="getFirstActivedModule(client.modules || [])"
                size="sm"
                class="btn-full btn-module"
                @click="handleActionSwitchClient(appProfile, client)"
                @mouseover="changeBgColor($event, client, -0.25)"
                @mouseleave="changeBgColor($event, client, 0)"
              >
                <i class="icon-power"></i> Open
              </b-button>
            </div>
            <div
              v-else-if="appProfile === 'precise_financial'"
              class="btn-action"
            >
              <!-- open -> default is precise_financial module -->
              <b-button
                :style="getButtonStyles(client)"
                v-if="getFirstActivedModule(client.modules || [])"
                size="sm"
                class="btn-full btn-module"
                @click="handleActionSwitchClient(appProfile, client)"
                @mouseover="changeBgColor($event, client, -0.25)"
                @mouseleave="changeBgColor($event, client, 0)"
              >
                <i class="icon-power"></i> Open
              </b-button>
            </div>
            <div v-else-if="appProfile === 'transit'" class="btn-action">
              <b-button
                :style="getButtonStyles(client)"
                v-if="getFirstActivedModule(client.modules || [])"
                size="sm"
                class="btn-full btn-module"
                @click="handleActionSwitchClient(appProfile, client)"
                @mouseover="changeBgColor($event, client, -0.25)"
                @mouseleave="changeBgColor($event, client, 0)"
              >
                <i class="icon-power"></i> Open
              </b-button>
            </div>
            <div v-else-if="appProfile === 'skuflex'" class="btn-action">
              <b-button
                :style="getButtonStyles(client)"
                v-if="getFirstActivedModule(client.modules || [])"
                size="sm"
                class="btn-full btn-module"
                @click="handleActionSwitchClient(appProfile, client)"
                @mouseover="changeBgColor($event, client, -0.25)"
                @mouseleave="changeBgColor($event, client, 0)"
              >
                <i class="icon-power"></i> Open
              </b-button>
            </div>
            <div v-else-if="appProfile === 'sa'" class="btn-action">
              <b-button
                :style="getButtonStyles(client)"
                v-if="getFirstActivedModule(client.modules || [])"
                size="sm"
                class="btn-full btn-module"
                @click="handleActionSwitchClient(appProfile, client)"
                @mouseover="changeBgColor($event, client, -0.25)"
                @mouseleave="changeBgColor($event, client, 0)"
              >
                <i class="icon-power"></i> Open
              </b-button>
            </div>
            <div v-else>
              <b-button
                :style="getButtonStyles(client)"
                v-if="getFirstActivedModule(client.modules || [])"
                size="sm"
                class="btn-full btn-module"
                @click="handleActionSwitchClient(appProfile, client)"
                @mouseover="changeBgColor($event, client, -0.25)"
                @mouseleave="changeBgColor($event, client, 0)"
              >
                <i class="icon-power"></i> Open
              </b-button>
            </div>
          </b-col>
        </b-row>
        <div v-if="appProfile === 'mwrw'">
          <p
            class="date"
            v-if="client.account_manager && isSystemInternalUsers"
          >
            AM: {{ client.account_manager }}
          </p>
          <p
            class="date"
            v-if="client.special_project_manager && isSystemInternalUsers"
          >
            SPA: {{ client.special_project_manager }}
          </p>
        </div>
        <div v-else>
          <p
            class="date"
            v-if="
              isSystemInternalUsers &&
                client.extra_information &&
                client.extra_information.current_owner
            "
          >
            Owner: {{ getOwnerName(client.extra_information) }}
          </p>
        </div>
      </b-card>
    </b-row>
  </div>
  <b-row v-else>
    <b-col>
      <p v-if="org.total > 0">Found no workspaces.</p>
      <p v-else>You do not work for any workspaces in this organization.</p>
    </b-col>
  </b-row>
</template>

<script>
import { clientsMixin } from '@/components/Dashboard/clientsMixin'

export default {
  mixins: [clientsMixin],
  props: ['org', 'isSystemInternalUsers']
}
</script>

<style lang="scss" scoped>
.equal-height {
  flex: 1 0 auto;
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  margin-left: 0;
  width: 100%;

  .full-width {
    width: 100%;
    padding-bottom: 5px;
  }
}

.action-client {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.workspace-name {
  margin-bottom: 0;
  line-height: 28px;
}
</style>
