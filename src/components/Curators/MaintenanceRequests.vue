<template>
  <v-card>
    <v-card-text v-if="maintenanceRequestsProcessed">
      <v-card-title
        id="text-curator-search-5"
        class="green white--text"
      >
        <b> OWNERSHIP REQUESTS </b>
        <v-spacer />
        <v-text-field
          v-model="searches"
          label="Search"
          color="white--text"
          single-line
          hide-details
        />
      </v-card-title>
      <v-card-text v-if="error.general">
        <v-alert type="error">
          Problem saving/updating record with id: {{ error.recordID }}
          {{ error.general }}
        </v-alert>
      </v-card-text>
      <v-data-table
        :loading="loading"
        :headers="headers"
        :items="maintenanceRequestsProcessed"
        :search="searches"
        class="elevation-1"
        :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50]}"
        sort-by=""
      >
        <template
          v-if="recordType"
          #item="props"
        >
          <tr>
            <td>
              {{ props.item.createdAt }}
            </td>
            <td>
              <v-avatar
                v-if="props.item.type"
                class="mr-2"
                :height="40"
              >
                <Icon
                  :item="props.item.type"
                  :height="40"
                  wrapper-class=""
                />
              </v-avatar>
              <a :href="'/' + props.item.id">
                {{ props.item.recordName }}
              </a>
            </td>
            <td>
              <a :href="'/users/' + props.item.userId">
                {{ props.item.userName }}
              </a>
            </td>
            <td>
              <v-edit-dialog
                :return-value.sync="props.item.processingNotes"
                large
                @save="saveProcessingNotes(props.item.id,props.item.processingNotes)"
              >
                {{ props.item.processingNotes }}
                <template #input>
                  <div class="testDialog">
                    <div class="mt-4 title">
                      Update Processing Notes
                    </div>
                    <v-textarea
                      v-model="props.item.processingNotes"
                      width="1200px"
                      label="Edit (not long words)"
                      filled
                    />
                  </div>
                </template>
              </v-edit-dialog>
            </td>
            <td>
              <v-icon
                color="blue"
                dark
                left
                @click.stop="assignMaintenanceOwner(props.item.recordName,props.item.id,props.item.userName,props.item.requestID)"
              >
                far fa-check-circle
              </v-icon>
              {{ props.item.actions }}
              <v-icon
                color="red"
                dark
                right
                @click="rejectMaintenanceOwner(props.item.recordName,props.item.id,props.item.userName,props.item.requestID)"
              >
                fas fa-ban
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
    <v-layout
      row
      justify-center
    >
      <v-dialog
        v-model="dialogs.confirmAssignment"
        max-width="700px"
        persistent
      >
        <v-card>
          <v-card-title
            class="headline"
          >
            Are you sure you want to
            <font style="color:blue; padding-left: 5px; padding-right: 5px;">
              ACCEPT
            </font>
            this ownership?
            <ul style="list-style-type:none;">
              <li>
                <font style="color:gray">
                  Record:
                </font>
                {{ dialogs.recordName }}
              </li>
              <li>
                <font style="color:gray">
                  User:
                </font>
                {{ dialogs.userName }}
              </li>
            </ul>
          </v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-btn
              :disabled="dialogs.disableDelButton === true"
              color="blue darken-1"
              text
              persistent
              @click="closeMaintenanceAssign()"
            >
              Cancel
            </v-btn>
            <v-btn
              :disabled="dialogs.disableDelButton === true"
              color="blue darken-1"
              text
              persistent
              @click="assignMaintenanceOwnConfirm('approved')"
            >
              OK
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-layout
      row
      justify-center
    >
      <v-dialog
        v-model="dialogs.rejectAssignment"
        max-width="700px"
        persistent
      >
        <v-card>
          <v-card-title
            class="headline"
          >
            Are you sure you want to
            <font
              style="color:red; padding-left: 5px; padding-right: 5px;"
            >
              REJECT
            </font>
            this ownership?
            <ul style="list-style-type:none;">
              <li>
                <font style="color:gray">
                  Record:
                </font>
                {{ dialogs.recordName }}
              </li>
              <li>
                <font style="color:gray">
                  User:
                </font>
                {{ dialogs.userName }}
              </li>
            </ul>
          </v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-btn
              :disabled="dialogs.disableDelButton === true"
              color="blue darken-1"
              text
              persistent
              @click="closeMaintenanceReject()"
            >
              Cancel
            </v-btn>
            <v-btn
              :disabled="dialogs.disableDelButton === true"
              color="blue darken-1"
              text
              persistent
              @click="assignMaintenanceOwnConfirm('rejected')"
            >
              OK
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-card>
</template>


