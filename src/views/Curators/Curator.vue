<template>
  <v-container
    id="curatorPage"
    fluid
    class="standard"
  >
    <v-row v-if="user().role==='super_curator' || user().role==='developer' ">
      <v-col cols12>
        <v-card v-if="!messages()['getUser'].error">
          <v-list>
            <v-list-item class="blue">
              <v-list-item-content class="pa-0">
                <v-list-item-title
                  v-if="user().credentials"
                  class="headline text-left white--text"
                >
                  Welcome, curator {{ user().credentials.username }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
        <!-- Approval -->
        <RecordsAwaitingApproval
          :loading="loading"
          :headers="headers.approvalRequired"
          :maintenance-requests="maintenanceRequests"
          :record-type="recordType"
          :approval-required="approvalRequired"
          :curator-list="curatorList"
        />
        <!-- Maintenance Requests -->
        <MaintenanceRequest
          :loading="loading"
          :headers="headers.maintenanceRequests"
          :maintenance-requests="maintenanceRequests"
          :record-type="recordType"
          :approval-required="approvalRequired"
        />
        <!-- Hidden Records -->
        <v-card>
          <v-card-text v-if="hiddenRecords">
            <v-card-title
              id="text-curator-search-2"
              class="green white--text"
            >
              <b> HIDDEN RECORDS </b>
              <v-spacer />
              <v-text-field
                v-model="searches.hiddenRecords"
                label="Search"
                color="white--text"
                single-line
                hide-details
              />
            </v-card-title>
            <v-data-table
              :loading="loading"
              :headers="headers.hiddenRecords"
              :items="hiddenRecords"
              :search="searches.hiddenRecords"
              class="elevation-1"
              :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50]}"
            >
              <template
                v-if="recordType"
                #item="props"
              >
                <tr>
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
                      {{ props.item.recordNameID }}
                    </a>
                  </td>
                  <td>
                    {{ props.item.createdAt }}
                  </td>
                  <td>
                    {{ props.item.curator }}
                  </td>
                  <td>
                    <div v-if="props.item.creator === 'unknown'">
                      {{ props.item.creator }}
                    </div>
                    <div v-else>
                      <a :href="'/users/' + props.item.idCreator">
                        {{ props.item.creator }}
                      </a>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
        <!-- Recently created by curators -->
        <v-card>
          <v-card-text v-if="recordsCreatedCuratorsLastWeek">
            <v-card-title
              id="text-curator-search-3"
              class="green white--text"
            >
              <b> RECORDS CREATED BY CURATORS IN THE PAST WEEK </b>
              <v-spacer />
              <v-text-field
                v-model="searches.recentCuratorCreations"
                label="Search"
                color="white--text"
                single-line
                hide-details
              />
            </v-card-title>
            <v-data-table
              :loading="loading"
              :headers="headers.recordsCreatedCuratorsLastWeek"
              :items="recordsCreatedCuratorsLastWeek"
              :search="searches.recentCuratorCreations"
              class="elevation-1"
              :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50]}"
            >
              <template
                v-if="recordType"
                #item="props"
              >
                <tr>
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
                      {{ props.item.recordNameID }}
                    </a>
                  </td>
                  <td>
                    {{ props.item.createdAt }}
                  </td>
                  <td>
                    <div v-if="props.item.creator === 'unknown'">
                      {{ props.item.creator }}
                    </div>
                    <div v-else>
                      <a :href="'/users/' + props.item.idCreator">
                        {{ props.item.creator }}
                      </a>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
        <!-- Records without DOIs -->
        <v-card>
          <v-card-text>
            <v-card-title
              id="text-curator-search-1"
              class="green white--text"
            >
              RECORDS WITHOUT DOIS
              <v-btn
                v-if="downloadContent"
                class="info ml-5"
              >
                <a
                  :href="downloadContent"
                  download="recordWithoutDOIs.txt"
                >
                  <v-icon
                    color="white"
                    class="mr-1"
                  >
                    fa fa-download
                  </v-icon>
                  <span class="white--text">Obtain file</span>
                </a>
              </v-btn>
            </v-card-title>
          </v-card-text>
        </v-card>
        <!-- Records needing review -->
        <v-card>
          <v-card-text>
            <v-card-title
              id="download-review-needed"
              class="green white--text"
            >
              RECORDS NEEDING REVIEW
              <v-btn
                v-if="downloadReviewContent"
                class="info ml-5"
              >
                <a
                  :href="downloadReviewContent"
                  download="recordsNeedingReview.txt"
                >
                  <v-icon
                    color="white"
                    class="mr-1"
                  >
                    fa fa-download
                  </v-icon>
                  <span class="white--text">Obtain file</span>
                </a>
              </v-btn>
            </v-card-title>
          </v-card-text>
        </v-card>
        <!-- System messages -->
        <v-card
          v-if="user().role === 'super_curator' || user().role === 'developer'"
        >
          <v-card-text v-if="systemMessages">
            <v-card-title
              id="system-messages"
              class="green white--text"
            >
              SYSTEM MESSAGES
              <v-btn
                class="info ml-5"
                @click.stop="showAddMessage()"
              >
                <v-icon
                  color="white"
                  class="mr-1"
                >
                  fa fa-plus
                </v-icon>
                <span class="white--text">Add message</span>
              </v-btn>
              <v-spacer />
            </v-card-title>
            <v-data-table
              :loading="loading"
              :headers="headers.systemMessages"
              :items="systemMessages"
              class="elevation-1"
              :footer-props="{'items-per-page-options': [5, 10, 20, 25, 30]}"
            >
              <template
                v-if="systemMessages"
                #item="props"
              >
                <tr>
                  <td>
                    {{ props.item.id }}
                  </td>
                  <td>
                    <v-edit-dialog
                      :return-value.sync="props.item.message"
                      large
                      @save="saveEditedMessage(props.item.id,props.item.message)"
                    >
                      {{ props.item.message }}
                      <template #input>
                        <div class="dialogMessageEdit">
                          <div class="mt-4 title">
                            Update Message
                          </div>
                          <v-textarea
                            v-model="props.item.message"
                            width="1200px"
                            label="Edit away!"
                            filled
                          />
                        </div>
                      </template>
                    </v-edit-dialog>
                  </td>
                  <td>
                    {{ props.item.created_at }}
                  </td>
                  <td>
                    {{ props.item.updated_at }}
                  </td>
                  <td>
                    <v-icon
                      color="red"
                      dark
                      right
                      small
                      @click="deleteMessage(props.item.id)"
                    >
                      fas fa-trash
                    </v-icon>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
        <!-- Curator Summary Information -->
        <v-card>
          <v-card-text>
            <v-card-title
              id="download-curator-summary"
              class="green white--text"
            >
              CURATOR SUMMARY STATISTICS
              <v-btn
                v-if="downloadCuratorContent"
                class="info ml-5"
              >
                <a
                  :href="downloadCuratorContent"
                  download="curatorSummaryStatistics.txt"
                >
                  <v-icon
                    color="white"
                    class="mr-1"
                  >
                    fa fa-download
                  </v-icon>
                  <span class="white--text">Obtain file</span>
                </a>
              </v-btn>
            </v-card-title>
          </v-card-text>
        </v-card>

        <!-- Button to obtain records created by month -->
        <v-card>
          <v-card-text>
            <v-card-title
              id="download-curator-summary"
              class="green white--text"
            >
              RECORDS CREATED BY MONTH
              <v-btn
                v-if="downloadRecordsByMonth"
                class="info ml-5"
              >
                <a
                  :href="downloadRecordsByMonth"
                  download="recordsCreatedByMonth.txt"
                >
                  <v-icon
                    color="white"
                    class="mr-1"
                  >
                    fa fa-download
                  </v-icon>
                  <span class="white--text">Obtain file</span>
                </a>
              </v-btn>
            </v-card-title>
          </v-card-text>
        </v-card>
        <!-- Button to obtain record edits by month -->
        <v-card>
          <v-card-text>
            <v-card-title
              id="download-curator-summary"
              class="green white--text"
            >
              RECORD EDITS BY MONTH
              <v-btn
                v-if="downloadEditsByMonth"
                class="info ml-5"
              >
                <a
                  :href="downloadEditsByMonth"
                  download="editsPerformedByMonth.txt"
                >
                  <v-icon
                    color="white"
                    class="mr-1"
                  >
                    fa fa-download
                  </v-icon>
                  <span class="white--text">Obtain file</span>
                </a>
              </v-btn>
            </v-card-title>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- this shouldn't appear as an unauthorised user shouldn't be here -->
    <v-row v-else>
      <v-col cols12>
        <Unauthorized />
      </v-col>
    </v-row>
    <!-- dialogs -->
    <v-layout
      row
      justify-center
    >
      <v-dialog
        v-model="dialogs.addMessage"
        max-width="700px"
      >
        <v-card>
          <v-card-title
            class="headline"
          >
            Add new message
          </v-card-title>
          <v-card-text>
            <v-textarea
              v-model="dialogs.newMessage"
              name="new-message-field"
              label="New message"
              placeholder="Type a message here..."
              regular
              clearable
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              text
              @click="closeAddMessageMenu()"
            >
              Cancel
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              :disabled="!dialogs.newMessage"
              @click="addMessage()"
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
        v-model="dialogs.deleteMessage"
        max-width="700px"
      >
        <v-card>
          <v-card-title
            class="headline"
          >
            Are you sure you want to
            <font
              style="color:red; padding-left: 5px; padding-right: 5px;"
            >
              DELETE
            </font>
            this message?
            <ul style="list-style-type:none;">
              <li>
                ID: {{ dialogs.messageId }}
              </li>
            </ul>
          </v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              text
              @click="closeDeleteMessageMenu()"
            >
              Cancel
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="confirmDeleteMessage()"
            >
              OK
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
    import GraphClient from "@/lib/GraphClient/GraphClient.js"
    import getCurationRecords from "@/lib/GraphClient/queries/curators/getSummary.json"
    import { mapActions, mapState } from "vuex"
    import Unauthorized from "@/views/Errors/403.vue"
    import headersTables from "@/data/headersCuratorDashboard.json"
    import MaintenanceRequest from "@/components/Curators/MaintenanceRequests.vue"
    import RecordsAwaitingApproval from "@/components/Curators/RecordsAwaitingApproval.vue"
    import RestClient from "@/lib/Client/RESTClient.js"
    import Icon from "@/components/Icon"
    import store from "@/store";


    const client = new GraphClient();
    const restClient = new RestClient();

    function compareRecordDesc(a, b) {
      if (a.createdAt > b.createdAt) {
        return -1;
      }else{
        return 1;
      }
    }

    function compareRecordDescUpdate(a, b) {
      if (a.updatedAt > b.updatedAt) {
        return -1;
      }else{
        return 1;
      }
    }


    function formatDate(d){
      let date = new Date(d);
      return date.toLocaleString('default', { month: 'short' })+' '+date.getUTCDate()+ ', '+date.getUTCFullYear();
    }

    /**
     * @vue-data {Object} hideFields - an array of field to NOT display
     * */

    export default {
      name: "Curator",
      components: {
        Unauthorized,
        RecordsAwaitingApproval,
        MaintenanceRequest,
        Icon
      },
      data: () => {
        return {
          dialogs: {
            id: null,
            message: null,
            addMessage: false,
            deleteMessage: false,
            newMessage: null,
            messageId: null
          },
          allDataCuration: null,
          approvalRequired: [],
          maintenanceRequests: [],
          recordsCreatedCuratorsLastWeek: [],
          recordsInCuration: [],
          hiddenRecords: [],
          curatorList: [],
          systemMessages: [],
          recordType: null,
          headers: headersTables,
          searches: {
            recentCuratorCreations: "",
            recordsInCuration: "",
            hiddenRecords: ""
          },
          loading: false,
          downloadContent: null,
          downloadReviewContent: null,
          downloadCuratorContent: null,
          downloadRecordsByMonth: null,
          downloadEditsByMonth: null,
          error: {
            general: null
          }
        }
      },
      computed: {
        ...mapState('users', ['user', "messages"]),
        ...mapState("record", ["recordUpdate"])
      },
      created() {
        this.$nextTick(function () {
          this.recordType = this.$vuetify.icons.values;
        });
      },
      async mounted() {
        this.$nextTick(async function () {
          this.loading = true;
          await this.getUser();
          if (this.messages()["getUser"].error) {
            this.setError({field: "login", message: "You've been logged out automatically"});
            this.$router.push({path: "/accounts/login"})
          }
          client.setHeader(this.user().credentials.token);
          let data = await client.executeQuery(getCurationRecords);
          this.allDataCuration = data.curationSummary;
          client.initalizeHeader();
          this.prepareData();
          await this.obtainFileRecordsWODois();
          await this.obtainFileRecordCreatedByMonth();
          await this.obtainFileEditByMonth();
          this.loading = false;
          let review = this.allDataCuration.needsReview || [];
          this.downloadReviewContent = "data:text/json;charset=utf-8," + encodeURIComponent(review.join('\n'));
          let curatorSummary = this.allDataCuration.curatorSummaryStatistics || [];
          this.downloadCuratorContent = "data:text/json;charset=utf-8," + encodeURIComponent(curatorSummary.join('\n'));
        })
      },
      methods: {
          ...mapActions('users', ['getUser', 'setError']),
          ...mapActions("record", ["updateRecord"]),

          prepareData(){
            this.prepareApprovalRequired(this.allDataCuration);
            this.prepareMaintenanceRequests(this.allDataCuration);
            this.prepareRecordsInCuration(this.allDataCuration);
            this.prepareHiddenRecords(this.allDataCuration);
            this.prepareRecordsCuratorCreationsLastWeek(this.allDataCuration);
            this.prepareSystemMessages(this.allDataCuration);
          },
          prepareApprovalRequired(dataCuration){
            let userRecords = dataCuration.approvalsRequired;
            userRecords.forEach(item => {
              item.fairsharingRecords.forEach(rec => {
                let object = {
                  createdAt: rec.createdAt,
                  updatedAt: rec.updatedAt,
                  curator: item.username.substring(0,6),
                  recordName: `${rec.name} (${rec.id})`,
                  id: rec.id,
                  type: rec.type,
                  processingNotes: rec.processingNotes,
                  hidden: false
                }
                if (rec.creator){
                  object.creator = rec.creator.username.substring(0,10);
                  object.idCreator = rec.creator.id;
                }else{
                  object.creator = "unknown"
                }
                if (rec.priority){
                  object.priority = "Priority";
                }else{
                  object.priority = "";
                }
                const index = dataCuration.hiddenRecords.findIndex((element) => element.id === rec.id);
                if (index>=0){
                  object.hidden = true;
                }
                if (rec.lastEditor){
                  object.lastEditor = rec.lastEditor.username;
                  object.idLastEditor = rec.lastEditor.id;
                }
                else{
                  object.lastEditor = "unknown"
                }
                this.approvalRequired.push(object);
              });
            });
            this.approvalRequired.sort(compareRecordDescUpdate);
            for (let i = 0; i < this.approvalRequired.length; i++) {
              this.approvalRequired[i].updatedAt = formatDate(this.approvalRequired[i].updatedAt);
              this.approvalRequired[i].createdAt = formatDate(this.approvalRequired[i].createdAt);
            }
            let curators = dataCuration.curatorList;
            let listSuper = [];
            let listCurator = [];
            curators.forEach(item => {
              let object = {
                id: item.id,
                userName: item.username
              };
              let role = item.role.name;
              if (role === "super_curator") {
                listSuper.push(object);
              }
              else if (role === "curator") {
                listCurator.push(object);
              }
            });
            this.curatorList = listSuper.concat(listCurator);
            let object = {
              id: -1,
              userName: "none"
            };
            this.curatorList.push(object);
          },
          prepareMaintenanceRequests(dataCuration){
            let requests = dataCuration.pendingMaintenanceRequests;
            requests.forEach(item => {
              let object = {
                createdAt: item.createdAt,
                recordName: `${item.fairsharingRecord.name} (${item.fairsharingRecord.id})`,
                id: item.fairsharingRecord.id,
                type: item.fairsharingRecord.type,
                userName: `${item.user.username}`,
                userId: `${item.user.id}`,
                processingNotes: item.fairsharingRecord.processingNotes,
                requestID: item.id
              };
              this.maintenanceRequests.push(object);
            });
            this.maintenanceRequests.sort(compareRecordDesc);
            for (let i = 0; i < this.maintenanceRequests.length; i++) {
              this.maintenanceRequests[i].createdAt = formatDate(this.maintenanceRequests[i].createdAt) ;
            }
          },

          prepareRecordsCuratorCreationsLastWeek(dataCuration){
            let records = dataCuration.recentCuratorCreations;
            records.forEach(item => {
              let object = {
                recordNameID: `${item.name} (${item.id})`,
                type: item.type,
                id: item.id
              };
              object.createdAt = formatDate(item.createdAt);
              if (item.creator){
                object.creator = item.creator.username;
                object.idCreator = item.creator.id;
              }
              else{
                object.creator = "unknown";
              }
              this.recordsCreatedCuratorsLastWeek.push(object);
            });
          },
          prepareRecordsInCuration(dataCuration){
            let userRecords = dataCuration.recordsInCuration;
            userRecords.forEach(item => {
              item.fairsharingRecords.forEach(rec => {
                let object = {
                  curator: item.username,
                  recordNameID: `${rec.name} (${rec.id})`,
                  recordMaintainers: "none"
                };
                let numMaint = 0;
                rec.maintainers.forEach(main => {
                  if (numMaint > 0){
                    object.recordMaintainers += ', ' + main.username+' ('+main.id+')';
                  }
                  else{
                    object.recordMaintainers = main.username+' ('+main.id+')';
                  }
                  numMaint += 1;
                });
                this.recordsInCuration.push(object);
              });
            });
          },
          prepareHiddenRecords(dataCuration){
            let records = dataCuration.hiddenRecords;
            records.forEach(item => {
              let object = {
                recordNameID: `${item.name} (${item.id})`,
                type: item.type,
                id: item.id
              };
              object.createdAt = formatDate(item.createdAt);
              if (item.curator){
                object.curator = item.curator.username
              }
              else{
                object.curator = 'none'
              }
              if (item.creator){
                object.creator = item.creator.username;
                object.idCreator = item.creator.id;
              }
              else{
                object.creator = "unknown"
              }
              this.hiddenRecords.push(object);
            });
          },
          prepareSystemMessages(dataCuration) {
            dataCuration.messages.forEach(item => {
              this.systemMessages.push({
                id: item.id,
                message: item.message,
                created_at: formatDate(item.createdAt),
                updated_at: formatDate(item.updatedAt)
              });
            })
          },
          async obtainFileRecordsWODois(){
            let data = await restClient.getRecordsWoDOIs(this.user().credentials.token);
            if (data) {
              let content = JSON.stringify(data)
                  .replace(/^\[(.+)\]$/,'$1')
                  .replace(/","/g,'"\r\n"')
                  .replace(/['"]+/g, '');
              this.downloadContent = "data:text/json;charset=utf-8," + encodeURIComponent(content);
            }
            else {
              this.downloadContent = "data:text/json;charset=utf-8," + "";
            }
          },
          async obtainFileRecordCreatedByMonth(){
            let data = await restClient.getRecordCreatedByMonth(this.user().credentials.token);
            if (data) {
              let content = JSON.stringify(data)
                  .replace(/^\[(.+)\]$/,'$1')
                  .replace(/","/g,'"\r\n"')
                  .replace(/['"]+/g, '');
              this.downloadRecordsByMonth = "data:text/json;charset=utf-8," + encodeURIComponent(content);
            }
            else {
              this.downloadRecordsByMonth = "data:text/json;charset=utf-8," + "";
            }
          },
          async obtainFileEditByMonth(){
            let data = await restClient.getEditByMonth(this.user().credentials.token);
            if (data) {
              let content = JSON.stringify(data)
                  .replace(/^\[(.+)\]$/,'$1')
                  .replace(/","/g,'"\r\n"')
                  .replace(/['"]+/g, '');
              this.downloadEditsByMonth = "data:text/json;charset=utf-8," + encodeURIComponent(content);
            }
            else {
              this.downloadEditsByMonth = "data:text/json;charset=utf-8," + "";
            }
          },
          showAddMessage() {
            const _module = this;
            _module.dialogs.addMessage = true;
          },
          async addMessage() {
            const _module = this;
            let data = {
              message: _module.dialogs.newMessage
            };
            let response = await restClient.createMessage(data, this.user().credentials.token);
            if (response.error){
              _module.error.general = response.error;
            }
            else {
              _module.systemMessages.push({
                id: response.id,
                message: response.message,
                created_at: formatDate(response.created_at),
                updated_at: formatDate(response.updated_at)
              });
              await store.dispatch("messages/setMessages");
            }
            _module.dialogs.addMessage = false;
            _module.dialogs.newMessage = null;
          },
          closeAddMessageMenu() {
            const _module = this;
            _module.dialogs.addMessage = false;
          },
          deleteMessage(messageId) {
            const _module = this;
            _module.dialogs.messageId = messageId;
            _module.dialogs.deleteMessage = true;
          },
          closeDeleteMessageMenu() {
            const _module = this;
            _module.dialogs.messageId = null;
            _module.dialogs.deleteMessage = false;
          },
          async confirmDeleteMessage() {
            const _module = this;
            let response = await restClient.deleteMessage(_module.dialogs.messageId, this.user().credentials.token);
            if (response.error){
              _module.error.general = response.error;
            }
            else {
              let filtered = _module.systemMessages.filter(function(f) {
                return f.id !== _module.dialogs.messageId;
              })
              _module.systemMessages = filtered;
              await store.dispatch("messages/setMessages");
            }
            _module.dialogs.deleteMessage = false;
            _module.dialogs.messageId = null;
          },
          async saveEditedMessage(id, message) {
            let _module = this;
            let data = {
              id: id,
              message: message
            };
            let response = await restClient.updateMessage(data, this.user().credentials.token);
            if (response.error){
              _module.error.general = response.error;
            }
            else {
              _module.systemMessages.forEach(function(m) {
                if (m.id === id) {
                  m.message = message;
                }
              });
              await store.dispatch("messages/setMessages");
            }
          }
      }
    }
</script>

<style scoped>
  #text-curator-search-1 div.theme--light.v-input:not(.v-input--is-disabled) input{
    color:#fff;
  }
  #text-curator-search-2 div.theme--light.v-input:not(.v-input--is-disabled) input{
    color:#fff;
  }
  #text-curator-search-3 div.theme--light.v-input:not(.v-input--is-disabled) input{
    color:#fff;
  }
</style>
