<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card
    v-if="(getField('metadata')['contacts'] && getField('metadata')['contacts'].length) || (getField('metadata')['support_links'] && getField('metadata')['support_links'].length)"
    class="pa-4 d-flex flex-column"
    outlined
    :color="backColor"
    tile
    elevation="3"
  >
    <SectionTitle title="Support" />
    <div class="d-flex flex-column ml-2 min-height-40">
      <div v-if="(getField('metadata')['contacts'] && getField('metadata')['contacts'].length) || (getField('metadata')['support_links'] && getField('metadata')['support_links'].length)">
        <v-card
          v-for="(item,key,index) in generateSupport()"
          :key="key+'_'+index"
          class="pa-4 mt-15 d-flex flex-column"
          outlined
          color="white"
          tile
          elevation="3"
        >
          <Icon
            :item="item.icon"
            size="20"
          />
          <v-card-title class="pa-0 text--primary card-title-customize">
            {{ key | capitalize }}
          </v-card-title>
          <v-card-text class="ma-0 pt-8">
            <v-card
              v-for="(subItem,subIndex) in item.data"
              :key="subItem.name+'_'+subIndex"
              class="pa-4 mt-2 d-flex flex-column v-card-hover"
              flat
              outlined
            >
              <a
                v-if="subItem.name && subItem.url"
                :href="checkUrl(subItem.url)"
                target="_blank"
                class="underline-effect"
              >
                {{ subItem.name }}
              </a>
              <a
                v-if="!subItem.name && subItem.url"
                :href="checkUrl(subItem.url)"
                target="_blank"
              >
                {{ subItem.url }}
              </a>
              <div
                v-if="subItem.contact_name || subItem.contact_email"
                class="d-flex flex-column"
              >
                <div
                  v-if="subItem.contact_name"
                  class="d-flex flex-wrap"
                >
                  <span class="min-width-60">Name:</span>
                  <a
                    v-if="subItem.contact_email"
                    :href="'mailto:'+subItem.contact_email"
                    target="_blank"
                    class="underline-effect"
                  >
                    {{ subItem.contact_name }}
                  </a>
                </div>
                <div v-else-if="subItem.contact_email && !subItem.contact_name">
                  <a
                    v-if="subItem.contact_email"
                    :href="'mailto:'+subItem.contact_email"
                    target="_blank"
                    class="underline-effect"
                  >
                    {{ subItem.contact_email }}
                  </a>
                </div>
                <div
                  v-if="subItem.contact_orcid"
                  class="d-flex flex-wrap"
                >
                  Orcid ID: <Icon
                    :height="17"
                    item="Orcid"
                    wrapper-class="pl-1 pr-1"
                  />
                  <span
                    class="min-width-60"
                    style="white-space:nowrap"
                  >
                    <strong>
                      <a :href="'http://orcid.org/' + subItem.contact_orcid">{{ subItem.contact_orcid }}</a>
                    </strong>
                  </span>
                </div>
              </div>
            </v-card>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <section />
  </v-card>
</template>

<script>
import SectionTitle from '@/components/Records/Record/SectionTitle';
import clearString from '@/utils/stringUtils'
import {mapGetters} from "vuex";
import Icon from "@/components/Icon";
import IconsMixin from "@/utils/iconsMixin.js"

export default {
  name: "Support",
  components: {
    Icon,
    SectionTitle
  },
  mixins: [clearString, IconsMixin],
  props:{
    backColor:{
      default:null,
      type: String,
    }
  },
  computed: {
    ...mapGetters("record", ["getField"]),
  },
  methods:{
    generateSupport() {
      let processedSupport = {}
      const support_links =  this.getField('metadata')['support_links']
      const contacts = this.getField('metadata')['contacts']
      // initializing object's key and data dynamically based on any number of types coming from API
      if (support_links) {
        support_links.forEach(item => {
          if (!Object.prototype.hasOwnProperty.call(processedSupport, item.type)) {
            processedSupport[item.type] = {
              data: [],
              icon: null
            }
          }
        });
        // assigning data and icon to the different types came from API.
        support_links.forEach(item => {
          // Replace parentheses, brackets, space,forward slashes with underscore.
          processedSupport[item.type].icon = this.getIconName(item.type);
          processedSupport[item.type].data.push(item)
        })
      }
      // adding licenses if available
      if (contacts && contacts.length) {
        processedSupport['contacts'] = {
          data:[],
          icon:'contacts'
        }
        contacts.forEach(licence => {
          processedSupport['contacts'].data.push(licence)
        })
      }
      return processedSupport
    },
    // If it's an email address, add mailto:
    checkUrl(url) {
      if (/\S+@\S+\.\S+/.test(url)) {
        return "mailto:" + url;
      }
      return url;
    }
  }
}
</script>
