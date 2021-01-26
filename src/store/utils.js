export const initStateMessages = function(){
    let states = [
        "login",
        "logout",
        "getUser",
        "resetPassword",
        "sendResetEmail",
        "changePassword",
        "updateProfile"
    ];
    let output = {};
    states.forEach(function(state){
        output[state] = {
            message: null,
            error: null
        }
    });
    return output;
};

export const initUserDataState = function(){
    return {
        isLoggedIn: false,
        credentials: {
            token: null,
            tokenValidity: null
        },
        metadata: {},
        records: {},
        is_curator: false,
        role: null
    }
};

export const validateToken = function(tokenExpiry){
    let now = new Date();
    return now.getTime() - tokenExpiry*1000 < 0;
};

export function initEditorSections(data, sectionsNames){
    let emptyData = {
        type: {},
        status: {},
        countries: [],
        //publications: [],
        metadata: {
            name: null,
            abbreviation: null,
            homepage: null,
            year_creation: null,
            description: null,
            deprecation_reason: ""
        },
        is_dataset: false
    };
    let sections = {};
    if (data) {
        const schema = {
            generalInformation: {
                type: data.type,
                status: data.status,
                countries: data.countries,
                metadata: data.metadata,
                domains: data.domains.map((obj) => {
                    obj.label = obj.label.toLowerCase();
                    return obj;
                }),
                subjects: data.subjects.map((obj) => {
                    obj.label = obj.label.toLowerCase();
                    return obj;
                }),
                taxonomies: data.taxonomies.map((obj) => {
                    obj.label = obj.label.toLowerCase();
                    return obj;
                }),
                userDefinedTags: data.userDefinedTags.map((obj) => {
                    obj.label = obj.label.toLowerCase();
                    return obj;
                }),
                is_dataset: false
            },
            publications: data.publications,
            organisations: data.organisationLinks
        };
        schema.generalInformation.metadata.deprecation_reason = data.metadata.deprecation_reason || "";
        if(data.publications) {
            schema.publications.forEach((pub) => {
                pub.isCitation = false;
                let isCitation = data.metadata.citations.filter(obj => obj.publication_id === pub.id)[0];
                if (isCitation) {
                    pub.isCitation = true;
                }
            });
        }
        sectionsNames.forEach(name => {
            let copy = (schema[name]) ? JSON.parse(JSON.stringify(schema[name])) : null;
            sections[name] = {
                message: null,
                error: false,
                data: schema[name],
                changes: 0,
                initialData: copy
            }
        });
    }
    else {
        sections.generalInformation = {
            changes: 0,
            message: null,
            error: false,
            data: emptyData,
            initialData: emptyData
        };
    }
    return sections;
}
