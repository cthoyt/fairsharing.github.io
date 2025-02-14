<template>
  <v-expand-transition>
    <v-overlay
      v-if="editOrganisationLink.showOverlay"
      :dark="false"
      :absolute="false"
      opacity="0.8"
    >
      <v-form
        id="editOrganisationLink"
        ref="editOrganisationLink"
        v-model="formValid"
      >
        <v-card
          key="edit"
          class="flexCard grey black--text"
          height="100%"
          width="1000px"
          :class="{'lighten-0': menus.show, 'lighten-3': !menus.show}"
        >
          <v-card-title class="green white--text">
            <span v-if="editOrganisationLink.id > -1">
              Edit relationship
            </span>
            <span v-else>
              Create a new relationship
            </span>
          </v-card-title>
          <v-card-text class="pt-3">
            <!-- ORGANISATIONS -->
            <div>
              <v-card
                class="d-flex flex-row transparent elevation-0"
                :disabled="!!menus.show"
              >
                <v-autocomplete
                  v-model="editOrganisationLink.data.organisation"
                  :items="organisations"
                  :filter="customFilter"
                  item-text="name"
                  item-value="id"
                  outlined
                  return-object
                  label="Select an organisation"
                  :rules="[rules.isRequired()]"
                >
                  <template #selection="data">
                    <v-chip class="blue white--text px-3 py-1">
                      {{ data.item.name }}
                    </v-chip>
                  </template>
                  <template #item="data">
                    <v-list-item-avatar>
                      <img
                        v-if="data.item['urlForLogo']"
                        :src="'https://api.fairsharing.org' + data.item['urlForLogo']"
                      >
                      <v-icon v-else>
                        fas fa-sitemap
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content
                      class="mb-2"
                      style="max-width: 870px;"
                    >
                      <v-list-item-title> {{ data.item.name }} </v-list-item-title>
                      <v-list-item-subtitle> {{ data.item.homepage }} </v-list-item-subtitle>
                      <v-list-item-subtitle v-if="data.item.types.length > 0">
                        Types: {{ data.item.types.join(", ") }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
                <div class="mt-2 ml-2">
                  <v-btn
                    class="green white--text"
                    @click="addNewOrganisation"
                  >
                    <v-icon small>
                      fa-plus
                    </v-icon>
                    <span class="ml-1">Add New</span>
                  </v-btn>
                </div>
              </v-card>
              <v-card
                v-if="menus.show === 'organisation'"
                class="elevation-0 lighten-3 grey mb-10 pb-3 px-3"
                style="border: 2px dashed grey !important; border-radius:5px;"
              >
                <v-card-title>Create a new organisation</v-card-title>
                <v-card-text
                  v-if="menus.newOrganisation.error"
                  class="mb-0 pb-0"
                >
                  <v-alert
                    type="error"
                    class="mb-0"
                  >
                    {{ menus.newOrganisation.error.response.data }}
                  </v-alert>
                </v-card-text>
                <v-card-text
                  v-if="!validName"
                  class="mb-0 pb-0"
                >
                  <v-alert
                    type="error"
                    class="mb-0"
                  >
                    No matching organisation found.
                  </v-alert>
                </v-card-text>
                <v-card-text
                  v-if="!enterName"
                  class="mb-0 pb-0"
                >
                  <v-alert
                    type="success"
                    class="mb-0"
                  >
                    Select an organisation
                  </v-alert>
                </v-card-text>
                <v-card-text>
                  <v-form
                    id="createNewOrganisation"
                    ref="createNewOrganisation"
                    v-model="menus.newOrganisation.formValid"
                  >
                    <v-container fluid>
                      <v-row>
                        <v-col
                          cols="12"
                          class="pb-0"
                        >
                          <!-- Enter name of organisation -->
                          <v-text-field
                            v-if="enterName"
                            v-model="menus.newOrganisation.data.name"
                            label="Organisation Name"
                            outlined
                            :rules="[rules.isRequired()]"
                            @keydown="validName = true"
                          />
                          <v-autocomplete
                            v-else
                            v-model="menus.newOrganisation.selectOrganisation"
                            :items="organisationsList"
                            outlined
                            item-text="name"
                            item-value="id"
                            return-object
                            label="Select an organisation"
                            :rules="[rules.isRequired()]"
                            @change="selectOrganisationFromList()"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          class="pb-0"
                        >
                          <v-text-field
                            v-model="menus.newOrganisation.data.homepage"
                            label="Organisation Homepage"
                            outlined
                            :rules="[rules.isRequired(), rules.isURL()]"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          class="pb-0"
                        >
                          <v-autocomplete
                            v-model="menus.newOrganisation.data.organisation_type_ids"
                            :items="organisationsTypes"
                            multiple
                            outlined
                            item-text="name"
                            item-value="id"
                            return-object
                            label="Select an organisation type(s)"
                            :rules="[rules.isRequired()]"
                          >
                            <!-- autocomplete selected -->
                            <template #selection="data">
                              <v-chip
                                class="blue white--text removeStyle"
                                close
                                @click:close="removeType(data.item)"
                              >
                                {{ data.item.name }}
                              </v-chip>
                            </template>
                          </v-autocomplete>
                        </v-col>
                        <v-col cols="12">
                          <v-file-input
                            v-if="false"
                            v-model="menus.newOrganisation.data.logo"
                            accept="image/png, image/jpeg"
                            label="File input"
                            placeholder="Select a logo"
                            outlined
                            :show-size="1000"
                            clearable
                            chips
                          />
                        </v-col>
                        <!-- countries -->
                        <v-col
                          cols="12"
                          class="pb-0"
                        >
                          <v-autocomplete
                            v-model="menus.newOrganisation.data.country_ids"
                            label="Countries"
                            :items="countries"
                            item-text="name"
                            item-value="name"
                            multiple
                            outlined
                            return-object
                            :rules="[menus.newOrganisation.data.country_ids &&
                              !(menus.newOrganisation.data.country_ids.length === 0)]"
                          >
                            <template #prepend>
                              <v-tooltip
                                bottom
                                max-width="300px"
                                class="text-justify"
                              >
                                <template #activator="{ on }">
                                  <v-icon v-on="on">
                                    fa-question-circle
                                  </v-icon>
                                </template>
                                {{ tooltips['countries'] }}
                              </v-tooltip>
                            </template>

                            <!-- autocomplete selected -->
                            <template #selection="data">
                              <v-chip
                                class="blue white--text removeStyle"
                                close
                                @click:close="removeCountry( data.item )"
                              >
                                {{ data.item.name }}
                              </v-chip>
                            </template>

                            <!-- autocomplete data -->
                            <template #item="data">
                              <country-flag
                                v-if="data.item.code !== null"
                                :country="data.item.code"
                                size="normal"
                              />
                              <img
                                v-else
                                src="@/assets/placeholders/country.png"
                                class="ml-4 mr-3"
                              >
                              <div> {{ data.item.name }} </div>
                            </template>
                          </v-autocomplete>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <v-btn
                        class="success"
                        :disabled="importROR"
                        :loading="menus.newOrganisation.loading"
                        v-on="on"
                        @click="getOrganisations()"
                      >
                        Import from ROR
                      </v-btn>
                    </template>
                    {{ tooltips['ror_import'] }}
                  </v-tooltip>
                  <v-spacer />
                  <v-btn
                    color="warning"
                    class="success"
                    @click="clearForm()"
                  >
                    Clear Form
                  </v-btn>
                  <v-btn
                    class="success"
                    :disabled="!menus.newOrganisation.formValid"
                    :loading="menus.newOrganisation.loading"
                    @click="createNewOrganisation()"
                  >
                    Save new organisation
                  </v-btn>
                  <v-btn
                    class="error"
                    @click="menus.show = false"
                  >
                    Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>

            <!-- RELATIONSHIP -->
            <div class="mb-3">
              <v-card
                class="d-flex flex-row transparent elevation-0"
                :disabled="!!menus.show"
              >
                <v-autocomplete
                  v-model="editOrganisationLink.data.relation"
                  :items="organisationsRelations"
                  outlined
                  label="Select a type of relationship"
                  :disabled="!!menus.show"
                  class="mt-4"
                  :rules="[rules.isRequired()]"
                >
                  <template #selection="data">
                    <v-chip class="blue white--text px-3 py-1">
                      {{ data.item }}
                    </v-chip>
                  </template>
                  <template #item="data">
                    <v-list-item-content style="width:100%;height:100%">
                      {{ data.item }}
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
              </v-card>
            </div>
            <!-- GRANT -->
            <div v-if="editOrganisationLink.data.relation === 'funds'">
              <v-card
                class="d-flex flex-row transparent elevation-0"
                :disabled="!!menus.show"
              >
                <v-autocomplete
                  v-model="editOrganisationLink.data.grant"
                  :items="grants"
                  item-text="name"
                  item-value="id"
                  outlined
                  return-object
                  label="Select an optional grant for funding organisations"
                >
                  <template #selection="data">
                    <v-chip class="blue white--text px-3 py-1">
                      {{ data.item.name }}
                    </v-chip>
                  </template>
                  <template #item="data">
                    <v-list-item-avatar>
                      <v-icon>fas fa-funnel-dollar</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content
                      class="py-0"
                      style="max-width: 870px;"
                    >
                      <v-list-item-title> {{ data.item.name }} </v-list-item-title>
                      <v-list-item-subtitle> {{ data.item.description }} </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
                <v-btn
                  fab
                  small
                  class="green white--text mt-2 ml-2"
                  @click="menus.show = 'grant'"
                >
                  <v-icon small>
                    fa-plus
                  </v-icon>
                </v-btn>
              </v-card>
              <v-card
                v-if="menus.show === 'grant'"
                class="elevation-0 lighten-3 grey mb-10 pb-3 px-3"
                style="border: 2px dashed grey !important; border-radius:5px;"
              >
                <v-card-title>Create a new grant</v-card-title>
                <v-card-text
                  v-if="menus.newGrant.error"
                  class="mb-0 pb-0"
                >
                  <v-alert
                    type="error"
                    class="mb-0"
                  >
                    {{ menus.newGrant.error.response.data }}
                  </v-alert>
                </v-card-text>
                <v-card-text>
                  <v-form
                    id="createNewGrant"
                    ref="createNewGrant"
                    v-model="menus.newGrant.formValid"
                  >
                    <v-text-field
                      v-model="menus.newGrant.data.name"
                      label="Grant Name"
                      outlined
                      :rules="[rules.isRequired()]"
                    />
                    <v-text-field
                      v-model="menus.newGrant.data.description"
                      label="Grant Description"
                      outlined
                    />
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    class="success"
                    :disabled="!menus.newGrant.formValid"
                    :loading="menus.newGrant.loading"
                    @click="createNewGrant()"
                  >
                    Save new grant
                  </v-btn>
                  <v-btn
                    class="error"
                    @click="menus.show = false"
                  >
                    Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              class="success"
              :disabled="!!menus.show || !formValid"
              @click="confirmModifications()"
            >
              Confirm
            </v-btn>
            <v-btn
              class="error"
              @click="hideMenu()"
            >
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-overlay>
  </v-expand-transition>
