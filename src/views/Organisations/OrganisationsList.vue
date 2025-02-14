<template>
  <v-container class="my-10">
    <v-card>
      <v-card-title>
        Organisations List
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          outlined
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="organisations"
        :search="search"
        :loading="loading"
        loading-text="Loading... Please wait"
        :class="{'data-table-mobile': $vuetify.breakpoint.xs}"
        :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50]}"
      >
        <template #[`item.name`]="{ item }">
          <router-link
            :to="`/organisations/${item.id}`"
          >
            {{ item.name }}
          </router-link>
        </template>
        <template #[`item.types`]="{ item }">
          {{ item.types.join(', ') }}
        </template>
        <template #[`item.homepage`]="{ item }">
          <a
            target="_blank"
            class="underline-effect"
            :href="item.homepage"
          >
            {{ item.homepage }}
          </a>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import GraphClient from "@/lib/GraphClient/GraphClient.js";
import getAllOrganisationsQuery from "@/lib/GraphClient/queries/getAllOrganisations.json";

let graphClient = new GraphClient();
export default {
  name: "OrganisationsList",

  data() {
    return {
      search: '',
      headers: [
        {
          text: "Name",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "Types", value: "types", sortable: false },
        { text: "Homepage", value: "homepage", sortable: false },
      ],
      loading: false,
      organisations: [],
    };
  },

  async mounted() {
    this.loading = true;
    await this.getOrganisationsList();
    this.loading = false;
  },

  methods: {
    async getOrganisationsList() {
      const organisationsList = await graphClient.executeQuery(
        getAllOrganisationsQuery
      );

      this.organisations = organisationsList.allOrganisations;
    },
  },
};
</script>

<style scoped>
.data-table-mobile >>> .v-data-table__mobile-row {
  display: grid;
  grid-template-columns: 1fr 228px;
  font-size: 0.775rem;
  height: auto;
}
</style>
