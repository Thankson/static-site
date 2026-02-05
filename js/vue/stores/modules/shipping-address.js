import api from '@api/routes/customeraccount/addresses';
import postApi from '@api/routes/customeraccount/makedefaultaddress';
import deleteApi from '@api/routes/customeraccount/deleteaddress';
import formHelper from '@common/source/js/vue/utils/form-helper';
import { compareAddress } from '../../utils/format-address';

const namespaced = true;

const state = {
    addresses: [],
    crossCountryAddress: {},
    openAddEditAddressForm: {},
    experianModalAcceptGoToCheckSave: false,
    loaded: false,
    loading: false,
    localization: {},
    areaInfo: null
};

const actions = {
    //  by default address type is shipping address
    async fetchAddresses({ commit }, addressType = 'shippingAddress') {
        commit('SET_LOADING');
        const response = await api.query({ addressType });
        if(response.success) {
            commit('UPDATE_ADDRESSES', response.data?.Data || []);
        }

        commit('SET_LOADED');
        commit('SET_LOADING', false);
    },
    //  all addresses including business address
    async fetchAllAddresses({ commit, rootState }) {
        commit('SET_LOADING');
        const response = await api.query();
        if(response.success) {
            if(rootState.riverbendSubscription.isRiverbend) {
                commit('UPDATE_ADDRESSES_RIVERBEND', response.data?.Data || []);
            } else {
                commit('UPDATE_ADDRESSES', response.data?.Data || []);
            }
        }

        commit('SET_LOADED');
        commit('SET_LOADING', false);
    },
    setExperianModalAcceptGoToCheckSave({ commit }, value) {
        commit('SET_EXPERIAN_MODAL_ACCEPT_GO_TO_CHECK_SAVE', value);
    },
    setOpenAddEditAddressForm({ commit }, bool) {
        commit('SET_OPEN_ADD_EDIT_ADDRESS_FORM', bool);
    },
    async setDefaultAddress({commit}, params) {
        commit('SET_LOADING');
        const response = await postApi.post({
            AddressId: params.AddressId,
            Country: params.Country,
            WithinCurrentCountry: true,
            IsDefault: true
        });

        if(response.success) {
            commit('SET_DEFAULTADDRESS', params.AddressId);
        }

        commit('SET_LOADING', false);
    },
    async setDefaultCrossCountryAddress({commit}, params) {
        commit('SET_LOADING');
        const response = await postApi.post({
            AddressId: params.AddressId,
            Country: params.Country,
            WithinCurrentCountry: false,
            IsDefault: true
        });

        if(response.success) {
            commit('SET_DEFAULTCROSSCOUNTRY_ADDRESS', params.AddressId, params.Country);
            if(response.data.Data.PaymentAddressPage.Url) {
                window.location.href = response.data.Data.PaymentAddressPage.Url;
            }
        }

        commit('SET_LOADING', false);
    },
    async deleteAddress({commit}, params) {
        commit('SET_LOADING');
        const response = await deleteApi.delete({
            AddressId: params
        });

        if(response.success) {
            commit('DELETE_ADDRESS', params);
        }

        commit('SET_LOADING', false);
    }
};

const getters = {
    addressMatches: (state) => (addressToMatch, country, typeExclusions = []) => {
        return state.addresses.filter((address) => compareAddress(addressToMatch, address, country) && !typeExclusions.includes(address.AddressType));
    },
    crossCountryAddress(state) {
        return state.crossCountryAddress;
    },
    openAddEditAddressForm(state) {
        return state.openAddEditAddressForm;
    }
};

const mutations = {
    DELETE_ADDRESS(state, id) {
        const removedAddressArray = state.addresses;
        let removedAddress = removedAddressArray.findIndex(removedAddressArray => removedAddressArray.AddressId === id);
        removedAddressArray.splice(removedAddress, 1);
        state.addresses = removedAddressArray;
    },
    SET_CROSS_COUNTRY_ADDRESS(state, id) {
        state.crossCountryAddress = id;
    },
    SET_DEFAULTADDRESS(state, id) {
        const defaultArray = state.addresses;
        const newDefault = defaultArray.findIndex(defaultArray => defaultArray.AddressId === id);
        let otherCards = defaultArray.filter(defaultArray => defaultArray.AddressId !== id);
        otherCards.forEach(function(item, index) {
            item.IsDefault = false;
        });

        defaultArray[newDefault].IsDefault = true;
        defaultArray[newDefault].WithinCurrentCountry = true;
        let removedNewCard = defaultArray.splice(newDefault, 1);
        defaultArray.unshift(removedNewCard[0]);

        state.addresses = defaultArray;
    },
    SET_DEFAULTCROSSCOUNTRY_ADDRESS(state, id) {
        const defaultArray = state.addresses;
        const newDefault = defaultArray.findIndex(defaultArray => defaultArray.AddressId === id);
        let otherCards = defaultArray.filter(defaultArray => defaultArray.AddressId !== id);
        otherCards.forEach(function(item, index) {
            item.IsDefault = false;
        });

        defaultArray[newDefault].IsDefault = true;
        defaultArray[newDefault].WithinCurrentCountry = false;
        let removedNewCard = defaultArray.splice(newDefault, 1);
        defaultArray.unshift(removedNewCard[0]);

        state.addresses = defaultArray;
    },
    SET_EXPERIAN_MODAL_ACCEPT_GO_TO_CHECK_SAVE(state, value) {
        state.experianModalAcceptGoToCheckSave = value;
    },
    SET_LOADED(state, loaded = true) {
        state.loaded = loaded;
    },
    SET_LOADING(state, loading = true) {
        state.loading = loading;
    },
    SET_OPEN_ADD_EDIT_ADDRESS_FORM(state, value) {
        state.openAddEditAddressForm = value;
    },
    UPDATE_ADDRESSES_RIVERBEND(state, data) {
        let addresses = data;

        let isDefaultCard = addresses.findIndex(_data => _data.AddressType === 'RiverbendAddress');
        let removedCard = addresses.splice(isDefaultCard, 1);
        addresses.unshift(removedCard[0]);
        addresses = addresses.filter(address => address?.AddressType !== 'BusinessAddress');
        let isValidAddress = formHelper.rbPoApoFpoValidator(true, 'address', 'us');
        let isValidCity = formHelper.rbPoApoFpoValidator(true, 'city', 'us');
        addresses = addresses.filter(address => {
            if(!isValidAddress(address?.AddressLine1)) return false;
            if(!isValidAddress(address?.AddressLine2)) return false;
            if(!isValidCity(address?.City)) return false;
            if(!/UnitedStates|Canada/i.test(address?.Country)) return false;

            return true;
        });

        state.addresses = addresses;
    },
    UPDATE_ADDRESSES(state, data) {
        let addresses = Array.isArray(data) ? [...data] : [];
        let isDefaultCard = addresses.findIndex(_data => _data.IsDefault === true);

        if(isDefaultCard !== -1) {
            let removedCard = addresses.splice(isDefaultCard, 1);
            addresses.unshift(removedCard[0]);
        }
        state.addresses = addresses;
    },
    SET_AREA_INFO(state, areaInfo = {}) {
        state.areaInfo = areaInfo;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};
