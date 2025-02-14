<template>
  <div id="editDataAccess">
    <v-card>
      <v-card-title class="grey lighten-4 blue--text">
        Edit Data Access
      </v-card-title>
      <Alerts target="dataAccess" />
      <v-card-text>
        <edit-licences />
        <v-divider />
        <edit-support-links />
      </v-card-text>
      <v-card-actions>
        <v-btn
          class="primary"
          :loading="saving"
          @click="saveRecord(false)"
        >
          Save and continue
        </v-btn>
        <v-btn
          :loading="saving"
          class="primary"
          @click="saveRecord(true)"
        >
          Save and exit
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-fade-transition>
      <v-overlay
        v-if="!initialized"
        :absolute="false"
        opacity="0.8"
      >
        <loaders />
      </v-overlay>
    </v-fade-transition>
  </div>
</template>

<script>
    import { mapActions, mapState, mapGetters } from "vuex"
    import { isEqual } from "lodash"
    import EditLicences from "./EditLicenceLinks";
    import EditSupportLinks from "./EditSupportLinks"
    import Loaders from "../../Navigation/Loaders";
    import Alerts from "../Alerts";

    export default {
        name: "EditDataAccess",
        components: {
          Alerts,
          Loaders,
          EditLicences,
          EditSupportLinks
        },
        data(){
          return {
            initialized: false,
            saving: false
          }
        },
        computed: {
          ...mapState('record', ['sections']),
          ...mapState("users", ["user"]),
          dataAccess(){
            return this.sections['dataAccess'].data
          }
        },
        watch: {
          dataAccess: {
            deep: true,
            handler(val) {
              let changes = 0;
              let initialLicences = this.sections['dataAccess'].initialData.licences,
                  initialSupportLinks = this.sections['dataAccess'].initialData['support_links'],
                  licences = val.licences,
                  exhaustive = this.sections['dataAccess'].initialData.exhaustiveLicences,
                  supportLinks = val['support_links'];
              if (!isEqual(initialLicences, licences)){
                changes += 1;
              }
              if (!isEqual(initialSupportLinks, supportLinks)){
                changes += 1;
              }
              if (exhaustive !== this.dataAccess.exhaustiveLicences) {
                changes += 1;
              }
              this.$store.commit("record/setChanges", {
                section: "dataAccess",
                value: changes
              });
            }
          }
        },
        mounted() {
          this.$nextTick(async function () {
            await this.getLicences();
            this.initialized = true;
          });
        },
        methods: {
          ...mapActions('editor', ['getLicences']),
          ...mapActions('record', ['updateDataAccess']),
          ...mapGetters("record", ["getSection"]),
          async saveRecord(redirect){
            this.saving = true;
            if (!redirect) this.$scrollTo("#mainHeader");
            await this.updateDataAccess({
              id: this.$route.params.id,
              token: this.user().credentials.token
            });
            this.saving = false;
            if (redirect && !this.getSection("dataAccess").error){
              await this.$router.push({path: '/' + this.$route.params.id})
            }
          }
        }
    }
</script>

<style>

  #editDataAccess .borderBlue, #editLicences .borderBlue:before {
    border: 1px solid #2A9AF4 !important;
    background-color: white !important;
    border-color: #2A9AF4 !important;
  }

  #editDataAccess .v-chip.white {
    border-color: #2A9AF4 !important;
  }
  #editDataAccess .borderBlue * {
    color: #2A9AF4 !important;
  }

</style>
