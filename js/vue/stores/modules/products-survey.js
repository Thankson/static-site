import api from '@api/routes/productsurvey';
import apiProductList from '@api/routes/productsurvey/savetolist';

const namespaced = true;

const state = {
    hasWhichProductsList: false,
    storedApiLoading: false,
    storedApiError: [],
    storedSurveyInfo: {},
    storedSurveyOptions: [],
    storedSurveyResults: {},
    storedSurveyListAdded: false,
    storedSurveyListResult: {},
    storedSurveyListError: false
};

const parseError = (errorMessages = []) => {
    let errors = [];

    if(Array.isArray(errorMessages)) {
        errorMessages.forEach(error => {
            errors.push(error.Translation || error);
        });
    } else {
        errors = [ errorMessages ];
    }

    return errors;
};

const actions = {
    // Get Survey Options
    async getSurveyOptions({ commit }, payload) {
        // Enable loading and reset API errors
        commit('SET_API_LOADING', true);
        commit('SET_API_ERROR', []);

        api.setRoute('/api/productsurvey');

        // Get data from API
        const response = await api.query(payload);

        // Process response
        if(response.success && response?.data?.Success && response?.data?.Data) {
            // Set access code
            commit('SET_SURVEY_INFO', { AccessCode: response.data.Data.AccessCode });
            sessionStorage.setItem('accessCode', JSON.stringify(response.data.Data.AccessCode));

            // Sort and set options
            let surveyOptions = response?.data?.Data?.Sections;
            surveyOptions.forEach(element => {
                element.Options.sort((optionA, optionB) => {
                    return optionA.Title.toLowerCase().localeCompare(optionB.Title.toLowerCase());
                });
            });
            commit('SET_SURVEY_OPTIONS', surveyOptions);
        } else {
            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }

            commit('SET_SURVEY_INFO', {});
            commit('SET_SURVEY_OPTIONS', []);
        }

        // Disable loading
        commit('SET_API_LOADING', false);
    },

    // Save Survey
    async saveSurvey({ commit }, payload) {
        let response = null;

        // Enable loading and reset API errors
        commit('SET_API_LOADING', true);
        commit('SET_API_ERROR', []);
        commit('SET_SURVEY_LIST_ERROR', false);
        commit('SET_SURVEY_LIST_RESULT', {});

        if(payload.IsEditing) {
            api.setRoute('/api/productsurvey/resave');
        } else {
            api.setRoute('/api/productsurvey');
        }
        const url = new URL(window.location.href);
        url.searchParams.set('completed', true);
        url.searchParams.set('date', new Date().toLocaleDateString());
        window.history.pushState({}, '', url.toString());

        let data = {
            AccessCode: payload.AccessCode,
            EmailAddress: payload.EmailAddress,
            SurveyId: payload.SurveyId,
            Sections: payload.Sections
        };

        // only add `ForceSave` property to response if it exists:
        if(payload.ForceSave) {
            data.ForceSave = payload.ForceSave;
        }

        // Create or edit survey
        response = await api.post(data);

        // Process response
        if(response.success && response?.data?.Success && response?.data?.Data) {
            // Set results
            commit('SET_SURVEY_RESULTS', response.data.Data);
            const save = {
                Results: response.data.Data,
                Sections: payload.Sections
            };
            sessionStorage.setItem('productSurvey', JSON.stringify(save));
        } else {
            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }

            commit('SET_SURVEY_RESULTS', {});
        }

        // Disable loading
        commit('SET_API_LOADING', false);
    },
    // Add items to Survey List (list called Which Products)
    async setSurveyList({ commit }, payload) {
        let data = {
            SurveyResults: {
                AccessCode: payload.AccessCode,
                EmailAddress: payload.EmailAddress,
                SurveyId: payload.SurveyId,
                Sections: payload.Sections
            },
            Products: payload.Results
        };
        const response = await apiProductList.post(data);
        if(response.success && response?.data?.Success && response?.data?.Data) {
            // Store the response to check if there's some attention item
            commit('SET_SURVEY_LIST_RESULT', response.data.Data);
            commit('SET_SURVEY_LIST_ERROR', false);
        } else {
            commit('SET_SURVEY_LIST_RESULT', null);
            commit('SET_SURVEY_LIST_ERROR', true);
        }
    }
};

const getters = {
};

const mutations = {
    SET_SURVEY_LIST_RESULT(state, data) {
        state.storedSurveyListAdded = data !== null;
        state.storedSurveyListResult = data;
    },
    SET_SURVEY_LIST_ERROR(state, error) {
        state.storedSurveyListError = error;
    },
    SET_API_LOADING(state, loading) {
        state.storedApiLoading = loading;
    },
    SET_API_ERROR(state, error = []) {
        const errorArr = Array.isArray(error) ? error : [ error ];
        state.storedApiError = errorArr;
    },
    SET_SURVEY_INFO(state, info) {
        state.storedSurveyInfo = info;
    },
    SET_SURVEY_OPTIONS(state, options) {
        state.storedSurveyOptions = options;
    },
    SET_UPDATED_CHOICES(state, {choices, index}) {
        state.storedSurveyOptions[index].Options.forEach((option) => {
            option.Selected = choices.includes(option.Id);
        });
    },
    SET_SURVEY_RESULTS(state, results) {
        state.hasWhichProductsList = results.HasWhichProductsList;
        state.storedSurveyResults = results;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};
