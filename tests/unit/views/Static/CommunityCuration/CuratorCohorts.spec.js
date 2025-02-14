import {shallowMount} from "@vue/test-utils";
import CuratorCohorts from "@/views/Static/CommunityCuration/CuratorCohorts"
import Vuetify from "vuetify"
import fakeData from "@/../tests/fixtures/communityCurationCohortsMock.json"

const vuetify = new Vuetify();

const currentCuratorsList = [
    {
        "name": "Kyle Copas",
        "id": 5832,
        "organisation": [
            {
                "id": 1166,
                "name": "GBIF",
                "tooltip": "Global Biodiversity Information Facility"
            }
        ],
        "scope": "Biodiversity",
        "orcid": "0000-0002-6590-599X",
        "early_adopter" : true,
        "show_more" : false,
        "twitter": "kylecopas",
        "linkedin" : "kylecopas",
        "logo": "",
        "year_active": ["2023", "2022"]
    },
    {
        "name": "Annie Elkjær Ørum-Kristensen",
        "id": 6182,
        "organisation": [
            {
                "id": 1166,
                "name": "GBIF",
                "tooltip": "Global Biodiversity Information Facility"
            }
        ],
        "scope": "Biodiversity",
        "orcid": "0000-0002-8326-5789",
        "early_adopter" : true,
        "show_more" : false,
        "twitter": "",
        "linkedin" : "",
        "logo": "",
        "year_active": ["2022"]
    },
    {
        "name": "Joe Miller",
        "id": 6118,
        "organisation": [
            {
                "id": 1166,
                "name": "GBIF",
                "tooltip": "Global Biodiversity Information Facility"
            }
        ],
        "scope": "Biodiversity",
        "orcid": "0000-0002-5788-9010",
        "early_adopter" : true,
        "show_more" : false,
        "twitter": "acaciaJoe",
        "linkedin" : "",
        "logo": "",
        "year_active": ["2022"]
    },
    {
        "name": "Lindsey Anderson",
        "id": 5015,
        "organisation": [
            {
                "id": 2284,
                "name": "PNNL",
                "tooltip": "Pacific Northwest National Laboratory"
            }
        ],
        "scope": "Omics",
        "orcid": "0000-0002-8741-7823",
        "early_adopter" : true,
        "show_more" : false,
        "twitter": "lnanderscience",
        "linkedin" : "lnanderscience",
        "logo": "",
        "year_active": ["2023", "2022"]
    },
    {
        "name": "Malin Sandström",
        "id": 464,
        "organisation": [
            {
                "id": 1321,
                "name": "Karolinska Institutet, INCF"
            }
        ],
        "scope": "Neuroscience",
        "orcid": "0000-0002-8464-2494",
        "early_adopter" : true,
        "show_more" : false,
        "twitter": "msandstr",
        "linkedin" : "malinsandstrom",
        "logo": "",
        "year_active": ["2023", "2022"]
    }
]

const alumniCuratorsList = [
    {
        "name": "Annie Elkjær Ørum-Kristensen",
        "id": 6182,
        "organisation": [
            {
                "id": 1166,
                "name": "GBIF",
                "tooltip": "Global Biodiversity Information Facility"
            }
        ],
        "scope": "Biodiversity",
        "orcid": "0000-0002-8326-5789",
        "early_adopter" : true,
        "show_more" : false,
        "twitter": "",
        "linkedin" : "",
        "logo": "",
        "year_active": ["2022"]
    },
    {
        "name": "Joe Miller",
        "id": 6118,
        "organisation": [
            {
                "id": 1166,
                "name": "GBIF",
                "tooltip": "Global Biodiversity Information Facility"
            }
        ],
        "scope": "Biodiversity",
        "orcid": "0000-0002-5788-9010",
        "early_adopter" : true,
        "show_more" : false,
        "twitter": "acaciaJoe",
        "linkedin" : "",
        "logo": "",
        "year_active": ["2022"]
    },
]

describe("CuratorCohorts.vue", function(){
    let wrapper;
    fakeData.data.sort((a, b) => a.name.localeCompare(b.name))

    beforeEach(() => {
        wrapper = shallowMount(CuratorCohorts, {
            vuetify,
        })
        wrapper.setData({
            communityCurationCohorts: fakeData,
            currentCohort: currentCuratorsList
        })

    });
    afterEach(() => {
        wrapper.destroy();
    });

    it("can be instantiated", () => {
        expect(wrapper.name()).toMatch("CuratorCohorts");
        expect(wrapper.vm.communityCurationCohorts.data).toStrictEqual(fakeData.data);
        expect(wrapper.vm.currentCohort).toStrictEqual(currentCuratorsList);
        expect(wrapper.vm.year).toBe(new Date().getFullYear());
        expect(wrapper.vm.yearList).toStrictEqual([ "2023", "2022"]);
        expect(wrapper.vm.error).toBe(false);
        expect(wrapper.vm.alumniCurator).toBe(false);
    });

    it("can alumniCurator is true on click", () => {
        wrapper.vm.alumniCurator = false;
        wrapper.vm.listAlumni()
        expect(wrapper.vm.alumniCurator).toBe(true)
        expect(wrapper.vm.currentCohort).toStrictEqual(alumniCuratorsList);
        expect(wrapper.vm.year).toBe(null);
    });

    it("can alumniCurator is false on click", () => {
        const getCuratorsList = jest.fn();
        getCuratorsList()
        wrapper.vm.alumniCurator = true;
        wrapper.vm.listAlumni()
        expect(wrapper.vm.alumniCurator).toBe(false)
        expect(wrapper.vm.year).toBe(new Date().getFullYear());
        expect(getCuratorsList).toHaveBeenCalled();
    });
});
