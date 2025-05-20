import { ls } from '@common/source/js/utils/local-storage';
import Vue from 'vue';
const namespaced = true;

const state = {
    DS: {
        signup: {
            confirm: false
        },
        isSignupSuccess: false
    }
};

const mutations = {
    UPDATE_CACHE(state, { path, value }) {
        const keys = path.split('.');
        let current = state;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if(!current[key] || typeof current[key] !== 'object') {
                Vue.set(current, key, {});
            }
            current = current[key];
        }
        const finalKey = keys[keys.length - 1];
        Vue.set(current, finalKey, value);
        ls.setItem(keys[0], {...state[keys[0]]});
        console.log(state);
    },
    CLEAN_CACHE(state, payload) {
        // ..
        ls.removeItem(payload);
        if(state.payload) {
            state.payload = {};
        }
    },
    GET_CACHE_VALUE(state, payload) {
    },
    REPLACE_OBJ(state, payload) {
        state[payload.key] = { ...state[payload.key], ...payload.value };
    },
    INIT_CACHE() {
        // ..
    },
    GET_CACHE_LIST(state, payload) {
        if(ls.getItem(state.cacheName)) {
            let DsSignUpStorage = ls.getItem('DS_SIGNUP');
            Object.keys(DsSignUpStorage).forEach(key => { this[DsSignUpStorage][key] = DsSignUpStorage[key]; });
        }
    }
};

const actions = {
};

export default {
    namespaced,
    state,
    mutations,
    actions
};
