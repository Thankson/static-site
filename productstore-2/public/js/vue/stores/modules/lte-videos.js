import api from '@api/routes/learntoearn/videos';
import apiLearningVideoLibrary from '@api/routes/learningLibrary/videos';
import apiWatched from '@api/routes/learntoearn/watched';
import beautyToolkitApi from '@api/routes/media/library';
import localization from '@api/routes/learntoearn/labels';
import videoApi from '@api/routes/videolibrary/videos';

const namespaced = true;

const state = {
    carouselCardsList: [], // List of first 'carouselSizeStore' cards
    carouselSizeStore: 8, // Number of cards showing in the carousel
    cartVideosList: [], // Videos on the cart page
    categoryId: '',
    data: {},
    introVideosList: [], // List of all Intro videos
    isApiCalled: false,
    isApiLabelsCalled: false,
    isBeautyToolkit: false,
    isLearningVideoLibrary: false,
    isLoaded: false,
    isLoadingWatchedApi: false,
    localization: {},
    newVideosList: [], // List of all videos set as "new"
    newestVideoCard: {}, // Obj with the first "new" card on Load - NOT reactive
    pageNumber: null,
    refinerKey: '',
    refiners: [],
    showApiError: false,
    sortKey: '',
    sortValue: '',
    storedVideosList: [], // List of all videos
    totalPages: null,
    videosList: [],
    watchedStep: {} // Last step with completion data (last message, next video, etc.)
};

const actions = {
    async fetchLocalization({ commit }, address) {
        if(!state.isApiLabelsCalled) {
            commit('SET_API_LABELS_CALLED', true);
            const response = await localization.get();
            if(response.success && response?.data?.Success) {
                let _data = response.data;
                commit('UPDATE_LOCALIZATION', {commit, _data});
            } else {
                // API Error
                commit('SET_FAIL_REQUEST');
            }
        }
    },

    async fetchLTE({ commit }, { params, initial, isCn, isBeautyToolkit }) {
        let response;
        if(isCn) {
            response = await videoApi.query(params, state.categoryId);
        } else if(isBeautyToolkit) {
            const searchParams = new URLSearchParams();
            searchParams.append('categoryPageId', state.categoryId);
            response = await beautyToolkitApi.query(searchParams);
            commit('SET_IS_BEAUTY_TOOLKIT_VIDEO', isBeautyToolkit);
        } else if(state.isLearningVideoLibrary) {
            response = await apiLearningVideoLibrary.query(params, state.categoryId);
        } else {
            response = await api.query(params, state.categoryId);
        }

        if(response.success && response?.data?.Success) {
            let _data = (response.data) ? response.data.Data : null;
            commit('UPDATE_VIDEO_LIST', {commit, _data});
            commit('NEWEST_CARD', {commit, _data});
            commit('NEW_VIDEO_LIST', {commit, _data});
            commit('CAROUSEL_LIST', {commit, _data});
            commit('SET_DATA', response.data.Data);
            if(isCn) {
                commit('SET_VIDEOS', response.data.Data.Videos);
                commit('SET_TOTAL_PAGES', response.data.Data.TotalPages);
            }
            commit('CART_VIDEOS_LIST', {commit, _data});

            if(initial) {
                commit('SET_PAGE_NUMBER', response.data?.CurrentPage || 1);
            }
        } else if(!response.cancelled && response?.data?.Success) {
            commit('SET_ERROR', true);
        } else {
            // API Error
            commit('SET_FAIL_REQUEST');
        }

        commit('UPDATE_LOADED');
        return response.cancelled;
    },

    async getData({ commit, dispatch }, info) {
        if(!state.isApiCalled) {
            // Setting as true so we have only one API call
            commit('SET_API_CALLED', true);
            let localizationFetch = dispatch('fetchLocalization');
            let lTEFetch = dispatch('fetchLTE', info || {});

            return Promise.all([localizationFetch, lTEFetch])
                .then(() => {
                    // Both done
                    console.log('|-LTE: Done all fetchs-|');
                    if(window.refreshLteVideoCarousel) window.refreshLteVideoCarousel();

                    if(info?.initial) {
                        commit('CHECK_REFINER_PARAMS', info.params);
                    }
                });
        }
    },

    async getDataError({ commit }) {
        /* PatternLab only */
        const response = await api.query({forceError: true});
        if(response.success && !response?.data?.Success) {
            console.log('||-Force-Error-PL-Only-||');
            commit('UPDATE_LOADED');
            commit('SET_FAIL_REQUEST');
        }
    },

    resetWatchedStep({ commit }) {
        commit('RESET_WATCHED_STEP');
    },

    updateL2eVideoCart({ commit }) {
        commit('CART_VIDEOS_LIST_NEXT', {commit});
    },

    async updateNonL2eVideos({ commit }, payload) {
        commit('IS_LOADING_WATCHED_API', true);

        // Ping API to set as watched
        await apiWatched.post({
            earnedAmount: 0,
            mediaId: payload.vItemId || payload.vId,
            isLearningVideoLibrary: state.isLearningVideoLibrary
        });
        commit('IS_LOADING_WATCHED_API', false);

        const card = {
            earnedAmount: 0,
            mediaId: payload.vItemId || payload.vId,
            status: 'watched'
        };
        // Update Store
        commit('UPDATE_STATE_CARD', {commit, card});
    },

    async updateState({ commit, dispatch }, card) {
        // Update Store
        commit('UPDATE_STATE_CARD', {commit, card});

        /*
         * Ping API to set as watched
         * And grab infos about the completion modal
         * Removed the earnedAmount: card.earnedAmount as requested (issue 75347)
        */
        let response = await apiWatched.post({
            mediaId: card.mediaId,
            isLearningVideoLibrary: state.isLearningVideoLibrary
        });

        if(response.success) {
            let _data = (response.data) ? response.data.Data : null;
            // Update watched
            commit('UPDATE_WATCHED_STEP', {commit, _data});

            // Update LSD
            dispatch('lsd/getLsdApiData', {}, {root: true});

            // Calling API again to refresh the video data
            if(card?.earnedAmount > 0) {
                commit('REFRESH_DATA', {commit});
                commit('UPDATE_LOADED', {commit, loaded: false});
                if(window.destroyLteVideoCarousel) window.destroyLteVideoCarousel();
                dispatch('getData');
            }

            return true;
        }
    }
};

