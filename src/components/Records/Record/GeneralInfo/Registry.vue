<template>
  <div class="d-flex flex-row mt-4 align-center min-height-40">
    <b class="width-15-percent-flex">Registry</b>
    <p class="ma-0 full-width ml-md-12 ml-13">
      {{ getField('registry') | capitalize }}
    </p>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import stringUtils from "@/utils/stringUtils";
export default {
  name: "Registry",
  mixins: [stringUtils],
  computed: {
    ...mapGetters("record", ["getField"]),
  }
}
</script>
