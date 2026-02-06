import eventsApi from '@api/routes/events/lambda';

const namespaced = true;

const state = {
    liveSessionData: {}
};

const actions = {
    fetchLambdaEvents({ commit }, {lambdaUrl}) {
        if(process.env.NODE_ENV === 'development') {
            return new Promise((resolve, reject) => {
                eventsApi.get()
                    .then(response => {
                        commit('SET_LAMBDA_EVENTS', response.data);
                        resolve(response.data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        reject(error);
                    });
            });
        } else {
            fetch(lambdaUrl)
                .then(response => response.json())
                .then(data => {
                    commit('SET_LAMBDA_EVENTS', data);
                })
                .catch(error => console.error('Error:', error));
        }
    }
};

const mutations = {
    SET_LAMBDA_EVENTS(state, payload) {
        state.liveSessionData = payload;
    }
};

const getters = {
    liveSessionData(state) {
        return state.liveSessionData;
    }
};

export default {
    namespaced,
    state,
    mutations,
    actions,
    getters
};
