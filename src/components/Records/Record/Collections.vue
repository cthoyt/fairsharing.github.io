<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card
    v-if="!tabsDataExist"
    class="pa-4 d-flex flex-column"
    outlined
    :color="backColor"
    tile
    elevation="3"
  >
    <SectionTitle title="Collections &amp; Recommendations" />
    <div class="d-flex flex-column ml-2 min-height-40">
      <div class="d-flex flex-wrap mt-5">
        <!--  search autocomplete    -->
        <v-autocomplete
          v-if="!tabsDataExist"
          v-model="selectedValues"
          :disabled="tabsData.tabs[Object.keys(tabsData.tabs)[tabsData.selectedTab]].data.length<5"
          :items="getValues"
          solo
          :attach="true"
          dense
          clearable
          prepend-inner-icon="fa-search"
          :placeholder="`Search through ${cleanString(Object.keys(tabsData.tabs)[tabsData.selectedTab])}`"
          item-text="name"
          item-value="name"
        >
          <template #item="data">
            <span class="filterValueName">
              {{ data.item.name }}
            </span>
          </template>
        </v-autocomplete>
      </div>
      <!--  tabs    -->
      <v-tabs
        v-if="!tabsDataExist"
        v-model="tabsData.selectedTab"
        :show-arrows="$vuetify.breakpoint.mdAndDown"
        background-color="transparent"
        grow
        color="accent3"
        slider-color="accent3"
        class="mb-5"
        :hide-slider="tabsData.tabs[Object.keys(tabsData.tabs)[tabsData.selectedTab]].data.length===0"
      >
        <v-tab
          v-for="(tabName,tabIndex) in Object.keys(tabsData.tabs)"
          :key="tabName+'_'+tabIndex"
          :disabled="tabsData.tabs[tabName].data.length===0"
          @change="selectedValues=null"
        >
          {{ cleanString(tabName) }} ({{ tabsData.tabs[tabName].count }})
        </v-tab>
      </v-tabs>
      <!--  tab content  -->
      <v-tabs-items
        v-if="!tabsDataExist"
        v-model="tabsData.selectedTab"
        :class="['transparent',tabsDataExist]"
      >
        <v-tab-item
          v-for="(tabItem,tabItemIndex) in filterList"
          :key="tabItem+'_'+tabItemIndex"
        >
          <v-virtual-scroll
            :items="tabItem.data"
            height="400"
            item-height="130"
            class="ma-4 overflow-x-hidden"
          >
            <template #default="{ item,index }">
              <router-link
                :to="'/'+item.id"
                @click.native="()=>$scrollTo('body',0,{})"
              >
                <v-card
                  :key="item.id + '_' + index"
                  class="pa-4 d-flex flex-column v-card-hover mx-2 height-120"
                  flat
                  outlined
                >
                  <div class="d-flex align-center">
                    <record-status
                      :record="item"
                      :show-status="false"
                    />
                    <div class="ml-10 underline-effect text-ellipses-height-2lines line-height-20">
                      {{ item.name }}
                    </div>
                  </div>
                  <p class="grey--text  relation-style text-ellipses-height-2lines line-height-14 pr-5">
                    {{ item.object }}
                    <v-tooltip top>
                      <template #activator="{ on }">
                        <span
                          class="red--text mouse-info"
                          v-on="on"
                        >
                          {{ item.recordAssociationLabel }}
                        </span>
                      </template>
                      <span>{{ relationDefinition[item.recordAssociationLabel] }}</span>
                    </v-tooltip>
                    {{ item.subject }}
                  </p>
                </v-card>
              </router-link>
            </template>
          </v-virtual-scroll>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-card>
</template>

<script>
import SectionTitle from '@/components/Records/Record/SectionTitle';
import {mapState} from "vuex";
import stringUtils from "@/utils/stringUtils"
import RecordStatus from "@/components/Records/Shared/RecordStatus";
import recordTabUtils from "@/utils/recordTabUtils";
import recordRelationShipsDefinitions from "@/data/RecordRelationShipsDefinitions.json";

export default {
  name: "Collections",
  components: {
    RecordStatus,
    SectionTitle,
  },
  mixins: [stringUtils, recordTabUtils],
  props:{
    backColor:{
      default:null,
      type: String,
    }
  },
  data: () => {
    return {
      relationDefinition: recordRelationShipsDefinitions,
      selectedValues: null,
      tabsData: {
        selectedTab: 0,
        tabs: {
          in_collections: {relation: 'collects', data: [], count:0}
        }
      }
    }
  },
  computed: {
    ...mapState("record", ["currentRecord"]),
  },
  methods: {
    /** Dynamically sets data for each tabs based on the data received from recordAssociations and reverseAssociations*/
    prepareTabsData() {
      const _module = this;
      // There are different tabs for policies vs. other registries.
      if (_module.currentRecord['fairsharingRecord'].registry === 'Policy') {
        _module.tabsData.tabs.related_policies = {
          registry: ['Policy'],
          data: [],
          count:0
        }
      }
      else {
        _module.tabsData.tabs.in_policies = {
          relation: 'recommends',
          data: [],
          count:0
        }
      }
      if (Object.keys(_module.currentRecord['fairsharingRecord']).includes('recordAssociations') ||
          Object.keys(_module.currentRecord['fairsharingRecord']).includes('reverseRecordAssociations')) {
        /*
         * In this case the related_policies tab could have relations going either way.
         */
        if (_module.currentRecord['fairsharingRecord'].registry === 'Policy') {
          Object.keys(_module.tabsData.tabs).forEach(tabName => {
            // All policy relations, incoming or outgoing.
            if (tabName === 'related_policies') {
              _module.tabsData.tabs[tabName].data = _module.prepareAssociations(
                  _module.currentRecord['fairsharingRecord'].recordAssociations,
                  _module.currentRecord['fairsharingRecord'].reverseRecordAssociations
              ).filter(
                  item => _module.tabsData.tabs[tabName].registry.includes(item.registry)
              ).filter(
                  item => item.recordAssociationLabel !== 'collects'
              )
              _module.tabsData.tabs[tabName].count = _module.tabsData.tabs[tabName].data.length;
            }
            // All incoming collections.
            else {
              _module.tabsData.tabs[tabName].data = _module.prepareAssociations(
                  [],
                  _module.currentRecord['fairsharingRecord']['reverseRecordAssociations']
              ).filter(item => item.recordAssociationLabel === _module.tabsData.tabs[tabName].relation);
              _module.tabsData.tabs[tabName].count = _module.tabsData.tabs[tabName].data.length;
            }
          })
        }
        /*
         * Here, only incoming recommends or collects relations are expected.
         */
        else {
          Object.keys(_module.tabsData.tabs).forEach(tabName => {
            _module.tabsData.tabs[tabName].data = _module.prepareAssociations(
                [],
                _module.currentRecord['fairsharingRecord']['reverseRecordAssociations']
            ).filter(item => item.recordAssociationLabel === _module.tabsData.tabs[tabName].relation);
            _module.tabsData.tabs[tabName].count = _module.tabsData.tabs[tabName].data.length;
          })
        }
      }
      else {
        return false
      }
    },
  }
}
</script>
