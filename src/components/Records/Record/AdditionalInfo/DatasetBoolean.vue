<template>
  <div
    v-if="Object.keys(allowedFields).includes('properties') && allowedFields.properties[fieldName] && getField('metadata')[fieldName]==='yes'"
    class="d-flex pa-4 data-holder flex-row mt-4 align-center min-height-40 mb-4"
  >
    <b class="full-width min-width-200 max-width-200 text-capitalize">{{ cleanString(fieldName) }}</b>
    <div class="d-flex full-width min-width-200 max-width-200">
      <p class="ma-0">
        {{ getField('metadata')[fieldName] }}
      </p>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import stringUtils from '@/utils/stringUtils'

export default {
  name: "DatasetBoolean",
  mixins: [ stringUtils ],
  props: {
    fieldName: {default: null, type: String}
  },
  computed: {
    ...mapState('editor', ["allowedFields"]),
    ...mapGetters("record", ["getField"]),
  },
}
</script>

<style scoped>

</style>
