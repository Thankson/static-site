<template>
    <section class="o-cBOSelections">
        <h2 class="o-cBOSelections__title">{{ labels.BackupOrderProducts.Title }}</h2>
        <div class="o-cBOSelections__filters flex">

            <!-- Category -->
            <div
                v-if="categoryModel"
                class="a-select lg:m-0 h-full w-full my-10 lg:order-1 order-2">
                <label
                    class="sr-only"
                    :for="'category' + selectId"
                >{{ labels.BackupOrderProducts.Category }}</label>
                <select
                    :id="'category' + selectId"
                    ref="categorySelect"
                    v-model="categoryModel"
                    class="a-select__field h-full pl-15"
                    name="product-name-select"
                    @change="[updateFilter('category'), gtmTrackAction({ id: 213 }, $event, true)]"
                >
                    <option
                        v-for="category in filter.categoryOptions"
                        :key="category.i"
                        :value="category.ItemId"
                    >{{ labels.BackupOrderProducts.Category }}: {{ category.Title }}</option>
                </select>
                <span
                    aria-hidden="true"
                    class="a-arrow -sm -down -filled w-0 h-0 absolute right-15 top-10 pointer-events-none md:top-12"
                >
                    <span class="a-arrow__icon border-black"></span>
                </span>
            </div>

            <!-- Search -->
            <o-search-bar-bo
                ref="search"
                :script-id="scriptId"
                @updateFilter="updateFilter('search')"
            >
            </o-search-bar-bo>

            <!-- Sort -->
            <div class="a-select h-full w-full order-3">
                <label class="sr-only" :for="'sort' + selectId">{{ labels.BackupOrderProducts.SortBy }}</label>
                <select
                    :id="'sort' + selectId"
                    ref="sortSelect"
                    class="a-select__field h-full pl-15"
                    name="product-name-select"
                    @change="[updateFilter(), gtmTrackAction({ id: 212 }, $event, true)]"
                >
                    <option
                        v-for="sort in filter.sortOptions"
                        :key="sort.i"
                        :value="sort.ItemId"
                    >{{ labels.BackupOrderProducts.SortBy }}: {{ sort.Title }}</option>
                </select>
                <span
                    aria-hidden="true"
                    class="a-arrow -sm -down -filled w-0 h-0 absolute right-15 top-10 pointer-events-none md:top-12"
                >
                    <span class="a-arrow__icon border-black"></span>
                </span>
            </div>

        </div>

        <!-- No prod cards -->
        <p v-if="products.length === 0 && productsLoaded" class="flex justify-center">{{ labels.BackupOrderProducts.NoProducts }}</p>

        <!-- Prod Cards -->
        <div class="o-cBOSelections__inner" aria-live="polite">
            <span v-if="searchResultsLabel" class="sr-only">{{ searchResultsLabel }}</span>
            <ul class="o-cBOSelections__itemList">
                <li v-for="(product,index) in products" :key="index" class="o-cBOSelections__items">
                    <m-backup-product-card
                        :card-version="isCn ? '-isCn -backupOrder':'-backupOrder'"
                        :labels="labels.BackupOrderSelection"
                        :category="$refs.categorySelect.value"
                        :card-cta="labels.BackupOrderSelection.Add"
                        :is-preferred="true"
                        points-label="<span class='sr-only'>Earn </span>{0} Points"
                        points-label-singular="<span class='sr-only'>Earn </span>{0} Point"
                        :product="{ Data: product }"
                        :check-inventory="true"
                    ></m-backup-product-card>
                </li>
            </ul>
            <div v-show="productsLoaded && totalProducts > 0" class="o-cBOSelections__actions" :class="{ 'justify-end': isLastPage || isCn }">
                <div v-if="!isLastPage && !isCn" class="o-cBOSelections__buttons">
                    <button
                        class="o-cBOSelections__pagination a-button -center rounded-sm -white md:w-1_5 mr-20 w-full"
                        @click="loadMoreProducts"
                    >{{ labels.BackupOrderProducts.LoadMore }}</button>
                    <button
                        class="o-cBOSelections__pagination a-button -center rounded-sm -white w-full md:w-1_5 lg:flex"
                        @click="loadAllProducts"
                    >{{ labels.BackupOrderProducts.ViewAll }}</button>
                </div>

                <a-back-to-top
                    :button-text="labels.BackupOrderProducts.BackToTop"
                >
                </a-back-to-top>
            </div>
        </div>

        <!-- Loading -->
        <a-loading-spinner sr-text="Loading Products" :visible="!productsLoaded" />
    </section>
