import GraphClient from "@/lib/GraphClient/GraphClient.js"
import RESTClient from "@/lib/Client/RESTClient.js"
import countriesQuery from "@/lib/GraphClient/queries/getCountries.json"
import typesQuery from "@/lib/GraphClient/queries/getRecordsTypes.json"
import tagsQuery from "@/lib/GraphClient/queries/geTags.json"
import getOrganisationsQuery from "@/lib/GraphClient/queries/Organisations/getOrganisations.json"
import getOrganisationsTypesQuery from "@/lib/GraphClient/queries/Organisations/getOrganisationTypes.json"
import getGrantsQuery from "@/lib/GraphClient/queries/Organisations/getGrants.json"
import getPublicationsQuery from "@/lib/GraphClient/queries/getPublications.json"
import getRecordsQuery from "@/lib/GraphClient/queries/editor/getRecordsSummary.json"
import getLicencesQuery from "@/lib/GraphClient/queries/getLicences.json"
import getDuplicates from "@/lib/GraphClient/queries/getDuplicates.json"
import descriptionData from "@/data/fieldsDescription.json"
import supportLinksTypes from "@/data/SupportLinksTypes.json"
import status from "@/data/status.json"
const graphClient = new GraphClient();
const restClient = new RESTClient();

let editorStore = {
    namespaced: true,
    state: {
        countries: null,
        recordTypes: null,
        status: status.status,
        tooltips: descriptionData.descriptions,
        tags: [],
        years(){
            let years = [];
            let d = new Date();
            let thisYear = d.getFullYear();
            [...Array(100).keys()].forEach(function(year){
                years.push(thisYear - year);
            });
            return years;
        },
        colors: {
            domain: "domain_color",
            taxonomy: "taxonomic_color",
            subject: "subject_color",
            user_defined_tag: "tags_color"
        },
        allTags: false,
        organisations: null,
        organisationsTypes: null,
        organisationsRelations: [
            "maintains",
            "funds",
            "collaborates_on",
            "associated_with",
            "undefined"
        ],
        grants: null,
        availablePublications: [],
        supportLinksTypes: supportLinksTypes,
        availableLicences: [],
        licenceRelations: [
            "undefined",
            "applies_to_content",
            "least_permissive"
        ],
        accessPointTypes: ["REST", "SOAP", "SPARQL", "Other"],
        availableRecords: [],
        possibleDuplicates: [],
        relationsTypes: [],
        allowedFields: {}
    },
    mutations: {
        setCountries(state, countries){
            state.countries = countries;
        },
        setRecordTypes(state, recordTypes){
            state.recordTypes = recordTypes;
        },
        setTags(state, tags){
            state.tags = tags.data;
            if (tags.firstTime){
                state.allTags = tags.data;
            }
        },
        setOrganisations(state, organisations){
            state.organisations = organisations;
        },
        setOrganisationsTypes(state, organisationsTypes){
            state.organisationsTypes = organisationsTypes;
        },
        setGrants(state, grants){
            state.grants = grants;
        },
        setAvailablePublications(state, publications){
            state.availablePublications = publications;
        },
        setAvailableLicences(state, licences){
            state.availableLicences = licences;
        },
        cleanEditorStore(state) {
            state.countries = null;
            state.recordTypes = null;
            state.allTags = [];
            state.tags = [];
            state.organisations = null;
            state.organisationsTypes = null;
            state.grants = null;
            state.availablePublications = [];
            state.possibleDuplicates = [];
        },
        setAvailableRecords(state, records){
            state.availableRecords = records;
        },
        setAvailableRelationsTypes(state, types){
            state.relationsTypes = types;
        },
        setAllowedFields(state, fields){
            state.allowedFields = fields;
        },
        setPossibleDuplicates(state, records) {
            state.possibleDuplicates = records;
        },
        clearPossibleDuplicates(state) {
            state.possibleDuplicates = [];
        }
    },
    actions: {
        async getCountries(state){
            let countries = await graphClient.executeQuery(countriesQuery);
            state.commit("setCountries", countries['searchCountries'])
        },
        async getRecordTypes(state){
            let recordTypes = [];
            let data = await graphClient.executeQuery(typesQuery);
            const size = data['fairsharingRegistries'].records.length;
            let currentItem = 0;
            data['fairsharingRegistries'].records.forEach(function(type){
                currentItem += 1;
                recordTypes.push({
                    header: type.name
                });
                type.recordTypes.forEach(function(subType){
                    recordTypes.push({
                        name: subType.name,
                        group: type.name,
                        id: subType.id,
                        description: subType.description
                    })
                });
                if (currentItem < size) recordTypes.push({ divider: true });
            });
            state.commit("setRecordTypes", recordTypes);
        },
        async getTags(state, queryString){
            let tagQueryCopy = JSON.parse(JSON.stringify(tagsQuery));
            if (queryString) tagQueryCopy.queryParam = {q: queryString};
            let data = await graphClient.executeQuery(tagQueryCopy);
            let first = (!state.state.allTags);
            state.commit("setTags", {data: data['searchTags'], firstTime: first});
        },
        async getOrganisations(state){
            let organisations = await graphClient.executeQuery(getOrganisationsQuery);
            state.commit("setOrganisations", organisations['searchOrganisations'])
        },
        async getOrganisationsTypes(state){
            let organisationsTypes = await graphClient.executeQuery(getOrganisationsTypesQuery);
            state.commit("setOrganisationsTypes", organisationsTypes['searchOrganisationTypes'])
        },
        async getGrants(state){
            let grants = await graphClient.executeQuery(getGrantsQuery);
            state.commit("setGrants", grants['searchGrants'])
        },
        async getAvailablePublications({commit}, publications){
            let pubs = [],
                position = 0;
            let response = await graphClient.executeQuery(getPublicationsQuery);
            response.searchPublications.forEach((pub) => {
                pub.isCitation = false;
                publications.forEach((publication) => {
                    if (pub.id === publication.id){
                        publication.tablePosition = position;
                        pub.tablePosition = position;
                    }
                });
                pubs.push(pub);
                position += 1;
            });
            commit("setAvailablePublications", pubs);
        },
        async getLicences({commit}) {
            let licences = await graphClient.executeQuery(getLicencesQuery);
            commit('setAvailableLicences', licences['searchLicences'])
        },
        async getAvailableRecords({commit}, options){
            getRecordsQuery.queryParam = {perPage: 100};
            if (options.q) getRecordsQuery.queryParam.q = options.q;
            getRecordsQuery.queryParam.fairsharingRegistry = options.fairsharingRegistry;
            getRecordsQuery.queryParam.searchAnd = false;
            getRecordsQuery.queryParam.excludeId = options.excludeId;
            let data = await graphClient.executeQuery(getRecordsQuery);
            commit("setAvailableRecords", data.searchFairsharingRecords.records);
        },
        async getPossibleDuplicates({commit}, options) {
            getDuplicates.queryParam = {fields: options.fields}
            let data = await graphClient.executeQuery(getDuplicates);
            commit("setPossibleDuplicates", data.duplicateCheck);
        },
        async getAvailableRelationsTypes({commit}){
            let types = await restClient.getRelationsTypes();
            let allowed = {};
            let relationTypes = ['standard', 'database', 'policy', 'collection'];
            for (let typeObject of types) {
                let relationName = typeObject.name,
                    id = typeObject.id;
                if (typeObject['allowed_associations'].length > 0) {
                    typeObject['allowed_associations'].forEach(allowed_association => {
                        let relationParent = allowed_association.from;
                        let relationChild = allowed_association.to;
                        /* istanbul ignore if */ if (!Object.keys(allowed).includes(relationParent)) {
                            allowed[relationParent] = [];
                        }
                        allowed[relationParent].push({
                            relation: relationName,
                            target: relationChild,
                            id: id,
                            relationId: typeObject.id
                        });
                    })
                }
                else {
                    relationTypes.forEach(relationParent => {
                        if (!Object.keys(allowed).includes(relationParent)) {
                            allowed[relationParent] = [];
                        }
                        relationTypes.forEach(relationChild => {
                           allowed[relationParent].push({
                               relation: relationName,
                               target: relationChild,
                               id: id,
                               relationId: typeObject.id
                           });
                        });
                    });
                }
            }
            commit("setAvailableRelationsTypes", allowed);
        },
        async getAllowedFields({commit}, options){
            let response = await restClient.extraMetadataFields(
                options.type,
                options.token
            );
            commit('setAllowedFields', response);
        }
    },
    modules: {},
    getters: {
        getPartialTags: (state) => (sections) => {
            let tags = [];
            for (let tag of state.tags){
                if (sections.indexOf(tag.model)> -1){
                    tags.push(tag);
                }
            }
            return tags;
        },
        allowedRelations: (state) => (options) => {
            let output = [];
            state.relationsTypes[options.sourceType].forEach(relation => {
                if ((options.target && options.prohibited) &&
                    (relation.target === options.target.registry || relation.target === options.target.type) &&
                    !options.prohibited.includes(relation.relation)){
                    output.push(relation)
                }
                if (!options.target && !options.prohibited){
                    output.push(relation);
                }
            });
            return output;
        },
        allowedTargets: (state) => (source) => {
            let output = [];
            let allowed = ["standard", "database", "policy", "collection"];
            state.relationsTypes[source.toLowerCase()].forEach(relation => {
                /* istanbul ignore else */
                if (allowed.includes(relation.target)) output.push(relation.target);
            });
            return [...new Set(output)];
        },
    }
};

export default editorStore;