</template>

<script>
    import Vue from "vue"
    import {mapGetters, mapState} from "vuex"
    import { isRequired, isUrl } from "@/utils/rules.js"
    import RestClient from "@/lib/Client/RESTClient.js"
    import CountryFlag from "vue-country-flag";
    import PublicationClient from "@/lib/Client/ExternalClients.js"
    const restClient = new RestClient();
    const pubClient = new PublicationClient();

    export default {
      name: "LinkOverlay",
      components: {CountryFlag},
      data(){
        return {
          formValid: false,
          menus: {
            show: false,
            newOrganisation: {
              data: {
                organisation_type_ids: [],
                country_ids: [],
                parent_ror_links: [],
                child_ror_links: [],
              },
              loading: false,
              formValid: false,
              logoData: null,
              error: false,
              selectOrganisation:{}
            },
            newGrant: {
              data: {},
              formValid: false,
              loading: false,
              error: false
            },
          },
          rules: {
            isRequired: function(){return isRequired() },
            isURL: function(){ return isUrl() }
          },
          organisationsList:[],
          organisationsNameList: [],
          enterName: true,
          importROR: false,
          validName: true
        }
      },
      computed: {
        ...mapState("users", ["user"]),
        ...mapState("record", ["editOrganisationLink", "sections"]),
        ...mapState("editor", ["organisations", "organisationsTypes", "grants", "organisationsRelations"]),
        ...mapState("editor", [
          "countries",
          "years",
          "tooltips",
          "recordTypes",
          "status"
        ]),
        ...mapGetters("record", ["getSection", "getCreatingNewRecord"]),
        organisationLinks() {
          return this.sections["organisations"].data;
        }
      },
      watch: {
        'menus.newOrganisation.data.logo': function(){
          if (this.menus.newOrganisation.data.logo) {
            let reader = new FileReader();
            reader.addEventListener('load', async (event) => {
              this.menus.newOrganisation.logoData = {
                filename: this.menus.newOrganisation.data.logo.name,
                data: event.target['result'],
                content_type: this.menus.newOrganisation.data.logo.type
              };
            });
            reader.readAsDataURL(this.menus.newOrganisation.data.logo);
          }
        },
        'editOrganisationLink.showOverlay': function() {
            this.$nextTick(() => {
              /* istanbul ignore next */
              if (this.$refs['editOrganisationLink']) this.$refs['editOrganisationLink'].validate()
            })
        },
        'menus.show': function(val){
          /* istanbul ignore next */
          if (val === 'grant') this.$nextTick(() => {
            if (this.$refs['createNewGrant']) this.$refs['createNewGrant'].validate();
          });
          /* istanbul ignore next */
          if (val === 'organisation') this.$nextTick(() => {
            if (this.$refs['createNewOrganisation']) this.$refs['createNewOrganisation'].validate();
          });
        }
      },
      methods: {
        removeCountry(country) {
          this.menus.newOrganisation.data.country_ids = this.menus.newOrganisation.data.country_ids.filter(obj =>
              obj.label !== country.name && obj.id !== country.id
          );
        },
        removeType(type) {
          this.menus.newOrganisation.data.organisation_type_ids = this.menus.newOrganisation.data.organisation_type_ids.filter(obj =>
              obj.label !== type.name && obj.id !== type.id
          );
        },
        hideMenu() {
          this.menus.show = false;
          this.editOrganisationLink.data = {};
          this.editOrganisationLink.id = null;
          this.editOrganisationLink.showOverlay = false;
        },
        createNewOrganisation: async function () {
          this.menus.newOrganisation.loading = true;
          this.menus.newOrganisation.error = false;
          let organisationInput = JSON.parse(JSON.stringify(this.menus.newOrganisation.data));
          if (this.menus.newOrganisation.logoData) {
            organisationInput.logo = this.menus.newOrganisation.logoData;
            organisationInput.logo.data = organisationInput.logo.data.replace("data:image/png;base64,", "");
          }
          let organisation_type_ids = JSON.parse(JSON.stringify(organisationInput.organisation_type_ids));
          organisationInput.organisation_type_ids = organisationInput.organisation_type_ids.map(obj => obj.id);
          /* istanbul ignore next */
          if (organisationInput.country_ids) {
            organisationInput.country_ids = organisationInput.country_ids.map(obj => obj.id);
          }
          if (organisationInput.parent_ror_links) {
            organisationInput.parent_ror_links = organisationInput.parent_ror_links.map(obj => obj.id);
          }
          if (organisationInput.child_ror_links) {
            organisationInput.child_ror_links = organisationInput.child_ror_links.map(obj => obj.id);
          }
          let data = await restClient.createOrganisation(organisationInput, this.user().credentials.token);
          if (!data.error) {
            let newOrganisation = {
              id: data.data.id,
              name: data.data.attributes.name,
              homepage: data.data.attributes.homepage,
              types: organisation_type_ids.map(obj => obj.name),
              urlForLogo: data.data.attributes.url_for_logo
            };
            this.$store.commit('record/setEditOrganisationLinkOrganisation', newOrganisation);
            Vue.set(this.organisations, this.organisations.length, newOrganisation);
            this.menus.show = null;
            this.menus.newOrganisation.data = {
              organisation_type_ids: [],
              country_ids: []
            };
          } else {
            this.menus.newOrganisation.error = data.error;
          }
          this.menus.newOrganisation.loading = false;
        },
        async createNewGrant() {
          this.menus.newGrant.loading = true;
          this.menus.newGrant.error = false;
          let data = await restClient.createGrant(this.menus.newGrant.data, this.user().credentials.token);
          if (!data.error) {
            let newGrant = {
              name: data.name,
              description: data.description,
              id: data.id
            };
            this.$store.commit('record/setEditOrganisationLinkGrant', newGrant);
            Vue.set(this.grants, this.grants.length, newGrant);
            this.menus.show = null;
            this.menus.newGrant.data = {};
          } else {
            this.menus.newGrant.error = data.error;
          }
          this.menus.newGrant.loading = false;
        },
        confirmModifications() {
          let data = JSON.parse(JSON.stringify(this.editOrganisationLink.data));
          if (this.editOrganisationLink.id > -1) {
            Vue.set(this.organisationLinks, this.editOrganisationLink.id, data);
          } else Vue.set(this.organisationLinks, this.organisationLinks.length, data);
          this.editOrganisationLink.showOverlay = false;
        },
        customFilter(item, queryText) {
          let textToSearch = item.name;
          // A newly-created organisation in memory may have no alternativeNames.
          // See: https://github.com/FAIRsharing/fairsharing.github.io/issues/1799
          /* istanbul ignore else */
          if (item.alternativeNames) {
           textToSearch = textToSearch + " " + item.alternativeNames.join(" ");
          }
          const searchText = queryText.toLowerCase();

          return textToSearch.toLowerCase().indexOf(searchText) > -1
        },

        addNewOrganisation() {
          this.menus.show = 'organisation'
          this.enterName = true
          this.importROR = false
        },

        async getOrganisations() {
          this.menus.newOrganisation.loading = true;
          let orgName = (' ' + this.menus.newOrganisation.data.name).slice(1).trim()// make a copy of the string and trim it
          let data = await pubClient.getROROrganisation(orgName);
          if (data.items && data.items.length) {
            this.enterName = false
            this.importROR = true
            this.validName = true
            this.organisationsList = data.items
            this.organisationsNameList = data.items.map(item => item.name)
          } else {
            this.enterName = true
            this.importROR = false
            this.validName = false
          }
          this.menus.newOrganisation.loading = false;
        },

        selectOrganisationFromList() {
          if (this.menus.newOrganisation.selectOrganisation && Object.keys(this.menus.newOrganisation.selectOrganisation).length) {
            /************  Organisation Name ************/
            this.menus.newOrganisation.data.name = this.menus.newOrganisation.selectOrganisation.name
            /**************  Homepage Link **************/
            this.menus.newOrganisation.data.homepage = this.menus.newOrganisation.selectOrganisation.links[0]
            /***************  ROR Link ***************/
            this.menus.newOrganisation.data.ror_link = this.menus.newOrganisation.selectOrganisation.id
            /***************  Alternative Names ***************/
            this.menus.newOrganisation.data.alternative_names =
                this.menus.newOrganisation.selectOrganisation.aliases.concat(
                    this.menus.newOrganisation.selectOrganisation.acronyms
                )
            /***************  Type Select ***************/
            this.selectTypes()
            /*************  Country Select *************/
            this.menus.newOrganisation.data.country_ids = this.countries.filter(country => country.name === this.menus.newOrganisation.selectOrganisation.country["country_name"])
            /*************  Parent ror relationship *************/
            this.menus.newOrganisation.data.parent_ror_links = this.menus.newOrganisation.selectOrganisation.relationships.filter(obj => obj.type === "Parent")
            this.menus.newOrganisation.data.child_ror_links = this.menus.newOrganisation.selectOrganisation.relationships.filter(obj => obj.type === "Child")
          }
        },

        selectTypes() {
          const selectedType = this.menus.newOrganisation.selectOrganisation.types[0]
          const matchedType = this.organisationsTypes.filter(type => type.name === this.menus.newOrganisation.selectOrganisation.types[0])
          if (matchedType && matchedType.length) {
            this.menus.newOrganisation.data.organisation_type_ids = matchedType
          } else{
            switch (selectedType) {
              case 'Government':
                this.menus.newOrganisation.data.organisation_type_ids = [this.organisationsTypes[0]]
                break
              case 'Nonprofit':
                this.menus.newOrganisation.data.organisation_type_ids = [this.organisationsTypes[1]]
                break
              case 'Education':
                this.menus.newOrganisation.data.organisation_type_ids = [this.organisationsTypes[2]]
                break
              case 'Healthcare':
              case 'Archive':
              case 'Facility':
              case 'Other':
              default:
                this.menus.newOrganisation.data.organisation_type_ids = [this.organisationsTypes[8]]
            }
          }
        },

        clearForm() {
          this.enterName = true
          this.importROR = false
          this.validName = true
          this.menus.newOrganisation.data.name = ''
          this.menus.newOrganisation.data.ror_link = null
          this.menus.newOrganisation.data.parent_ror_links = []
          this.menus.newOrganisation.data.child_ror_links = []
          this.$refs.createNewOrganisation.reset()
        },
      }
    }
</script>
