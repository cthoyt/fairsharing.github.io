<template>
  <v-expansion-panel
    v-if="filter.filterName"
    :id="filter.filterName + 'AutocompleteList' "
  >
    <v-expansion-panel-header> {{ filter.filterLabel }}</v-expansion-panel-header>
    <v-expansion-panel-content class="pl-5 pr-5">
      <div :class="['d-flex',{'flex-column':$vuetify.breakpoint.mdAndDown}]">
        <v-autocomplete
          v-model="selectedValues"
          :attach="true"
          :items="getValues"
          solo
          dense
          clearable
          multiple
          prepend-inner-icon="fa-search"
          :placeholder="`Search`"
          item-text="key"
          item-value="key"
          @focus="scrollTo(filter.filterName)"
          @click:clear="reset(filter)"
        >
          <template #selection="data">
            <v-chip class="blue white--text  mb-1 ">
              <span class="chipsValueName">
                {{ cleanString(data.item.key) }}
              </span>
            </v-chip>
          </template>
          <template #item="data">
            <div class="d-flex full-width">
              <span class="filterValueName"> {{ cleanString(data.item.key) }}</span>
              <span class="filterValueCount"> {{ data.item['doc_count'] }}</span>
            </div>
          </template>
        </v-autocomplete>
        <v-btn
          color="primary"
          class="ml-lg-2 custom-btn"
          @click="applyFilters(filter)"
        >
          Apply
        </v-btn>
      </div>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import {mapGetters, mapState} from 'vuex'
import clearString from '@/utils/stringUtils'

export default {
  name: "FilterAutocomplete",
  mixins: [clearString],
  props: {
    filter: {default: null, type: Object},
    lastItem:{default:false, type:Boolean}
  },
  data: () => {
    return {
      selectedValues: []
    }
  },
  computed: {
    ...mapGetters('records', ['getFilter']),
    ...mapState('uiController', ['stickToTop']),
    getValues: function () {
      let _module = this;
      let output = _module.getFilter(this.filter.filterName);
      if (output.values && typeof output.values === 'object') {
        return output.values;
      }
      return []
    }
  },
  methods: {
    /**
     * Apply the filters by building the new query parameters using the form data.
     */
    applyFilters: function () {
      let _module = this;
      let filterName = _module.filter.filterName;
      let currentParams = JSON.parse(JSON.stringify(_module.$route.query));

      if (Object.keys(currentParams).indexOf(filterName) === -1) {
        if (_module.selectedValues !== null && _module.selectedValues.length > 0) {
          if (_module.selectedValues.length === 1) {
            currentParams[filterName] = encodeURIComponent(_module.selectedValues.join(','));
          }
          else {
            let newParam = [];
            _module.selectedValues.forEach(function (val) {
              newParam.push(encodeURIComponent(val));
            });
            currentParams[filterName] = newParam.join(",");
          }
          currentParams['page'] = 1;
          _module.$router.push({
            name: _module.$route.name,
            query: currentParams
          });
        }
      }
      else {
        if (_module.selectedValues === null || _module.selectedValues.length === 0) {
          delete currentParams[_module.filter.filterName];
          currentParams['page'] = 1;
          _module.$router.push({
            name: _module.$route.name,
            query: currentParams
          });
        }
        else {
          let newParams = [];
          let existingValues = currentParams[_module.filter.filterName].split(",");
          _module.selectedValues.forEach(function (selectedValue) {
            const filterVal = encodeURIComponent(selectedValue);
            if (existingValues.indexOf(filterVal) === -1) {
              newParams.push(filterVal);
            }
          });
          currentParams[_module.filter.filterName] += `,${newParams.join(",")}`;
          if (newParams.length > 0) {
            currentParams['page'] = 1;
            _module.$router.push({
              name: _module.$route.name,
              query: currentParams
            });
          }
        }
      }
      _module.selectedValues = [];
    },
    /**
     * Reset the form/filters/parameters to default (go so /search?page=1)
     */
    reset: function (selectedItem) {
      selectedItem.filterSelected = {};
    },
    /* istanbul ignore next */
    scrollTo(name) {
      let _module = this;
      _module.$scrollTo("#" + name + 'AutocompleteList', 450, {
        container: '#scrollable-holder',
        easing: 'ease-in',
      })
    }
  }
}
</script>

<style scoped>
.filterValueName {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  flex: 1;
}

.chipsValueName {
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.filterValueCount {
  background: #2196F3;
  color: white;
  padding: 0 7px;
}

.custom-btn {
  height: 38px;
}
</style>
