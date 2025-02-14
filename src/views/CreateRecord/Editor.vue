<template>
  <v-container
    id="recordEditor"
    fluid
  >
    <v-alert
      dense
      fluid
      type="info"
      class="mb-0 flex-grow-1"
    >
      <span class="doclink">For more information on editing FAIRsharing records, please see our
        <a
          href="https://fairsharing.gitbook.io/fairsharing/record-sections-and-fields/how-to-update-a-record"
          target="_blank"
        >
          user documentation</a>.
      </span>
    </v-alert>
    <!-- TODO: Loop through the buttons -->
    <!-- popup to confirm exit from editing -->
    <v-row>
      <v-col
        v-for="(panelData) in confirmPanels"
        :key="panelData.name"
      >
        <v-dialog
          v-model="panelData.show"
          max-width="600px"
        >
          <v-card>
            <v-card-title class="headline">
              {{ panelData.name }}
            </v-card-title>
            <v-card-text>{{ panelData.description }}</v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="green darken-1"
                text
                @click="panelData.method()"
              >
                Yes.
              </v-btn>
              <v-btn
                color="green darken-1"
                text
                @click="panelData.show = false"
              >
                No, keep editing.
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>

    <v-row v-if="hasLoaded">
      <v-col v-if="error">
        <Unauthorized />
      </v-col>

      <v-col v-else>
        <v-toolbar
          flat
          color="primary"
          dark
        >
          <v-toolbar-title>
            Edit Record - {{ sections.generalInformation.initialData.metadata.name }} ({{ recordId }})
          </v-toolbar-title>
          <v-spacer />

          <v-btn
            v-for="(panelData) in confirmPanels"
            :id="panelData.name + '_button'"
            :key="panelData.name"
            class="default"
            @click="panelData.show = true"
          >
            {{ panelData.name }}
          </v-btn>
          <router-link
            :to="'/' + $route.params.id"
            class="ml-2"
          >
            <v-btn class="default">
              Exit editing
            </v-btn>
          </router-link>
        </v-toolbar>
        <v-tabs
          v-model="selectedTab"
          dark
          slider-color="primary"
          slider-size="5"
        >
          <v-tab
            v-for="tab in tabs"
            :key="'tab_' + tab.name"
            :disabled="isDisabled(tab.name)"
          >
            <div v-if="!isDisabled(tab.name)">
              <div>{{ tab.name }}</div>
              <div
                v-if="tab.target && getChanges[tab.target] > 0"
                class="orange--text ml-2 font-weight-bold"
              >
                ({{ getChanges[tab.target] }})
              </div>
            </div>
          </v-tab>
          <v-tabs-items v-model="selectedTab">
            <v-tab-item
              v-for="(tab, tabIndex) in tabs"
              :key="tab+'_'+tabIndex"
              class="px-10 py-3"
            >
              <component
                :is="tab.component"
                v-if="!isDisabled(tab.name)"
              />
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapActions, mapState, mapGetters, mapMutations } from "vuex"
  import EditGeneralInfo from "@/components/Editor/GeneralInformation/GeneralInformation.vue";
  import EditRelationships from "@/components/Editor/EditRelationships";
  import EditDataAccess from "@/components/Editor/DataAccess/EditDataAccess";
  import EditOrganisations from "@/components/Editor/Organisations/Organisations";
  import EditPublications from "@/components/Editor/EditPublications";
  import EditAdditionalInfo from "@/components/Editor/AdditionalInformation/EditAdditionalInfo";
  import Unauthorized from "@/views/Errors/403"
  import RESTClient from "@/lib/Client/RESTClient.js"

  const client = new RESTClient();

  export default {
    name: "Editor",
    components: {
      EditPublications,
      EditOrganisations,
      EditDataAccess,
      EditRelationships,
      EditGeneralInfo,
      EditAdditionalInfo,
      Unauthorized
    },
    beforeRouteLeave(to, from, next){
      let changes = this.getAllChanges;
      if (changes === 0) {
        next();
      }
      else {
        const answer = window.confirm(`Are you sure you want to leave this page? You have ${changes} unsaved modifications.`);
        if (answer) next();
      }
    },
    data(){
      let _module = this;
      return {
        selectedTab:null,
        error: false,
        hasLoaded: false,
        dataChanged: false,
        confirmPanels: [
          {
            name: "Reload data",
            description: "This will reload your record from the database, discarding any unsaved changes.\n" +
                    "Are you sure you'd like to do this?",
            method: function() {
              this.show = false;
              return _module.confirmReloadData()
            },
            show: false
          }
        ],
        tabs: [
          {
            name: "General Information",
            target: "generalInformation",
            icon: "fa-info",
            component:"EditGeneralInfo"
          },
          {
            name: "Licences & Support Links",
            target: "dataAccess",
            component:"EditDataAccess"
          },
          {
            name: "Publications",
            target: "publications",
            icon: "fa-info",
            component:"EditPublications"
          },
          {
            name: "Organisations & Grants",
            target: "organisations",
            component:"EditOrganisations"
          },
          {
            name: "Relations to other records",
            target: "relations",
            component:"EditRelationships"
          },
          {
            name: "Additional Information",
            target: "additionalInformation",
            icon: "fa-info",
            component:"EditAdditionalInfo"
          }
        ]
      }
    },
    computed: {
      ...mapState('record', ['currentID', 'sections', 'currentRecord']),
      ...mapGetters('record', ['getChanges', 'getAllChanges', 'getRecordType']),
      ...mapState('editor', ['allowedFields']),
      ...mapState('users', ['user']),
      userToken(){
        const _module = this;
        return (_module.user().credentials) ? _module.user().credentials.token : null ;
      },
      recordId() {
        let _module = this;
        let id;
        try {
          id = _module.currentRecord['fairsharingRecord'].id;
        }
        catch {
          id = _module.$route.params.id;
        }
        return id;
      }
    },
    watch: {
      async userToken(){
        await this.getData();
      }
    },
    async mounted() {
      const _module = this;
      _module.$nextTick(async () => {
        await this.getData();
        _module.$store.commit("editor/clearPossibleDuplicates");
        _module.$store.commit("record/setEditingRecord");
        // Fix URL if it's a name not an ID.
        let id = _module.$route.params.id;
        if (isNaN(parseInt(id))) {
          id = _module.currentRecord['fairsharingRecord'].id;
          await _module.$router.push({path: '/' + id + '/edit'});
        }
      })
    },
    beforeDestroy() {
      this.cleanRecordStore();
      this.cleanEditorStore();
    },
    methods: {
      ...mapActions("record", ["fetchRecord"]),
      ...mapMutations("editor", ["cleanEditorStore"]),
      ...mapActions("editor", ["getAllowedFields"]),
      ...mapMutations("record", ["cleanRecordStore"]),
      async getData(){
        const _module = this;
        _module.hasLoaded = false;
        _module.error = false;
        let userToken = _module.userToken;
        if (userToken) {
          let id = _module.$route.params.id;
          if (id.includes('FAIRsharing.')) id = "10.25504/" + id;
          await _module.fetchRecord({id: id, token: userToken});
          let canEdit = await client.canEdit(_module.currentID, userToken);
          if (canEdit.error) _module.error = true;
          await this.getAllowedFields({
            type: this.getRecordType,
            token: userToken
          });
        }
        _module.hasLoaded = true;
      },
      async confirmReloadData() {
        const _module = this;
        let recordID = _module.currentID;
        await _module.fetchRecord({id: recordID});
      },
      isDisabled(tabName){
        if (tabName === 'Additional Information'){
          return !(this.allowedFields && Object.keys(this.allowedFields).includes('properties'));
        }
        return false
      }
    },
  }
</script>
<style scoped>
.tabSquare {
  width: 140px;
  height: 140px !important;
  white-space: initial !important;
}

#recordEditor .expand-transition-enter-active,
#recordEditor .expand-transition-leave-active,
#recordEditor .delayed-transition .slide-x-transition-enter-active,
#recordEditor .delayed-transition .slide-x-transition-leave-active {
  transition-duration: 0.7s !important;
}

#recordEditor .delayed-transition .scroll-x-transition-enter-active,
#recordEditor .delayed-transition .scroll-x-transition-leave-active {
  transition-duration: 1s !important;
}

#recordEditor .delayed-transition .scroll-x-transition-enter-active {
  transition-delay: 0.1s !important;
}

#recordEditor .delayed-transition .scroll-x-transition-leave-active {
  transition-delay: 0.6s !important;
}

.short {
  max-width: 550px;
}

.short span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doclink a {
  color: #0f5e66;
  border-bottom: #0f5e66 0.125em solid;
}

</style>
