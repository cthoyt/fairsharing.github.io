import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import searchCollection from "@/components/Records/Record/CollectionRecord/SearchCollection"
import Vuetify from "vuetify"
import records from "@/store/recordSearch";
import record from "@/store/recordData";
import introspection from "@/store/introspector";
import uiController from "@/store/uiController";
import Client from "@/lib/GraphClient/GraphClient";
import Record from "@/store/recordData";
import sinon from "sinon";
import fakeIntrospection from "../../../../../fixtures/fakeIntrospection.json";

const localVue = createLocalVue();
localVue.use(Vuex);
const vuetify = new Vuetify();

const $route = {
    name: "Record",
    path: "/3449",
    query: {}
};

const $store = new Vuex.Store({
    modules: {
        record: record,
        records: records,
        introspection: introspection,
        uiController: uiController
    },
});


Record.state.currentRecord["fairsharingRecord"] = {
    name:"EOSC-Life",
    recordAssociations: [
        {
            linkedRecord: {
                id: 1,
                name: "a name",
                registry: "Standard",
                type: "terminology_artifact"
            },
            recordAssocLabel: "collects"
        },
        {
            linkedRecord: {
                id: 3,
                name: "a name 3",
                registry: "Database",
                type: "journal"
            },
            recordAssocLabel: "collects"
        },
        {
            linkedRecord: {
                id: 4,
                name: "a name 4",
                registry: "Collection",
                type: "collection"
            },
            recordAssocLabel: "collects"
        }
    ],
    reverseRecordAssociations: [
        {
            linkedRecord: {
                id: 2,
                name: "b name",
                registry: "Policy",
                type: "repository"
            },
            recordAssocLabel: "related to"
        }
    ],
    registry:'Collection'
};

describe("SearchCollection.vue", function(){

    let wrapper;
    let stub = sinon.stub(Client.prototype, "executeQuery");

    beforeAll(() => {
         stub.withArgs(sinon.match.object).returns({searchFairsharingRecords: {records: [{name:'name A'}]}});
    });

    afterAll(() => {
        Client.prototype.executeQuery.restore();
    });

    beforeEach(async () => {
        wrapper = await shallowMount(searchCollection, {
            mocks: {$route, $store},
            localVue,
            vuetify
        });
    });

    it("can be instantiated", () => {
        expect(wrapper.name()).toMatch("SearchCollection");
    });


    it("can check changeListType function", () => {
        wrapper.vm.changeListType(true);
        expect(wrapper.vm.isColumnList).toBe(true);
    });

    it("can react to router changes", () => {
        const wrapper2 = shallowMount(searchCollection, {
            mocks: {$route, $store},
            vuetify,
            localVue
        });
        wrapper2.vm.$route.query = {fairsharingRegistry: "Collection",page:"2"};
        expect(wrapper2.vm.currentPath).toStrictEqual(["Collection", {"fairsharingRegistry": "Collection",page:"2"}]);
        wrapper.vm.$route.query = {fairsharingRegistry: ''};
        expect(wrapper.vm.currentPath).toStrictEqual(["Collection", {}]);
    });

    it("can check mounted life cycle properly loads data", async () => {
        $route.query = {
            "page": "2",
        };
        let returnedVal = {
            data: {
                data: fakeIntrospection.data
            },
            headers: {
                maintenance: "false"
            }
        };
        sinon.stub(Client.prototype, "getData").withArgs(sinon.match.any).returns(returnedVal);
        await wrapper.vm.$store.dispatch("introspection/fetchParameters");
        Client.prototype.getData.restore();

        console.log('query before ',wrapper.vm.$route.query);
        console.log('currentPath before ',wrapper.vm.currentPath);
        const queryParameters = await wrapper.vm.$store.getters["introspection/buildQueryParameters"](wrapper.vm.currentPath);
        console.log('aa',queryParameters);
        expect(queryParameters).toStrictEqual({
            fairsharingRegistry: "Collection",
            page:"2"
        })
    });


    it("can reset the records store when destroyed", () => {
        wrapper.destroy();
        expect(wrapper.vm.$store.state.records.facets).toStrictEqual([]);
        expect(wrapper.vm.$store.state.records.records).toStrictEqual([]);
        expect(wrapper.vm.$store.state.records.loading).toBe(false);
        const otherStates = ["hits","totalPages","perPage"]
        otherStates.forEach(state => {
            expect(wrapper.vm.$store.state.records[state]).toBe(null)
        })
    });

});
