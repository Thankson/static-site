<template>
    <div class="o-shoplistsGrid" :class="{'-servicesFailure': hasServicesFailure}">
        <!-- Show spinner while API is being loaded -->
        <div v-if="showLoading && !loaded" class="o-shoplistsGrid__loading">
            <a-loading-spinner
                :visible="true"
                class="o-shoplistsGrid__loadingIcon"
                aria-hidden="true">
            </a-loading-spinner>
        </div>

        <!-- Show services failure message -->
        <div v-if="hasServicesFailure" class="bg-white border border-gray rounded p-20">
            <!-- Services failure message -->
            <div class="mb-10 text-gray" v-html="getLabels(localization, 'Labels.GenericFailureMessage', 'Services Failure Label Missing')"></div>

            <!-- Refresh Page CTA -->
            <a
                class="underline text-green font-bold"
                :href="currentPage">
                {{ getLabels(localization, 'Labels.RefreshPage', 'Refresh Page Label Missing') }}
            </a>
        </div>

        <!-- Or show empty list message -->
        <div v-if="!showLoading && loaded && !products.length && emptyList && !hasServicesFailure" class="o-shoplistsGrid__wrapper">
            <div class="o-shoplistsGrid__emptyList" :class="{'-col' : !emptyList.img}">
                <!-- Title -->
                <h2 class="o-shoplistsGrid__title">
                    {{ emptyList.title }}
                </h2>

                <!-- Text -->
                <div class="o-shoplistsGrid__col -first" :class="{'-full' : !emptyList.img}">
                    <div
                        class="m-rte"
                        v-html="emptyList.text">
                    </div>
                </div>

                <!-- Image -->
                <div v-if="emptyList.img" class="o-shoplistsGrid__col -last">
                    <img
                        class="o-shoplistsGrid__img"
                        :src="emptyList.img"
                        :alt="emptyList.alt" />
                </div>
            </div>
        </div>

        <!-- Or show items and pagination -->
        <div v-if="products && products.length && loaded" class="o-shoplistsGrid__wrapper">
            <!-- Grid Item -->
            <m-shoplists-grid-item
                v-for="(product, index) in products" :key="product.Sku"
                :is-preferred="isPreferred"
                :list-id="listId"
                :list-type="listType"
                :localization="localization"
                :product="product"
                :user-flags="userFlags"
                :script-id-configurator="scriptIdConfigurator"
                :system-generated="systemGenerated"
                :class="{'-visible': product.Visible || isViewAll, '-last': (index + 1) === productsCount}"
                :can-delete-items="canDeleteItems"
                @removed="handleRemoved">
            </m-shoplists-grid-item>
        </div>

        <!-- Pagination/Navigation -->
        <div
            v-if="loaded && productsCount && productsCount <= storedListItems.length && storedListItems.length > loadPerPage"
            class="o-shoplistsGrid__pagination">
            <!-- Load More button -->
            <button
                class="o-shoplistsGrid__button a-button -btn"
                :class="productsCount === storedListItems.length ? '-disabled hidden' : '-white'"
                :disabled="productsCount === storedListItems.length"
                @click="loadMore()">
                {{ getLabels(localization, 'Labels.LoadMore', 'Load more') }}
            </button>

            <!-- View All button -->
            <button
                class="o-shoplistsGrid__button a-button -btn"
                :class="productsCount === storedListItems.length ? '-disabled hidden' : '-white'"
                :disabled="productsCount === storedListItems.length"
                @click="viewAll()">
                {{ getLabels(localization, 'Labels.ViewAll', 'View all') }}
            </button>

            <!-- Back To Top anchor -->
            <a href="#shoplistsSectionTop" class="o-shoplistsGrid__button -anchor">
                <span class="o-shoplistsGrid__text">{{ getLabels(localization, 'Labels.BackToTop', 'Back To Top') }}</span>
                <span class="material-icons" aria-hidden="true">arrow_upward</span>
            </a>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import envSoldOut from '../../../mixins/env';

    export default {
        name: 'OShoplistsGrid',
        mixins: [ labels, envSoldOut ],
        props: {
            isPreferred: {
                type: Boolean,
                default: null
            },
            listId: {
                type: [Number, String],
                default: null
            },
            listType: {
                type: String,
                default: null
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            },
            sort: {
                type: [Number, String],
                default: null
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            systemGenerated: {
                type: Boolean,
                default: true
            },
            userFlags: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                isViewAll: false,
                products: [],
                productsCount: 0,
                apiError: [],
                loaded: false,
                showLoading: false,
                maxPerPage: 24,
                loadPerPage: 12,
                itemRemoved: false,
                itemMoved: false,
                initPagination: false,
                hasServicesFailure: false
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedApiLoading', 'storedListItems', 'storedIsMoving', 'storedListItemsRemoved', 'storedHasApiError']),

            paramsReady() {
                return this.listId !== null && this.sort ? {
                    listId: this.listId,
                    sort: this.sort
                } : false;
            },
            emptyList() {
                let localization = this.localization?.Data?.EmptyLists || {};
                let info = null;

                // Get text according to list type
                localization = localization.find(item => item.ListType === this.listType);

                if((!this.products || !this.products.length) && localization) {
                    info = {};
                    info.title = this.getLabels(localization, 'Title', 'You have no items in this list');
                    info.text = this.getLabels(localization, 'Description', 'Your list is empty.');
                    info.img = this.getLabels(localization, 'Image.Url', null);
                    info.alt = this.getLabels(localization, 'Image.Alt', null);
                }

                return info;
            },
            canDeleteItems() {
                return this.listType === 'CustomerList' || this.listType === 'SaveForLater';
            },
            currentPage() {
                return window.location.href;
            }
        },
        watch: {
            paramsReady: {
                handler(newValue, oldValue) {
                    if(this.paramsReady) {
                        this.getData();
                    }
                },
                deep: true
            },
            storedApiLoading() {
                this.showLoading = this.storedApiLoading;
            },
            storedIsMoving() {
                this.itemMoved = this.storedIsMoving;
            },
            storedListItems: {
                handler() {
                    if(!this.itemRemoved && !this.itemMoved && !this.initPagination) {
                        // Receive list items from store
                        this.products = this.storedListItems;

                        // Get initial items
                        for (let i = 0; i < this.maxPerPage; i++) {
                            if(this.products[i]) {
                                this.$store.commit('shoppingLists/SET_VISIBLE_ITEM', i);
                                this.productsCount++;
                            }
                        }

                        this.initPagination = true;
                    } else {
                        this.itemRemoved = false;
                        this.$store.commit('shoppingLists/SET_IS_MOVING', false);

                        // If all the items were removed
                        if(!this.storedListItems.length || this.storedListItemsRemoved) {
                            this.products = this.storedListItems;
                            this.productsCount = this.storedListItems.length;
                            this.$store.commit('shoppingLists/SET_ITEMS_REMOVED', false);
                        }
                    }

                    // Page is loaded
                    this.loaded = true;
                },
                deep: true
            }
        },
        methods: {
            ...mapActions('shoppingLists', ['getListItems']),

            handleRemoved() {
                this.itemRemoved = true;
            },
            loadMore() {
                if(this.products && this.productsCount) {
                    let nextProd = this.productsCount;
                    let i = 1;

                    while (i <= this.loadPerPage) {
                        if(this.products[nextProd]) {
                            this.$store.commit('shoppingLists/SET_VISIBLE_ITEM', nextProd);
                            this.productsCount++;
                        }

                        nextProd++;

                        i++;
                    }
                }
            },
            viewAll() {
                this.isViewAll = true;

                this.productsCount = this.products.length;
            },
            async getData() {
                this.$emit('items-loaded', false);
                this.loaded = false;
                this.initPagination = false;
                this.itemRemoved = false;
                this.itemMoved = false;
                this.productsCount = 0;
                this.apiError = [];

                // Get items from a list
                await this.getListItems({
                    payload: {
                        ListId: this.listId,
                        so: this.sort,
                        isShelf: false,
                        checkInventory: true
                    }
                });

                // Check if there's API error on loading the list items
                this.hasServicesFailure = !this.products.length && this.storedHasApiError;

                // If it's SaveForLater, then set items as SaveForLater items
                // This is necessary to remove items from SaveForLater after Add To Cart (Shelf)
                if(this.listType === 'SaveForLater') {
                    this.$store.commit('savedForLater/SET_SAVED_FOR_LATER', this.storedListItems);
                }

                this.$emit('items-loaded', true);
            }
        }
    };
</script>
