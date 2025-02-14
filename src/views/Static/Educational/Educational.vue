<template>
  <main :class="applyCss?'pa-15 mb-10':''">
    <!-- hard-coded part -->
    <!--  title  -->
    <h1 class="text-h5 text-xl-h4 mb-2 mb-xl-6">
      Educational
    </h1>
    <!--  subtitle  -->
    <p
      :class="['mb-4 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
    >
      Across the research disciplines there are thousands of standards and several thousand databases, designed to assist the virtuous data cycle, from collection to annotation, through preservation and publication to subsequent sharing and reuse. As consumers of these standards and databases, it is often difficult to know which resources are the most relevant for your specific domain and needs. As producers, you want to be sure your standard or database is findable by prospective users, and recommended in data policies by funders, journals and other organisations.
    </p>
    <p
      :class="['mb-4 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
    >
      With our growing and interlinked content, functionalities and endorsements, FAIRsharing is the most comprehensive informative and educational resource of standards, databases and data policies and is here to help you!
    </p>
    <p
      :class="['mb-4 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
    >
      The FAIRsharing team works with and for the community to map the landscape of community-developed standards and to define the indicators necessary to monitor their:
    </p>
    <ul class="hardcoded-ul">
      <li>development, evolution and integration;</li>
      <li>implementation and use in databases; and</li>
      <li>adoption in data policies by funders, journals and other organisations.</li>
    </ul>
    <p
      :class="['mb-4 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
    >
      Whether you are a researcher, standard/database developer, funder, journal editor, librarian or data manager, FAIRsharing can help you understand which standards are mature and appropriate to your use case. By mapping the relationships between standards and the databases that implement them, or the policies that recommend them, FAIRsharing enables you to make an informed decision as to which standard or database to use or endorse.
    </p>
    <div class="d-flex justify-center">
      <img
        src="/assets/Educational/educational.svg"
        alt="educational"
        :width="$vuetify.breakpoint.lgAndDown?'70%':'60%'"
      >
    </div>
    <p
      :class="['mb-4 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
    >
      FAIRsharing is a web-based, searchable portal of three interlinked registries, containing both in-house and crowd-sourced manually curated descriptions of <router-link
        to="/standards"
        class="underline-effect"
      >
        standards
      </router-link>, <router-link
        to="/databases"
        class="underline-effect"
      >
        databases
      </router-link> and data <router-link
        to="/policies"
        class="underline-effect"
      >
        policies
      </router-link>, combined with an integrated view across all three types of <router-link
        to="/search"
        class="underline-effect"
      >
        resource
      </router-link>. By registering your resource on FAIRsharing, you not only gain credit for your work, but you increase its visibility outside of your direct domain, so reducing the potential for unnecessary reinvention and proliferation of standards and databases.
    </p>
    <p
      :class="['mb-4 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
    >
      However, if you still cannot find what you are looking for, please <a
        href="mailto:contact@fairsharing.org"
        class="underline-effect"
      >email</a> us with your question and we will add it to this page.
    </p>
    <!-- dynamic part loading from JSON   -->
    <ul class="ul-no-padding">
      <li
        v-for="(educationItem,key,index) in education"
        :key="key+'_'+index"
      >
        <h2 class="primary--text">
          {{ key }}
        </h2>
        <ul>
          <li
            v-for="(item,title_key,title_index) in educationItem"
            :key="title_key+'_'+title_index"
            class="mb-5"
          >
            <h3 class="text-h5 mb-2">
              {{ title_key }}
            </h3>
            <v-expansion-panels
              v-model="selectedExpansion[title_key]"
              hover
              accordion
              class="my-5"
            >
              <v-expansion-panel
                v-for="(child_item,child_index) in item"
                :key="child_item.title+'_'+child_index"
              >
                <v-expansion-panel-header>
                  <!-- This html is from a safe source -->
                  <!-- eslint-disable vue/no-v-html -->
                  <a :href="`/educational#${child_item.anchorLink}`">
                    <h4
                      :id="child_item.anchorLink"
                      class="text-h6"
                      v-html="$sanitize(child_item.title)"
                    />
                  </a>
                  <!-- This html is from a safe source -->
                  <!-- eslint-disable vue/no-v-html -->
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <p
                    class="ma-0"
                    :class="['mb-2 lato-font-medium lato-text-sm',{'lato-text-md':$vuetify.breakpoint.xlOnly }]"
                    v-html="$sanitize(child_item.desc)"
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </li>
        </ul>
      </li>
    </ul>
  </main>
</template>

<script>
  import {education} from '@/data/EducationData.json'
    export default {
      name: "Educational",
      data: () => {
        return {
          education: education,
          applyCss: false,
          selectedExpansion:{}
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
      async created() {
        let _module = this;
        await _module.$nextTick();
        _module.applyCss = true
        Object.keys(this.education).forEach(item => {
          Object.keys(this.education[item]).forEach(obj => {
            let foundHash = this.education[item][obj].find(it => `#${it.anchorLink}` === this.$route.hash)
            if (foundHash) {
              let arr = Object.keys(this.education[item]).map((ob, index) => {
                return {
                  'index': index,
                  'value': ob.toString().split('.', 1).toString()
                }
              })
              const faqNumber = this.$route.hash.split('-', 1).toString().substr(4, 2)
              let key = Object.keys(this.education[item])[arr.find(item => item.value === faqNumber).index]
              this.selectedExpansion[key] = foundHash.index * 1
            }
          })
        })
        // update the UI padding and margin after DOM is fully loaded.
      }
    }
</script>

<style scoped lang="scss">
li {
  line-height: 1.6;
}

ul,li {
  padding: 0;
}
.hardcoded-ul {
  li::before {
    display: inline-block;
    content: '';
    -webkit-border-radius: 0.375rem;
    border-radius: 0.375rem;
    -moz-border-radius: 0.375rem;
    height: 0.4rem;
    width: 0.4rem;
    margin-right: 0.5rem;
    background-color: black;
  }
}

mark {
  background: lightgrey;
  color: #636363;
  padding: 2px;
}

.ul-no-padding {
  padding: 0;
}

P {
  white-space: break-spaces;
}

.v-expansion-panel-header {
  min-height: 0;
}
</style>
