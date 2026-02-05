import api from '@api/routes/orderhistory/';

const namespaced = true;

const state = {
    canAddToBackupOrder: false,
    filterType: 'OrderNumber', // OrderNumber or OrderType ? WIP !
    hideTrackingLink: false,
    initCall: [],
    isLoaded: false,
    isLoadedPage: false,
    isLoadedOrders: false,
    mostRecentString: '',
    orderFiltered: [], // Orders filtered
    orderFilteredSliced: [], // Orders filtered sliced by ordersSize
    ordersSize: 12, // How many orders per page
    orderType: 'Shipped', // WIP !
    pageCount: null,
    pageNumber: null,
    pastOrdersArr: [], // All orders - do not mutate this -
    selectShowing: [], // WIP !
    selectSortBy: [], // Options of 'sort by' select
    showing: '', // 'All' or -TBD- WIP - !
    showError: false,
    sortBy: '', // 'Most Recent' or year(2020, 2019, etc.)
    userFlags: {},
    useAlternateTrackingUrl: false,
    alternateTrackingUrl: '',
    yearsForSort: []
};

const actions = {
    setRoute({ commit }, { apiEndpoint }) {
        api.setRoute(apiEndpoint);
    },

    updateOrdersSize({ commit }, value) {
        commit('UPDATE_ORDERS_SIZE', value);
    },

    async fetchPastOrders({ commit }, payload) {
        const response = await api.get(payload.apiAddress);
        if(response.data?.Success) {
            const _data = response.data?.Data?.Orders || [];
            const userFlags = response.data?.Data?.UserFlags || {};
            const buoFlag = response.data?.Data?.CanAddToBackupOrder || false;
            const useAlternateTrackingUrl = response.data?.Data?.UseAlternateTrackingUrl || false;
            const alternateTrackingUrl = response.data?.Data?.AlternateTrackingUrl.Url || '';
            const hideTrackingLink = response.data?.Data?.HideTrackingLink || false;

            const pageSettings = {
                pageCount: response.data?.Data?.PageCount || 1,
                pageNumber: response.data?.Data?.PageNumber || 1
            };
            const yearsForSort = response.data?.Data?.Years || [];

            if(payload.init) commit('UPDATE_INIT_VALUE', {commit, _data});

            commit('UPDATE_PAGE', {commit, pageSettings});
            commit('UPDATE_PAST_ORDERS', {commit, _data, pageSettings});
            commit('UPDATE_SELECT_SORT_BY', {commit, _data});
            commit('UPDATE_SET_YEARS_FOR_SORT', {commit, yearsForSort});
            commit('UPDATE_USER_FLAGS', {commit, userFlags});
            commit('UPDATE_BUO_FLAG', {commit, buoFlag});
            commit('UPDATE_USE_ALTERNATE_TRACKING', {commit, useAlternateTrackingUrl});
            commit('UPDATE_ALTERNATE_TRACKING_URL', {commit, alternateTrackingUrl});
            commit('UPDATE_HIDE_TRACKING_LINK', {commit, hideTrackingLink});
            // To-do when service is done
            // commit('UPDATE_SELECT_SHOWING', {commit, _data});
        } else {
            commit('UPDATE_ERROR_STATE', true);
        }

        // regardless of success state, update loading state:
        commit('UPDATE_LOADED_ORDERS', true);
        commit('UPDATE_LOADED_PAGE', true);
    },

    async getPastOrderData({ commit, dispatch }, {baseApiAddress, orderHistory, page, year, monthsToFetch, init}) {
        let apiOrderHistoryAddress = '';
        let yearChosen = year ? `&year=${year}` : '';
        let monthsToFetchFrom = monthsToFetch ? `&monthsToFetch=${monthsToFetch}` : '';

        commit('UPDATE_LOADED_PAGE', false);
        if(page === 1) commit('UPDATE_LOADED_ORDERS', false);

        apiOrderHistoryAddress = `?pagenumber=${page}${yearChosen}${monthsToFetchFrom}`;

        await dispatch('fetchPastOrders', {apiAddress: apiOrderHistoryAddress, init: init});

        dispatch('orderBy', {filterSel: 'all', sortSel: state.sortBy});
    },

    orderBy({commit}, {filterSel, sortSel}) {
        commit('UPDATE_ORDER_FILTERS', {filterSel, sortSel});
    }
};

const getters = {};

