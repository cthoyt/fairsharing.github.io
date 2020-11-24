import { createLocalVue, shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import Vuetify from "vuetify"
import recordStore from "@/store/record.js";
import userStore from "@/store/users.js";
import GraphClient from "@/components/GraphClient/GraphClient.js";
import RestClient from "@/components/Client/RESTClient.js";
import getTypesQuery from "@/components/GraphClient/queries/Organisations/getOrganisationTypes.json";
import getOrganisationsQuery from "@/components/GraphClient/queries/Organisations/getOrganisations.json";
import getGrantsQuery from "@/components/GraphClient/queries/Organisations/getGrants.json";
import editOrganisations from "@/components/Editor/EditOrganisations.vue"
const sinon = require("sinon");

const localVue = createLocalVue();
localVue.use(Vuex);
const vuetify = new Vuetify();

recordStore.state.currentRecord = {
    fairsharingRecord: {
        organisationLinks: [
            {
                organisation: null,
                grant: null,
                relation: null
            }
        ]
    }
};
userStore.state.user().credentials.token = "thisisatoken";
const $store = new Vuex.Store({
    modules: {
        users: userStore,
        record: recordStore
    }
});

let graphStub;
let restStub;

describe("EditOrganisations.vue", function() {

    let wrapper;
    beforeEach(async() => {
        graphStub = sinon.stub(GraphClient.prototype, "executeQuery");
        graphStub.withArgs(getTypesQuery).returns({
            "searchOrganisationTypes": [
                {
                    name: "type1",
                    id: "type1ID"
                }
            ]
        });
        graphStub.withArgs(getOrganisationsQuery).returns({
            "searchOrganisations": [
                {
                    name: "orga1",
                    id: "orga1ID"
                }
            ]
        });
        graphStub.withArgs(getGrantsQuery).returns({
            "searchGrants": [
                {
                    name: "grant1",
                    id: "grant1ID"
                }
            ]
        });
        wrapper = await shallowMount(editOrganisations, {
            localVue,
            vuetify,
            mocks: {$store}
        });
    });

    afterEach(() => { graphStub.restore() });

    it("can be mounted", () => {
        expect(wrapper.name()).toMatch("EditOrganisations");
        expect(wrapper.vm.currentOrganisations).toStrictEqual([
            {
                organisation: null,
                grant: null,
                relation: null
            }
        ]);
        expect(wrapper.vm.initialOrganisations).toStrictEqual([
            {
                organisation: null,
                grant: null,
                relation: null
            }
        ]);
        expect(wrapper.vm.existingOrganisations).toStrictEqual([
            {
                name: "orga1",
                id: "orga1ID"
            }
        ]);
        expect(wrapper.vm.organisationTypes).toStrictEqual([
            {
                name: "type1",
                id: "type1ID"
            }
        ]);
        expect(wrapper.vm.grants).toStrictEqual([
            {
                name: "grant1",
                id: "grant1ID"
            }
        ])
    });

    it("can add & remove relations", () => {
        wrapper.vm.addRelationship();
        expect(wrapper.vm.currentOrganisations).toStrictEqual([
            {
                organisation: null,
                grant: null,
                relation: null
            },
            {
                organisation: {},
                grant: {},
                funds: null
            }
        ]);
        wrapper.vm.removeRelationship(wrapper.vm.currentOrganisations.length - 1);
        expect(wrapper.vm.currentOrganisations).toStrictEqual([
            {
                organisation: null,
                grant: null,
                relation: null
            }
        ]);
    });

    it("can open the new organisation menu", () => {
        wrapper.vm.openOrganisationMenu(0, "abcdef");
        expect(wrapper.vm.menus.target).toBe(0);
        expect(wrapper.vm.menus.visibility.newOrganisation).toBe(true);
        expect(wrapper.vm.logoData).toStrictEqual({
            filename: null,
            data: null,
            content_type: null
        });
        expect(wrapper.vm.menus.data).toStrictEqual({
            name: "abcdef",
            homepage: null,
            organisation_type_ids: null,
            logo: null,
            alternativeNames: null
        });
    });

    it("can open the new grant menu", () => {
        wrapper.vm.openGrantMenu(0, "abc");
        expect(wrapper.vm.menus.errors.newGrant).toBe(false);
        expect(wrapper.vm.menus.visibility.newGrant).toBe(true);
        expect(wrapper.vm.menus.target).toBe(0);
        expect(wrapper.vm.menus.data).toStrictEqual({
            name: "abc",
            description: null
        });
    });

    it("can create a new organisation", async() => {
        // Without a logo & without alternativeNames
        let organisation = {
            id: "123",
            name: "Hello",
            homepage: "https://example.com",
            alternative_names: ["abc"],
            url_for_logo: "/example.jpg"
        };
        restStub = sinon.stub(RestClient.prototype, "executeQuery");
        restStub.returns({
           data: organisation
        });
        wrapper.vm.menus.data = {
           organisation_type_ids: [{
               name: "type1"
           }]
       };
        wrapper.vm.menus.target = 0;
        await wrapper.vm.createNewOrganisation();
        // With a logo & with alternativeNames
        wrapper.vm.logoData.data = "data:image/png;base64,TEST123";
        wrapper.vm.menus.data = {
            organisation_type_ids: [{
                name: "type1"
            }],
            alternativeNames: "abc,def"
        };
        await wrapper.vm.createNewOrganisation();
        // expect statements should be the same for both are we are mocking the API call
        expect(wrapper.vm.currentOrganisations[0].organisation).toStrictEqual({
            id: organisation.id,
            name: organisation.name,
            homepage: organisation.homepage,
            types: ["type1"],
            alternativeNames: organisation.alternative_names,
            urlForLogo: organisation.url_for_logo
        });
        expect(wrapper.vm.existingOrganisations[1]).toStrictEqual({
            id: organisation.id,
            name: organisation.name,
            homepage: organisation.homepage,
            types: ["type1"],
            alternativeNames: organisation.alternative_names,
            urlForLogo: organisation.url_for_logo
        });
        restStub.restore();

        // Now processing errors
        restStub = sinon.stub(RestClient.prototype, "executeQuery");
        restStub.returns({
            data: {
                error: {response: {data: "error message"}}
            }
        });
        await wrapper.vm.createNewOrganisation();
        expect(wrapper.vm.menus.errors.newOrganisation).toStrictEqual({response: {data: "error message"}});
        restStub.restore();
    });

    it("can create a new grant", async() => {
        let grant = {
            name: "abc",
            description: "description",
            id: "abcID"
        };
        restStub = sinon.stub(RestClient.prototype, "executeQuery");
        restStub.returns({
            data: grant
        });
        wrapper.vm.menus.data = {};
        wrapper.vm.menus.target = 0;
        await wrapper.vm.createNewGrant();
        expect(wrapper.vm.currentOrganisations[0].grant).toStrictEqual(grant);
        expect(wrapper.vm.grants[1]).toStrictEqual(grant);
        restStub.restore();

        // Now processing errors
        restStub = sinon.stub(RestClient.prototype, "executeQuery");
        restStub.returns({
            data: {
                error: {response: {data: "error message"}}
            }
        });
        await wrapper.vm.createNewGrant();
        expect(wrapper.vm.menus.errors.newGrant).toStrictEqual({response: {data: "error message"}});
        restStub.restore();
    });

    it("can watch changes to the logo and encode it to a string as a reaction", () => {
        const fileContents       = 'data:image/png;base64,TEST1';
        const readAsDataURL      = jest.fn();
        const addEventListener   = jest.fn((_, evtHandler) => { evtHandler({
            target: {result: fileContents}} )});
        const dummyFileReader    = {addEventListener, readAsDataURL, result: fileContents};
        window.FileReader        = jest.fn(() => dummyFileReader);
        wrapper.vm.menus.data = {logo: {value: "123"}};
        expect(wrapper.vm.logoData.data).toBe("data:image/png;base64,TEST1");
    });

    it("can watch the current record in the store and reload the data as a reaction", () => {
        wrapper.vm.currentRecord.fairsharingRecord = {
            organisationLinks: [
                {
                    organisation: null,
                    grant: null,
                    relation: "funds"
                }
            ]
        };
        expect(wrapper.vm.currentOrganisations).toStrictEqual([
            {
                organisation: null,
                grant: null,
                relation: "funds"
            }
        ])
    });

    it("can create a new organisation link", async () => {});

});

