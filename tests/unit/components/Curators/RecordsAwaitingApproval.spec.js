import { shallowMount, createLocalVue } from "@vue/test-utils"
import RecordsAwaitingApproval from "@/components/Curators/RecordsAwaitingApproval.vue"
import fakeData from "@/../tests/fixtures/curationDashboardRecAwaitApproval.json"
import Client from "@/lib/Client/RESTClient.js"
import Vuex from "vuex"
import recordStore from "@/store/recordData.js"
import sinon from "sinon"
import usersStore from "@/store/users"
import VueRouter from "vue-router"





const localVue = createLocalVue();
localVue.use(Vuex);
usersStore.state.user = function(){ return {
    isLoggedIn: true,
    credentials: {token: 123, username: 123}
}};
recordStore.state.sections = {
    generalInformation: {
        data: {
            countries: [
                {label: 'France', id: 1},
                {label: 'UK', id: 2}
            ],
            metadata: {},
            type: {name: 'test'}
        }
    }
};
const $store = new Vuex.Store({
    modules: {
        record: recordStore,
        users: usersStore
    }
});

const router = new VueRouter();
const $router = { push: jest.fn() };

describe('Curator -> RecordsAwaitingApproval.vue', () => {
    let restStub;
    let wrapper;
    beforeAll( async () => {
        wrapper = await shallowMount(RecordsAwaitingApproval, {
            localVue,
            router,
            mocks: {$store, $router},
            propsData: fakeData.propsData
        });
    });

    it("can be mounted", () => {
        expect(wrapper.name()).toMatch("RecordsAwaitingApproval");
        expect(wrapper.vm.approvalRequiredProcessed.length).toBe(4);
        expect(wrapper.vm.approvalRequiredProcessed[0].recordName).toMatch("Record3 (99)");
    });

    it("can use methods that only change properties", () => {
        wrapper.vm.approveChangesMenu("Record3 (99)", 99,true);
        expect(wrapper.vm.dialogs.recordName).toMatch("Record3 (99)");
        expect(wrapper.vm.dialogs.recordID).toBe(99);
        expect(wrapper.vm.dialogs.recordHidden).toBe(true);
        expect(wrapper.vm.dialogs.approveChanges).toBe(true);
        wrapper.vm.closeApproveChangesMenu ();
        expect(wrapper.vm.dialogs.approveChanges).toBe(false);
        jest.useFakeTimers();
        wrapper.vm.deleteRecordMenu("Record4 (100)", 100);
        jest.advanceTimersByTime(5000);
        expect(wrapper.vm.dialogs.disableDelButton).toBe(false);
        expect(wrapper.vm.dialogs.recordName).toMatch("Record4 (100)");
        expect(wrapper.vm.dialogs.recordID).toBe(100);
        expect(wrapper.vm.dialogs.deleteRecord).toBe(true);
        wrapper.vm.closeDeleteMenu ();
        expect(wrapper.vm.dialogs.deleteRecord).toBe(false);
    });

    it("can update a record", async () => {
      restStub = sinon.stub(Client.prototype, "executeQuery");
      restStub.returns({data: {error: false}});
      await wrapper.vm.saveProcessingNotes(99,"notes of text");
      // TODO: Check that the ProcessingNotes are updated
      restStub.restore();
      restStub = sinon.stub(Client.prototype, 'executeQuery');
      restStub.returns({data: {error: { response: "Im an error"}}});
      await wrapper.vm.saveProcessingNotes(99,"notes of text");
      expect(wrapper.vm.error.recordID).toBe(99);
    });

    it("can assign a curator to a record", async () => {
      restStub.restore();
      restStub = sinon.stub(Client.prototype, "executeQuery");
      restStub.returns({data: {error: false}});
      expect(wrapper.vm.approvalRequiredProcessed[1].curator).toMatch("David Silla");
      await wrapper.vm.assignCurator(100, 1, "Michael Smith");
      expect(wrapper.vm.approvalRequiredProcessed[1].curator).toMatch("Michae");
      await wrapper.vm.assignCurator(100, -1, "none");
      expect(wrapper.vm.approvalRequiredProcessed[1].curator).toMatch("none");
      // TODO: Check that the curator are updated in the record
      restStub.restore();
      restStub = sinon.stub(Client.prototype, 'executeQuery');
      restStub.returns({data: {error: { response: "Im an error"}}});
      await wrapper.vm.assignCurator(100, 1, "Michael Smith");
      expect(wrapper.vm.error.recordID).toBe(100);
    });

    it("can approve a record", async () => {
      //Correct approval
      wrapper.vm.dialogs.recordID = 100;
      restStub.restore();
      restStub = sinon.stub(Client.prototype, "executeQuery");
      restStub.returns({data: {error: false}});
      await wrapper.vm.confirmApproval();
      expect(wrapper.vm.approvalRequiredProcessed.length).toBe(3);
      expect(wrapper.vm.dialogs.approveChanges).toBe(false);
      expect(wrapper.vm.approvalRequiredProcessed[1].id).toBe(101);
      //The element to approvalRequiredProcessed is also in maintenanceRequests
      restStub.restore();
      wrapper.vm.dialogs.recordID = 99;
      restStub = sinon.stub(Client.prototype, "executeQuery");
      restStub.returns({data: {error: false}});
      await wrapper.vm.confirmApproval();
      expect(wrapper.vm.approvalRequiredProcessed.length).toBe(2);
      expect(wrapper.vm.dialogs.approveChanges).toBe(false);
      expect(wrapper.vm.approvalRequiredProcessed[0].id).toBe(101);
      //There is an error in the client query
      restStub.restore();
      wrapper.vm.dialogs.recordID = 101;
      restStub = sinon.stub(Client.prototype, "executeQuery");
      restStub.returns({data: {error: {response: {data: "error"}}}});
      await wrapper.vm.confirmApproval();
      expect(wrapper.vm.approvalRequiredProcessed.length).toBe(2);
      expect(wrapper.vm.dialogs.approveChanges).toBe(false);
      expect(wrapper.vm.approvalRequiredProcessed[0].id).toBe(101);
      expect(wrapper.vm.error.recordID).toBe(101);

      restStub.restore();
      wrapper.vm.dialogs.recordID = 101;
      restStub = sinon.stub(Client.prototype, "executeQuery");
      restStub.returns({data: {error: false}});
      await wrapper.vm.confirmApproval();
      expect(wrapper.vm.approvalRequiredProcessed.length).toBe(1);
      expect(wrapper.vm.dialogs.approveChanges).toBe(false);
      expect(wrapper.vm.approvalRequiredProcessed[0].id).toBe(102);


      restStub.restore();
      wrapper.vm.dialogs.recordID = 102;
      restStub = sinon.stub(Client.prototype, "executeQuery");
      restStub.returns({data: {error: {response: {data: "error"}}}});
      await wrapper.vm.confirmApproval();
      expect(wrapper.vm.approvalRequiredProcessed.length).toBe(1);
      expect(wrapper.vm.dialogs.approveChanges).toBe(false);
      expect(wrapper.vm.approvalRequiredProcessed[0].id).toBe(102);

      // TODO: Check that the DB is correctly updated
    });

    it("can delete a record", async () => {
      //There is an error in the client query
      restStub.restore();
      wrapper.vm.dialogs.recordID = 102;
      restStub = sinon.stub(Client.prototype, "executeQuery");
      restStub.returns({data: {error: {response: {data: "error"}}}});
      await wrapper.vm.confirmDelete();
      expect(wrapper.vm.approvalRequiredProcessed.length).toBe(1);
      expect(wrapper.vm.dialogs.deleteRecord).toBe(false);
      expect(wrapper.vm.approvalRequiredProcessed[0].id).toBe(102);
      expect(wrapper.vm.error.recordID).toBe(102);


      //Correct deleted
      wrapper.vm.dialogs.recordID = 102;
      restStub.restore();
      restStub = sinon.stub(Client.prototype, "executeQuery");
      restStub.returns({data: {error: false}});
      await wrapper.vm.confirmDelete();
      expect(wrapper.vm.approvalRequiredProcessed.length).toBe(0);
      expect(wrapper.vm.dialogs.deleteRecord).toBe(false);

      // TODO: Check that the DB is correctly updated


    });

    it("can watch props data", () => {
      wrapper.vm.$options.watch.approvalRequired.call(wrapper.vm);
      expect(wrapper.vm.approvalRequiredProcessed[0].recordName).toMatch("Record3 (99)");
    });



});
