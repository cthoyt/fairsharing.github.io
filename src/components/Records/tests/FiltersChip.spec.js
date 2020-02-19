import { shallowMount, createLocalVue } from "@vue/test-utils";
import Chips from "../FiltersChip.vue"
import Vuex from "vuex";

const localVue = createLocalVue();
localVue.use(Vuex);

const $route = {
    path: "/search",
    query: {
        "grants": "ABCDEF",
        "publications": "pub1,pub2,pub3"
    }
};

const push = jest.fn();
const $router = {
    push: jest.fn(),
};

describe("FiltersChips.vue", () => {

    let wrapper;

    beforeEach(async () => {
        wrapper = shallowMount(Chips, {
            mocks: {$route, $router},
            localVue
        });
    });

    it("can be instantiated", () => {
        expect(wrapper.name()).toMatch("FiltersChip");
    });

    it("can remove a parameter value", async () => {
        wrapper.vm.$router.push = push;
        await wrapper.vm.removeParam("publications", "pub2");
        expect($router.push).toHaveBeenCalledTimes(1);
        await wrapper.vm.removeParam("grants", "ABCDEF");
        expect($router.push).toHaveBeenCalledTimes(2);
        await wrapper.vm.removeParam("publications", "pub4");
        expect($router.push).toHaveBeenCalledTimes(3);
    })

});