const getters = {
    getFirstNewCard() {
        return state.newestVideoCard;
    },
    getLocalization() {
        return state.localization;
    },
    params() {
        const params = {};
        params[state.sortKey] = state.sortValue;
        // params.pageNumber = state.pageNumber;
        params[state.refinerKey] = state.refiners.map(refiner => refiner.value);

        return params;
    }
};

const mutations = {
    CAROUSEL_LIST(state, payload) {
        state.carouselCardsList = [];
        state.carouselCardsList = state.storedVideosList.slice(0, state.carouselSizeStore);
    },

    CART_VIDEOS_LIST(state, payload) {
        state.cartVideosList = [];
        for (let i = 0; i < state.storedVideosList.length; i++) {
            let NewCard = state.storedVideosList[i];
            let lsdAmount = NewCard?.LearnToEarn?.Metadata?.LsdAmount;

            if(lsdAmount > 0) {
                if(state.cartVideosList.length < 3) {
                    state.cartVideosList.push(NewCard);
                }
            }
            // If we don't have any video with LSD, add the next Watched
            if(i === state.storedVideosList.length - 1 && state.cartVideosList.length < 3) {
                for (let j = 0; j < state.storedVideosList.length; j++) {
                    const watchedCard = state.storedVideosList[j];
                    const isWatchedCard = watchedCard?.VirtualVideo?.IsWatched;

                    if(isWatchedCard && state.cartVideosList.length < 3) {
                        state.cartVideosList.push(watchedCard);
                    }
                }
            }
        }
    },

    CART_VIDEOS_LIST_NEXT(state, payload) {
        // Next 3 videos
        const updateCartVideos = (start) => {
            state.cartVideosList = [];
            let index = 0;
            // Get next 3 cards from L2E Video List
            // Loop through if is the last video
            for (let i = start; i < start + 3; i++) {
                if(state.storedVideosList[i]) {
                    state.cartVideosList.push(state.storedVideosList[i]);
                } else {
                    state.cartVideosList.push(state.storedVideosList[index]);
                    index++;
                }
            }
        };

        // Get the last video index from storedVideosList
        const lastVideo = state.cartVideosList[2];
        const lastVideoId = lastVideo?.LearnToEarn?.Metadata?.MetadataItemId;
        for (let i = 0; i < state.storedVideosList.length; i++) {
            const video = state.storedVideosList[i];
            const videoId = video?.LearnToEarn?.Metadata?.MetadataItemId;
            if(lastVideoId === videoId) {
                updateCartVideos(i + 1);
                break;
            }
        }
    },

    CHECK_REFINER_PARAMS(state, params) {
        const refinerParams = params?.getAll(state.refinerKey) || [];
        if(refinerParams.length > 0 && state.data?.FacetRefiners?.length) {
            state.data.FacetRefiners.forEach(facet => {
                if(facet.Refiners) {
                    facet.Refiners.forEach(refiner => {
                        if(refinerParams.includes(refiner.ItemId)) {
                            state.refiners.push({
                                name: refiner.Title,
                                value: refiner.ItemId
                            });
                        }
                    });
                }
            });
        }
    },

    CLEAR_REFINERS(state) {
        state.refiners = [];
        state.pageNumber = 1;
    },

    IS_LOADING_WATCHED_API(state, payload) {
        state.isLoadingWatchedApi = payload;
    },

    NEW_VIDEO_LIST(state, payload) {
        state.newVideosList = [];
        for (let i = 0; i < state.storedVideosList.length; i++) {
            let NewCard = state.storedVideosList[i];
            if(state.isBeautyToolkit && NewCard && NewCard.Videos?.VirtualVideo?.IsNew) {
                state.newVideosList.push(NewCard);
            } else if(NewCard && NewCard.VirtualVideo?.IsNew) {
                state.newVideosList.push(NewCard);
            }
            // If we don't have any more New video card, set the last one
            if(i === state.storedVideosList.length - 1 && state.newVideosList.length === 0) {
                state.newVideosList.push(NewCard);
            }
        }
    },

    NEWEST_CARD(state, payload) {
        for (let i = 0; i < state.storedVideosList.length; i++) {
            let firstNewCard = state.storedVideosList[i];
            if(state.isBeautyToolkit && firstNewCard && (!firstNewCard.Videos?.VirtualVideo?.IsWatched || firstNewCard?.Videos?.VirtualVideo?.HasReset)) {
                state.newestVideoCard = firstNewCard;
                break;
            } else if(firstNewCard && (!firstNewCard.VirtualVideo.IsWatched || firstNewCard.VirtualVideo.HasReset)) {
                state.newestVideoCard = firstNewCard;
                break;
            }
        }
        if(!Object.keys(state.newestVideoCard).length) {
            state.newestVideoCard = state.storedVideosList[state.storedVideosList.length - 1];
        }
    },

    OVERWRITE_REFINERS(state, refiners) {
        state.refiners = [ ...refiners ];
    },

    REFRESH_DATA(state) {
        state.isApiCalled = false;
    },

    REMOVE_REFINER(state, refiner) {
        state.refiners = state.refiners.filter(item => item.value !== refiner.value);
    },

    RESET_WATCHED_STEP(state) {
        state.watchedStep = {};
    },

    SET_API_CALLED(state, key) {
        state.isApiCalled = key;
    },

    SET_API_LABELS_CALLED(state, key) {
        state.isApiLabelsCalled = key;
    },

    SET_CATEGORY_ID(state, id) {
        state.categoryId = id;
    },

    SET_DATA(state, data) {
        state.data = { ...data };
    },

    SET_ERROR(state, isError) {
        state.error = isError;
    },

    SET_ERROR_MESSAGE(state, msg) {
        state.errorMsg = msg;
    },

    SET_FAIL_REQUEST(state) {
        state.showApiError = true;
    },

    SET_IS_BEAUTY_TOOLKIT_VIDEO(state, value) {
        state.isBeautyToolkit = value;
    },

    SET_IS_LEARNING_VIDEO_LIBRARY(state, val) {
        state.isLearningVideoLibrary = val;
    },

    SET_PAGE_NUMBER(state, key) {
        state.pageNumber = parseInt(key);
    },

    SET_REFINER_KEY(state, key) {
        state.refinerKey = key;
    },

    SET_SORT_KEY(state, key) {
        state.sortKey = key;
    },

    SET_SORT_VALUE(state, value) {
        state.sortValue = value || null;
    },

    SET_TOTAL_PAGES(state, totalPages) {
        state.totalPages = totalPages;
    },

    SET_VIDEOS(state, videos) {
        if(state.pageNumber === 1) {
            state.videosList = videos;
        } else {
            state.videosList = [...state.videosList, ...videos];
        }
    },

    TOGGLE_REFINER(state, refiner) {
        let active = false;
        // check if refiner is active (exists in refiner array)
        for (let i = 0; i < state.refiners.length; i++) {
            if(refiner.value === state.refiners[i].value) {
                active = true;
                break;
            }
        }

        if(active) {
            state.refiners = state.refiners.filter(item => item.value !== refiner.value);
        } else {
            state.refiners.push(refiner);
        }

        state.pageNumber = 1;
    },

    UPDATE_LOADED(state, payload) {
        (payload) ? state.isLoaded = payload.loaded : state.isLoaded = true;
    },

    UPDATE_LOCALIZATION(state, payload) {
        if(payload && payload._data) {
            state.localization = payload._data;
        }
    },

    UPDATE_STATE_CARD(state, payload) {
        const index = state.storedVideosList.findIndex(item => item.LearnToEarn?.Metadata?.MetadataItemId === payload.card.mediaId);

        // If the video is not in the Store
        if(index < 0) {
            return false;
        }

        // Update States
        state.storedVideosList[index].VirtualVideo.IsWatched = true;
        state.storedVideosList[index].VirtualVideo.IsNew = false;
        state.storedVideosList[index].VirtualVideo.HasReset = false;
        if(state.storedVideosList[index].LearnToEarn) {
            state.storedVideosList[index].LearnToEarn.Metadata.LsdAmount = 0;
        }
        payload.commit('NEWEST_CARD');
        payload.commit('NEW_VIDEO_LIST');
        payload.commit('CART_VIDEOS_LIST');
    },

    UPDATE_VIDEO_LIST(state, payload) {
        if(payload._data.Videos) {
            state.storedVideosList = payload._data.Videos;
            state.introVideosList = state.storedVideosList.filter(video => video.LearnToEarn && video.LearnToEarn.IsIntroVideo);
        } else if(payload._data.Results) {
            state.storedVideosList = payload._data.Results;
        }
    },

    UPDATE_WATCHED_STEP(state, payload) {
        if(payload && payload._data) {
            state.watchedStep = payload._data;
        }
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};
