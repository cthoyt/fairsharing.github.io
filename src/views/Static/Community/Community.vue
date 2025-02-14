<template>
  <main :class="applyCss?'pa-15 mb-10':''">
    <!--  main_title_2 -->
    <!-- eslint-disable vue/no-v-html -->
    <h1 class="mb-5">
      FAIRsharing is a community-driven resource with users and collaborators across all disciplines.
      We work together with our stakeholders to enable the <a
        href="https://www.nature.com/articles/sdata201618"
        target="_blank"
        class="underline-effect"
      >FAIR Principles</a> by promoting the value and the use of standards,
      databases and policies.
    </h1>

    <p class="text-h5">
      How to cite us: use the DOI for the <a
        href="https://doi.org/10.25504/FAIRsharing.2abjs5"
        target="_blank"
        class="underline-effect"
      >FAIRsharing record</a>, or our <a
        href="https://doi.org/10.1038/s41587-019-0080-8"
        target="_blank"
        class="underline-effect"
      >publication.</a>
    </p>

    <!-- Adopters, activities, Governance tabs-->
    <v-container class="my-10">
      <v-row
        class="block-category"
      >
        <v-col
          v-for="(tab,index) in contentTabs"
          :key="tab.name+'_'+index"
          cols="12"
          sm="12"
          md="4"
          lg="4"
        >
          <v-card
            class="mx-auto block-category__card cursor-pointer"
            max-width="350"
            height="300"
            @click="jumpToAnchor(tab.name.toLowerCase())"
          >
            <div class="white--text d-flex flex-column justify-center block-category__card__gradient">
              <div
                style="height: 136px"
                class="d-flex justify-center"
              >
                <v-icon
                  size="80"
                  color="white"
                  style="opacity: .7"
                >
                  {{ $vuetify.icons.values[tab.icon].icon }}
                </v-icon>
              </div>
              <v-card-title class="d-inline text-h4 text-center text-md-h5 text-lg-h4">
                {{ tab.name }}
              </v-card-title>
            </div>
            <v-card-text
              class="text--primary text-justify"
            >
              <p class="text-center">
                {{ tab.description }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Adopters   -->
    <section id="adopters">
      <h3 class="text-h3 mb-4 mt-5">
        Adopters
      </h3>

      <p>
        A broad range of <a href="/stakeholders">stakeholders</a> come to FAIRsharing from across all research domains.
        However, adopters use FAIRsharing specifically to do one or more of the following:
      </p>

      <ol type="i">
        <li>
          Educate their users/community on the variety of existing standards, repositories and policies that exist in
          FAIRsharing and actively encourage them to submit/claim records, where relevant;
        </li>
        <li>
          Recommend resources by registering their data policy, and then link it to standards and/or databases
          <a href="/search?page=1&isRecommended=true">recommended</a> in the policy;
        </li>
        <li>
          Create a <a href="/collections">Collection</a> that pulls together a list of standards and/or databases
          around a given domain of interest relevant to them.
        </li>
      </ol>

      <p>
        Adopters are generally representatives of institutions, libraries, journal publishers, infrastructure
        programmes, societies and other organisations or projects that in turn serve and guide individual
        researchers or other stakeholders on research data management matters. Adopters display a FAIRsharing logo
        on their websites with a link from their website to our homepage.
      </p>

      <p>
        In general, our adopters fall into the following broad categories. If you don't see your project on the
        list of adopters, please <a href="mailto:contact@fairsharing.org">get in touch</a>.
      </p>

      <div class="text-center">
        <v-btn
          class="ma-2 text-white"
        >
          <router-link
            v-scroll-to="'#funders'"
            to="#"
            text-color="white"
          >
            Funders
          </router-link>
        </v-btn>
        <v-btn
          class="ma-2 text-white"
        >
          <router-link
            v-scroll-to="'#publishers'"
            to="#"
            text-color="white"
          >
            Publishers
          </router-link>
        </v-btn>
        <v-btn
          class="ma-2 text-white"
        >
          <router-link
            v-scroll-to="'#publishers'"
            to="#"
            text-color="white"
          >
            Organisations
          </router-link>
        </v-btn>
        <v-btn
          class="ma-2 text-white"
        >
          <router-link
            v-scroll-to="'#tools'"
            to="#"
            text-color="white"
          >
            Tools
          </router-link>
        </v-btn>
      </div>

      <h4 class="text-h4 mb-4 mt-5 pt-10">
        Funders
      </h4>

      <p
        id="funders"
        :class="['mb-0 mt-10 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
      >
        A selection of official reports from funders and other organisations that recommend the use of FAIRsharing as a key asset for all stakeholders to enable FAIR data:
      </p>

      <!--  External Links  -->
      <v-row
        class="my-2"
      >
        <v-col
          v-for="(item,index) in externalLinks"
          :key="index+'_'+item.titleLink"
          cols="12"
          md="12"
          lg="4"
          :class="['pa-5 links',{'max-width-32-percent':$vuetify.breakpoint.mdAndUp}]"
        >
          <a
            :href="item.titleLink"
            target="_blank"
          >
            <p
              :class="['mb-0 lato-font-medium lato-text-sm underline-effect',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
            >
              {{ item.title }}
            </p>
          </a>
          <i
            :class="['mb-0 word-break lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
            v-html="$sanitize(item.text)"
          />
        </v-col>
      </v-row>

      <h4 class="text-h4 mb-4 mt-5 pt-10">
        Publishers
      </h4>

      <p
        id="publishers"
        :class="['mb-0 mt-10 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
      >
        A selection of the publishers that use FAIRsharing to define and refine their data policies:
      </p>

      <!--Adopter table-->
      <v-row
        class="mt-2 ml-0"
      >
        <v-col
          v-for="(item,index) in tables.adopterTable.data"
          :key="index+'_'+item.adopter"
          cols="12"
          md="12"
          lg="4"
          :class="['pa-5 links',{'max-width-32-percent':$vuetify.breakpoint.mdAndUp}]"
        >
          <v-img
            v-if="item.image"
            max-width="250px"
            max-height="250px"
            :src="item.image"
            height="120"
            contain
            style="filter: grayscale(1);"
          />
        </v-col>
      </v-row>

      <h4 class="text-h4 mt-5 pt-10">
        Other Organisations
      </h4>
      <p
        id="organisations"
        :class="['mb-0 mt-10 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
      >
        Some other organisations using FAIRsharing.
      </p>
      <v-row
        class="mt-2 ml-0"
      >
        <v-col
          v-for="(item,index) in tables.globalOrganisationTable.data"
          :key="`${item.adopter}_${index}`"
          :class="['pa-5 links full-width',{'max-width-24-percent':$vuetify.breakpoint.mdAndUp}]"
          cols="12"
          md="12"
          lg="4"
        >
          <v-img
            v-if="item.image"
            max-width="250px"
            max-height="250px"
            :src="item.image"
            height="120"
            contain
            style="filter: grayscale(1);"
          />
        </v-col>
      </v-row>
    </section>

    <!--  new tools section  -->
    <h4 class="text-h4 mt-5 pt-10">
      Tools
    </h4>
    <p
      v-if="tables.toolsTable.data.length"
      id="tools"
      :class="['mb-0 mt-10 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
    >
      Tools that make use of FAIRsharing content. If you would like your tool included in this list, please use
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSdl1lKj9xlgN5Od_LyqWfnqBl-8aOLXhdFQa2nfm5CBmZ1TgQ/viewform?usp=sf_link"
        target="_blank"
      >this form</a>
      to let us know how you're using FAIRsharing.
    </p>

    <!-- Tools table begins -->
    <v-row
      v-if="tables.toolsTable.data.length"
      dense
    >
      <v-col
        v-for="tool in tables.toolsTable.data"
        :key="tool.id"
        cols="12"
        sm="12"
        md="4"
        lg="3"
        xl="2"
      >
        <v-card
          class="full-width"
        >
          <v-img
            :src="tool.logo ? `/assets/Community/tools/${tool.logo}` : '/assets/Community/tools/toolplaceholder.png'"
            class="white--text align-end"
            gradient="to top, rgba(0, 0, 0, 0.9), rgba(255, 255, 255, 0.9)"
            cover
            aspect-ratio="1"
          >
            <v-card-title>
              <h4 style="word-break: initial">
                <a :href="tool.homepage">
                  {{ tool.name }}
                </a>
              </h4>
            </v-card-title>
            <v-card-subtitle
              v-if="tool.description"
            >
              {{ tool.description }}
            </v-card-subtitle>
          </v-img>

          <v-card-text
            class="text--primary"
            style="height: 100%"
            :style="$vuetify.breakpoint.xl ? 'height: 255px': $vuetify.breakpoint.mdAndUp ? 'height: 285px' : 'height: 100%'"
          >
            <div v-if="tool.organisations && tool.organisations.length">
              Organisation :
              <span
                v-for="(org, i) in tool.organisations"
                :key="org.id"
              >
                <v-tooltip
                  v-if="org.tooltip"
                  bottom
                >
                  <template #activator="{ on }">
                    <a
                      :href="`/organisations/${org.id}`"
                      class="d-inline-block"
                      v-on="on"
                    >{{ org.name }}
                    </a>
                  </template>
                  <span>{{ org.tooltip }}</span>
                </v-tooltip>
                <a
                  v-else
                  :href="`/organisations/${org.id}`"
                  class="d-inline-block"
                >{{ org.name }}
                </a>
                <span v-if="i+1 < tool.organisations.length">, </span>
              </span>
            </div>
            <div v-if="tool.status">
              Status: {{ tool.status }}
            </div>
            <div v-if="tool.contacts && tool.contacts.length">
              Contacts:<br>
              <span
                v-for="(contact) in tool.contacts"
                :key="contact.id"
              >
                <v-chip
                  class="ma-2"
                  x-small
                >
                  <a :href="contact.url">{{ contact.name }}</a>
                </v-chip>
              </span>
            </div>
            <div v-if="tool.methods && tool.methods.length">
              Methods of using FAIRsharing:<br>
              <span
                v-for="(method) in tool.methods"
                :key="tool.name + method"
              >
                <v-chip
                  class="ma-2"
                  x-small
                >
                  {{ method }}
                </v-chip>
              </span>
            </div>
            <div v-if="tool.types && tool.types.length">
              Type of resource:<br>
              <span
                v-for="(type) in tool.types"
                :key="tool.name + type"
              >
                <v-chip
                  class="ma-2"
                  x-small
                >
                  {{ type }}
                </v-chip>
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- Tools table ends -->


    <!-- Activities   -->
    <section id="activities">
      <h3 class="text-h4 my-4">
        Activities
      </h3>
      <p
        :class="['mb-2 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
      >
        FAIRsharing is not just a registry. The team behind FAIRsharing is involved in a number of FAIR-enabling activities, delivering guidance, tools and services with and for a variety of stakeholders. As these activities mature, we will implement or connect them in/to the FAIRsharing resource itself.
      </p>
      <p
        :class="['mb-2 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
      >
        Some of these activities are part of funded projects and of national or international consortia, while others are volunteer efforts that fall under a variety of umbrella organisations, such as working groups (WG) and learned societies.
      </p>
      <b
        :class="['mb-2 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
      >
        Our activities are classified using the three GO-FAIR pillar structures (change, build, train) and are outlined here.
      </b>
      <!--Activities table-->
      <ActivitiesStaticTable class="mb-16 mt-2" />
    </section>


    <!-- Governance   -->
    <section id="governance">
      <h3 class="text-h4 mb-4">
        Governance
      </h3>
      <!--   Meet the team   -->
      <h4 class="text-h5 mb-2">
        {{ meettheteam.title }}
      </h4>
      <p
        :class="['mb-5 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
        v-html="$sanitize(meettheteam.description)"
      />
      <ul class="d-flex flex-wrap pl-0">
        <li
          v-for="(profileItem,index) in meettheteam.profiles"
          :key="`${profileItem}_${index}`"
          :class="['text-center width-250 height-400 mb-10',$vuetify.breakpoint.mdAndDown?'mx-auto':'']"
        >
          <v-avatar size="160">
            <v-img
              :src="profileItem.profileImg"
              style="filter: grayscale(1);"
            />
          </v-avatar>
          <p
            class="text-center primary--text lato-font-bold mt-2 ma-0"
            style="font-size: 1.5rem;min-height: 80px;display: flex;flex-direction: column;"
            v-html="$sanitize(profileItem.name)"
          />
          <i class="small d-block height-75">
            {{ profileItem.role }}
          </i>
          <div class="text-center mt-2 d-flex justify-center">
            <span
              v-for="(socialItem,socialIndex) in profileItem.social"
              :key="`${socialItem}_${socialIndex}`"
            >
              <a
                class="pr-2"
                :href="socialItem.link.includes('@')?`mailto:${socialItem.link}`:socialItem.link"
                target="_blank"
              >
                <Icon
                  class="mr-1"
                  :item="socialItem.icon"
                  :height="25"
                  size="30"
                  wrapper-class=""
                />
              </a>
            </span>
          </div>
        </li>
      </ul>
      <!--  Advisory Board   -->
      <div
        v-for="(governanceItem,key,index) in governance"
        :key="Object.keys(governanceItem)[index]+'_'+'index'"
      >
        <div class="mb-10">
          <h4 class="text-h5 mb-8">
            {{ key }}
          </h4>
          <div
            v-for="(item,itemIndex) in governanceItem"
            :key="item.title+'_'+itemIndex"
            class="ml-8"
          >
            <div class="mb-5">
              <h4 class="text-h5">
                {{ item.title }}
              </h4>
              <ul :class="['mt-2',{'column-count':$vuetify.breakpoint.mdAndUp}]">
                <li
                  v-for="(itemData,itemDataIndex) in item.data"
                  :key="itemData+'_'+itemDataIndex"
                  :class="['mb-1',{'d-flex':isArray(itemData)===true && $vuetify.breakpoint.lgAndUp}]"
                >
                  <div
                    v-if="!isArray(itemData)"
                    class="d-flex mb-2"
                  >
                    <p
                      class="ma-0"
                      v-html="$sanitize(itemData.text)"
                    />
                    <a
                      class="ml-2 pr-2"
                      :href="itemData.link.toString().includes('@')?`mailto:${itemData.link}`:itemData.link"
                      target="_blank"
                    >
                      <Icon
                        class="mr-1"
                        item="Orcid"
                        :height="25"
                        size="30"
                        wrapper-class=""
                      />
                    </a>
                  </div>
                  <div
                    v-for="(itemDataArray,itemDataArrayIndex) in itemData"
                    v-else
                    :key="itemDataArray.link+'_'+itemDataArrayIndex"
                    class="d-flex mb-2"
                  >
                    <p
                      class="ma-0"
                      v-html="$sanitize(itemDataArray.text)"
                    />
                    <a
                      class="ml-2 pr-2"
                      :href="itemDataArray.link.toString().includes('@')?`mailto:${itemDataArray.link}`:itemDataArray.link"
                      target="_blank"
                    >
                      <Icon
                        class="mr-1"
                        item="Orcid"
                        :height="25"
                        size="30"
                        wrapper-class=""
                      />
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <!--   RDA FAIRsharing WG    -->
      <h4 class="text-h5 mb-2">
        {{ rda.title }}
      </h4>
      <p
        :class="['mb-5 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
        v-html="$sanitize(rda.description)"
      />
      <div
        v-for="(item,itemIndex) in rda.subsections"
        :key="item.title+'_'+itemIndex"
        class="ml-8"
      >
        <div class="mb-5">
          <h4 class="text-h5">
            {{ item.title }}
          </h4>
          <div
            v-if="isArray(item.data)"
          >
            <ul :class="['mt-2',{'column-count':$vuetify.breakpoint.mdAndUp}]">
              <li
                v-for="(itemData,itemDataIndex) in item.data"
                :key="itemData+'_'+itemDataIndex"
                :class="['mb-1',{'d-flex': $vuetify.breakpoint.lgAndUp}]"
              >
                <div
                  class="d-flex mb-2"
                >
                  <p
                    class="ma-0"
                    v-html="$sanitize(itemData.text)"
                  />
                  <a
                    v-if="itemData.link"
                    class="ml-2 pr-2"
                    :href="itemData.link.toString().includes('@')?`mailto:${itemData.link}`:itemData.link"
                    target="_blank"
                  >
                    <Icon
                      class="mr-1"
                      item="Orcid"
                      :height="25"
                      size="30"
                      wrapper-class=""
                    />
                  </a>
                </div>
              </li>
            </ul>
          </div>
          <div v-else>
            <p
              :class="['mb-5 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
              v-html="$sanitize(item.data)"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- eslint-enable vue/no-v-html -->
  </main>
</template>

<script>
/**
* All static pages will be handle through this namespace
* @namespace Static
*/
import ActivitiesStaticTable from "@/components/Static/Community/ActivitiesStaticTable";
import {externalLinks, contentTabs, tables, governance, meettheteam, rda} from "@/data/communityPageData.json"
import Icon from "@/components/Icon";
import {isArray} from "lodash";
/** This component handles the sign-up/register page
* @memberOf Static
* @name Community
* @type module
* @instance
* */
export default {
  name: "Community",
  components: {Icon, ActivitiesStaticTable},
  title: "This will be the community page",
  data: () => {
    return {
      applyCss: false,
      currentAnchor:'',
      externalLinks,
      contentTabs,
      tables,
      governance,
      meettheteam,
      Icon,
      rda
    }
  },
  watch: {
    $route: {
      deep:true,
      handler() {
        this.applyCss = false
        this.$nextTick(() => {
          this.applyCss = true
        })
      }
    }
  },
  created() {
    this.$nextTick(() => {
      // update the UI padding and margin after DOM is fully loaded.
      this.applyCss = true
    })
  },
  methods: {
    jumpToAnchor(selectedAnchor) {
      if (selectedAnchor !== this.currentAnchor) {
        this.$router.push({hash: `${selectedAnchor}`});
        this.currentAnchor = selectedAnchor;
      }
    },
    isArray(input){
      return isArray(input)
    }
  }
}
</script>

<style scoped lang="scss">
.links {
  border: 1px #d4d4d4 solid;
  margin: 2px;
}

.block-category {
  &__card {
    transition: all .2ms ease;
    -webkit-transition: all .2s ease;
    -moz-transition: all .2s ease;
    -o-transition: all .2s ease;
    box-shadow: 0 1rem 2rem rgba(black, .15) !important;
    -webkit-box-shadow: 0 1rem 2rem rgba(black, .15) !important;
    -moz-box-shadow: 0 1rem 2rem rgba(black, .15) !important;
    -o-box-shadow: 0 1rem 2rem rgba(black, .15) !important;

    &:hover {
      transform: scale(1.05);
      -moz-transform: scale(1.05);
      -webkit-transform: scale(1.05);
      -o-transform: scale(1.05);
    }

    &__gradient {
      height: 200px;
      background: rgb(171, 171, 171);
      background: linear-gradient(50deg, rgb(204, 204, 204) 0%, rgb(135, 135, 135) 100%);
      background: -webkit-linear-gradient(50deg, rgb(204, 204, 204) 0%, rgb(135, 135, 135) 100%);
      background: -o-linear-gradient(50deg, rgb(204, 204, 204) 0%, rgb(135, 135, 135) 100%);
      background: -ms-linear-gradient(50deg, rgb(204, 204, 204) 0%, rgb(135, 135, 135) 100%);
    }
  }
}

.v-divider {
  margin: 8px;
}

.border-bottom {
  border-bottom: 1px solid #ECF0F1 !important;
}

.border-left {
  border-left: 1px solid #ECF0F1 !important;
}

a:hover {
  div {
    transform: scale(1.1);
    -moz-transform: scale(1.1);
    -webkit-transform: scale(1.1);
    -o-transform: scale(1.1);
  }
}
td {
  font-size: 1rem!important;
}

.column-count {
  column-count:2;
  -moz-column-count: 2;
  -webkit-column-count: 2;
}

.word-break {
  white-space: break-spaces;
}

</style>