const mutations = {
    INIT_LABELS(state, payload) {
        // Label all
        state.selectShowing = payload.All;
        state.showing = payload.All;

        // Label most recent
        state.mostRecentString = payload.MostRecent;
        state.selectSortBy.unshift(payload.MostRecent);
        state.sortBy = payload.MostRecent;
    },
    UPDATE_INIT_VALUE(state, payload) {
        state.initCall = payload._data;
    },
    UPDATE_ERROR_STATE(state, payload) {
        state.showError = payload;
        state.isLoaded = true;
    },
    UPDATE_LOADED_ORDERS(state, payload) {
        // Updating the orders
        state.isLoadedOrders = payload;
    },
    UPDATE_LOADED_PAGE(state, payload) {
        // Updating only the pagination
        state.isLoadedPage = payload;
    },
    UPDATE_PAGE(state, payload) {
        state.pageCount = payload.pageSettings.pageCount;
        state.pageNumber = payload.pageSettings.pageNumber;
    },
    UPDATE_PAST_ORDERS(state, payload) {
        const _data = payload._data;
        if(payload.pageSettings.pageNumber === 1) state.pastOrdersArr = [];
        state.pastOrdersArr.push(..._data);

        // isLoaded confirmation
        state.isLoaded = true;
    },
    UPDATE_USER_FLAGS(state, payload) {
        state.userFlags = payload.userFlags;
    },
    UPDATE_BUO_FLAG(state, payload) {
        state.canAddToBackupOrder = payload.buoFlag;
    },
    UPDATE_USE_ALTERNATE_TRACKING(state, payload) {
        state.useAlternateTrackingUrl = payload.useAlternateTrackingUrl;
    },
    UPDATE_ALTERNATE_TRACKING_URL(state, payload) {
        state.alternateTrackingUrl = payload.alternateTrackingUrl;
    },
    UPDATE_HIDE_TRACKING_LINK(state, payload) {
        state.hideTrackingLink = payload.hideTrackingLink;
    },
    UPDATE_ORDER_FILTERS(state, payload) {
        try {
            state.orderFilteredSliced = state.pastOrdersArr;
            // FILTER by 'Showing'
            let filteredArr = [];
            const filterSel = payload.filterSel;
            const sortSel = payload.sortSel;

            if(filterSel.toLowerCase() === 'all') {
                filteredArr = state.pastOrdersArr;
            } else {
                filteredArr = state.pastOrdersArr.filter(order => order['OrderType'] === filterSel);
            }

            // Sort By - Order Entry Date
            let sort = function(sortArray) {
                return sortArray.sort((a, b) => {
                    return a.OrderEntryDate < b.OrderEntryDate ? 1 : -1;
                });
            };

            // SORT by Most Recent or Filter By Year
            if(sortSel === state.mostRecentString) {
                const newSort = sort(filteredArr);
                // Updating State
                state.orderFiltered = newSort;
                state.orderFilteredSliced = state.orderFiltered.slice(0, state.ordersSize);
            } else {
                const newFilter = filteredArr.filter(order => order['FormattedOrderEntryDate'].substr(order['FormattedOrderEntryDate'].length - 4) === sortSel.toString());
                state.orderFiltered = newFilter;
                const newSort = sort(newFilter);
                state.orderFilteredSliced = newSort.slice(0, state.ordersSize);
            }
        } catch (e) {
            console.log('[PastOrderStore] UPDATE_ORDER_FILTERS');
            console.log(e);
        }
    },

    UPDATE_ORDERS_SIZE(state, payload) {
        state.ordersSize = payload;
    },

    UPDATE_SELECT_SORT_BY(state, payload) {
        let dateArr = [];
        const _data = payload._data;

        _data.map(el => {
            const order = el.FormattedOrderEntryDate;
            const dateOrder = order.substr(order.length - 4);
            dateArr.push(parseInt(dateOrder));
        });
        const dateFiltered = dateArr.filter((item, index) => dateArr.indexOf(parseInt(item)) === index);
        const dateSorted = dateFiltered.sort((a, b) => a < b ? 1 : -1);
        const newDateFilter = state.selectSortBy.concat(dateSorted);

        state.selectSortBy = newDateFilter;
    },
    UPDATE_SELECT_SHOWING(state, payload) {
        let showingArr = [];
        const _data = payload._data;

        _data.map((el, i) => {
            showingArr.push(el.OrderType);
        });

        const showingFiltered = showingArr.filter((item, index, a) => index === a.indexOf(item));
        const showingSorted = showingFiltered.sort();
        const newShowingFilter = state.selectShowing.concat(showingSorted);
        state.selectShowing = newShowingFilter;
    },

    UPDATE_SHOWING(state, payload) {
        state.ordersSize = payload._numberOfOrdersPerPage;
        state.showing = payload.value;
    },

    UPDATE_SORT_BY(state, payload) {
        state.ordersSize = payload._numberOfOrdersPerPage;
        state.sortBy = payload.value;
    },

    UPDATE_SET_YEARS_FOR_SORT(state, payload) {
        state.yearsForSort = payload.yearsForSort;
    },

    NEXT_PAGE(state, payload) {
        state.ordersSize += payload;
        state.orderFilteredSliced = state.orderFiltered.slice(0, state.ordersSize);
    }
};

export default {
    actions,
    getters,
    mutations,
    namespaced,
    state
};