<script>
    import { mapActions, mapState }  from "vuex"
    import RestClient from "@/lib/Client/RESTClient.js"
    import Icon from "@/components/Icon"


    const restClient = new RestClient();

    export default {
        name: "MaintenanceRequests",
        components: {
          Icon
        },
        props: {
            maintenanceRequests: {
                type: Array,
                default: null
            },
            approvalRequired: {
                type: Array,
                default: null
            },
            headers: {
                type: Array,
                default: null
            },
            recordType: {
                type: Object,
                default: null
            },
            loading: {
                type: Boolean,
                defaul: false
            }
        },
        data: () => {
            return {
              dialogs: {
                confirmAssignment: false,
                recordName: "",
                recordID: "",
                userName: "",
                requestId: "",
                rejectAssignment: false,
                disableDelButton: false
              },
              error: {
                recordID: null,
                general: null
              },
              searches: '',
              maintenanceRequestsProcessed: []
            }
        },
        computed: {
          ...mapState('users', ['user', "messages"]),
          ...mapState("record", ["recordUpdate"])
        },
        watch: {
          maintenanceRequests: function(){
            this.maintenanceRequestsProcessed = JSON.parse(JSON.stringify(this.maintenanceRequests));
          },
          'dialogs.confirmAssignment' (val) {
            val || this.closeMaintenanceAssign()
          },
          'dialogs.rejectAssignment' (val) {
            val || this.closeMaintenanceReject()
          }
        },
        mounted: function () {
            this.maintenanceRequestsProcessed = JSON.parse(JSON.stringify(this.maintenanceRequests));
        },
        methods: {
            ...mapActions("record", ["updateRecord"]),

            async saveProcessingNotes(idRecord,notesText){
              const _module = this;
              _module.error = {
                recordID: null,
                general: null
              };
              let preparedRecord = {
                processing_notes: "",
                skip_approval: true
              };
              preparedRecord.processing_notes = notesText;
              let data = {
                record: preparedRecord,
                id: idRecord,
                token: _module.user().credentials.token
              };
              await _module.updateRecord(data);
              if (_module.recordUpdate.error){
                _module.error.general = _module.recordUpdate.message;
                _module.error.recordID = idRecord;
              }
            },
            assignMaintenanceOwner(recordName, recordID, userNameID, requestID){
              const _module = this;
              _module.dialogs.disableDelButton = false;
              _module.dialogs.recordName = recordName;
              _module.dialogs.recordID = recordID;
              _module.dialogs.userName = userNameID;
              _module.dialogs.requestId = requestID;
              _module.dialogs.confirmAssignment = true;
            },
            closeMaintenanceAssign () {
              this.dialogs.disableDelButton = true;
              this.dialogs.confirmAssignment = false;
            },
            async assignMaintenanceOwnConfirm (newStatus) {
              const _module = this;
              _module.dialogs.disableDelButton = true;
              _module.error = {
                recordID: null,
                general: null
              };
              let data = await restClient.updateStatusMaintenanceRequest(_module.dialogs.requestId, newStatus, this.user().credentials.token);
              if (!data.error){
                const index = _module.maintenanceRequestsProcessed.findIndex((element) => element.requestID === _module.dialogs.requestId);
                _module.maintenanceRequestsProcessed.splice(index, 1);
                if (_module.approvalRequired.findIndex((element) => element.id === _module.dialogs.recordID) < 0){
                  if (_module.maintenanceRequestsProcessed.findIndex((element) => element.id === _module.dialogs.recordID) < 0){
                    await _module.saveProcessingNotes(_module.dialogs.recordID,null);
                  }
                }
              }else{
                _module.error.general = "error assigning "+newStatus;
                _module.error.recordID = _module.dialogs.recordID;
              }
              if (newStatus === "approved"){
                _module.dialogs.confirmAssignment = false;
              }else{
                _module.dialogs.rejectAssignment = false;
              }

            },
            rejectMaintenanceOwner(recordName, recordID, userNameID, requestID){
              const _module = this;
              _module.dialogs.disableDelButton = false;
              _module.dialogs.recordName = recordName;
              _module.dialogs.recordID = recordID;
              _module.dialogs.userName = userNameID;
              _module.dialogs.requestId = requestID;
              _module.dialogs.rejectAssignment = true;
            },
            closeMaintenanceReject () {
              this.dialogs.disableDelButton = true;
              this.dialogs.rejectAssignment = false;
            }

        }
    }

</script>

<style scoped>
  #text-curator-search-5 div.theme--light.v-input:not(.v-input--is-disabled) input{
    color:#fff;
  }

  .testDialog {
    width: 600px !important;
  }
</style>