</template>
<script>
    import { mapState, mapActions } from 'vuex';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import envSoldOut from '../../../mixins/env';
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'OCustBackupOrderSelections',
        mixins: [safeId, envSoldOut],
        safeIds: ['selectId'],
        props: {
            categoryDefault: {
                type: String,
                default: ''
            },
            filter: {
                type: Object,
                default: () => ({
                    categoryOptions: [
                        { ItemId: '03b22e02c987431889a18d4ae1ad1481', Title: 'Show All' },
                        { ItemId: '383f3fe3c45f4338a5b8376c8857623b', Title: 'Most Popular' },
                        {
                            ItemId: 'f5343d7e52243f8fb62a4ab4e6637f13',
                            Title: 'Home Fragrances'
                        },
                        {
                            ItemId: '407c8b78c15d485907562a8e6378e280',
                            Title: 'Medicine Cabinet'
                        },
                        {
                            ItemId: '393f10c772284a9f7f8c5765bf5a1801',
                            Title: 'Melaleuca Logo Gear'
                        },
                        { ItemId: '2c79b80bc55d205b4189c95703c836bc', Title: 'PET CARE' },
                        {
                            ItemId: '0cc1c307ed570aa575ce59906b2dae5b',
                            Title: 'Sales Aids & Materials'
                        }
                    ],
                    sortOptions: [
                        {
                            ItemId: '12a56083fe584f3192bd7549877c6cf3', Title: 'Popularity'
                        },
                        {
                            ItemId: 'd3bdb74312b74803bef621bf42ac1d66', Title: 'Price (High to Low)'
                        },
                        {
                            ItemId: 'e5170c4b656b462d87205575a486eb34',
                            Title: 'Price (Low to High)'
                        },
                        {
                            ItemId: 'c874cb8120f1436fa75c456e5714cb55',
                            Title: 'Points (High to Low)'
                        },
                        {
                            ItemId: '332ee8f86b664b48b9f4c68dcb026e40',
                            Title: 'Points (Low to High)'
                        }
                    ],
                    CancelLink:
                        {
                            'Url': 'http://www.melaleuca.com', 'Text': 'Cancel', 'Target': '_self'
                        }
                })
            },
            labels: {
                type: Object,
                default: () => ({
                    CustomizeBackupOrder: {
                        Title: 'Customize Your Backup Order',
                        Description:
                            'Search products or add from the product list below that fit your lifestyle'
                    },
                    BackupOrderSelection: {
                        YourBackupOrder: 'Your Backup Order',
                        Items: 'items',
                        Points: 'points',
                        Minimum: 'minimum',
                        Description:
                            ' If you forget to shop, select the items for our Backup Order that will give you everything you need to get throught the month.',
                        NoProductMessage:
                            'You have no items in your Backup Order. Add or edit your selections by searching by Keywords, Item Number, or Product Name. A Customized backup Order must meet your minimum product point commitment of <strong>{0} Points</strong>',
                        Qty: 'Qty',
                        Pts: 'Pts',
                        Cancel: 'Cancel',
                        Save: 'Save'
                    },
                    BackupOrderProducts: {
                        Title: 'Customize Your Backup Order',
                        Category: 'Category',
                        Search: 'Search',
                        SortBy: 'Sort by',
                        LoadMore: 'Load More',
                        ViewAll: 'View All',
                        BackToTop: 'Back To Top',
                        SearchResultsAriaLabel: 'Found {0} results'
                    }
                })
            },
            isCn: {
                type: Boolean,
                default: false
            },
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                categoryModel: '',
                selectId: '',
                isBackupOrder: true,
                loading: false,
                isLoadAll: false,
                announceResults: false
            };
        },
        computed: {
            ...mapState('customBackupOrder', [
                'lastSku',
                'products',
                'pageSize',
                'pageNum',
                'productsLoaded',
                'selectedCategory',
                'selectedOptions',
                'totalProducts'
            ]),
            categoryFirst() {
                return this.filter?.categoryOptions[0]?.ItemId;
            },
            totalProdShown() {
                return this.products.length;
            },
            isLastPage() {
                let isLastPage = false;

                if(this.totalProducts > 0) {
                    isLastPage = Math.ceil(this.totalProducts / this.pageSize) === this.pageNum || this.isLoadAll;
                }

                return isLastPage;
            },
            searchResultsLabel() {
                if(this.announceResults && this.totalProdShown > 0 && this.labels.BackupOrderProducts.SearchResultsLabel) {
                    return this.replaceToken(
                        this.labels.BackupOrderProducts.SearchResultsLabel, this.totalProdShown
                    );
                } return null;
            }
        },
        watch: {
            categoryModel(val) {
                if(val) this.categoryModel = val;
            }
        },
        mounted() {
            // set the first value
            this.$nextTick(() => {
                this.categoryModel = this.categoryFirst;
            });
            if(this.isCn) {
                window.addEventListener('scroll', this.onScroll);
            }
        },
        destroyed () {
            window.removeEventListener('scroll', this.onScroll);
        },
        methods: {
            ...mapActions('customBackupOrder', [
                'addToCart',
                'getCBOProducts',
                'getBackupOrderCart',
                'resetProducts',
                'toggleLoader'
            ]),
            replaceToken,
            async loadMoreProducts(event) {
                this.isLoadAll = false;
                this.loading = true;
                this.toggleLoader(false);
                await this.getCBOProducts({
                    catId: this.$refs.categorySelect.value,
                    sortId: this.$refs.sortSelect.value,
                    searchTerm: this.$refs.search.input,
                    pageNum: this.pageNum + 1,
                    lastSku: this.lastSku
                });

                this.loading = false;
                if(this.isCn && this.isLastPage) {
                    window.removeEventListener('scroll', this.onScroll);
                }
            },
            loadAllProducts(event) {
                this.isLoadAll = true;
                this.toggleLoader(false);
                this.getCBOProducts({
                    catId: this.$refs.categorySelect.value,
                    sortId: this.$refs.sortSelect.value,
                    searchTerm: this.$refs.search.input,
                    pageNum: 1,
                    showAll: true
                });
            },
            onScroll() {
                const scrollEnd = (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - document.querySelector(`.o-siteFooter`)?.offsetHeight;
                if(scrollEnd && !this.isLastPage && this.productsLoaded && !this.loading) {
                    this.loadMoreProducts();
                }
            },
            updateFilter(type) {
                if(this.isCn) {
                    window.removeEventListener('scroll', this.onScroll);
                    window.addEventListener('scroll', this.onScroll);
                }

                this.isLoadAll = false;
                this.toggleLoader(false);
                if(type === 'category') {
                    this.$refs.search.resetSearch();
                } else if(type === 'search') {
                    this.categoryModel = this.categoryDefault || this.categoryFirst;
                    this.announceResults = true;
                }

                this.resetProducts();

                this.getCBOProducts({
                    catId: this.categoryModel,
                    sortId: this.$refs.sortSelect.value,
                    searchTerm: this.$refs.search.input,
                    pageNum: 1
                });

                window.trackAction && window.trackAction({ id: 211, eL: this.$refs.search.input });
            }
        }
    };
</script>
