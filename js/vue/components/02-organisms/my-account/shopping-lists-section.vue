<template>
    <section class="o-shoplistsSection" :class="{'-servicesFailure': hasServicesFailure, '-isCnShoppingList': isCn}">
        <!-- Show services failure message -->
        <div v-if="hasServicesFailure" class="bg-white border border-gray rounded p-20 mt-20">
            <!-- Services failure message -->
            <div class="mb-10 text-gray" v-html="getLocalizationProp('Labels.GenericFailureMessage', 'Services Failure Label Missing')"></div>

            <!-- Refresh Page CTA -->
            <a
                class="underline text-green font-bold"
                :href="currentPage">
                {{ getLocalizationProp('Labels.RefreshPage', 'Refresh Page Label Missing') }}
            </a>
        </div>

        <!-- Shopping Lists -->
        <div v-show="!isManageLists && !hasServicesFailure" class="o-shoplistsSection__wrapper">
            <!-- Show loading while is adding a list to cart or BUO -->
            <div v-if="isAddingList" class="o-shoplistsSection__loading">
                <a-loading-spinner :visible="true" aria-hidden="true" />
            </div>

            <!-- Anchor - Navigation purpose -->
            <a id="shoplistsSectionTop" class="o-shoplistsSection__anchor" aria-hidden="true"></a>

            <!-- Header - No Print -->
            <div class="o-shoplistsSection__header -default">
                <!-- All lists -->
                <div class="o-shoplistsSection__col">
                    <m-shoplists-opts
                        :initial-selected="listId"
                        @change="updateActiveList"
                        @has-services-failure="(hasError) => hasServicesFailure = hasError">
                    </m-shoplists-opts>
                </div>

                <div v-if="isCn" class="o-shoplistsSection__header -isCn -isMobile">
                    <div
                        v-if="itemsLoaded && listItems && parseInt(activeList.ItemCount)"
                        class="o-shoplistsSection__quicklink">
                        <div
                            class="o-shoplistsSection__item" @click="handleAddItemsToCart(storedListItems, 'modal-add-items', false, {
                                ListId: activeList.ListId,
                                ListName: activeList.ListName,
                                ListType: activeList.ListType
                            })"><span aria-hidden="true" class="a-icon material-icons -inherit">shopping_cart</span>{{ getLocalizationProp('Labels.AddListToCart', 'Add This List to Cart') }}</div>
                    </div>
                    <div
                        v-if="itemsLoaded && listItems && parseInt(activeList.ItemCount)
                            && activeList.ListType != 'PurchasedItemsList'
                            && activeList.ListType != 'SaveForLater'"
                        class="o-shoplistsSection__quicklink">
                        <button v-if="useWMPShareListFeatureFlag" class="o-shoplistsSection__item -share" @click="openShareByWmpModal">
                            <span aria-hidden="true" class="a-icon material-icons -inherit">share</span> {{ getLocalizationProp('Labels.ShareListByWMP', 'Share List By WMP') }}
                        </button>
                        <a-shelf-toggle v-else class="o-shoplistsSection__item -share" @click="gtmTrackAction({id: 173}, $event)">
                            <!-- Start: Shelf CTA -->
                            <span aria-hidden="true" class="a-icon material-icons -inherit">email</span> {{ getLocalizationProp('Labels.ShareList', 'Share List') }}
                            <!-- End: Shelf CTA -->

                            <template v-slot:heading>
                                <span class="text-2xl block pt-25 sm:text-2xl-2 sm:pt-20" role="text">
                                    {{ getLocalizationProp('Labels.ShareListShelf.Title', 'Add to Share list') }}
                                </span>
                            </template>

                            <template v-slot:content>
                                <m-share-list-form
                                    :email-validation-text="getLocalizationProp('Labels.ShareListShelf.ErrorEmail', 'Please add a valid Email address.')"
                                    :list-id="activeList.ListId"
                                    :list-name="activeList.ListName"
                                    :required-field-text="getLocalizationProp('Labels.ShareListShelf.Required', 'This field is required.')"
                                    :share-list-cancel="getLocalizationProp('Labels.ShareListShelf.Cancel', 'Cancel')"
                                    :share-list-description="getLocalizationProp('Labels.ShareListShelf.Description', 'Share the list <em>{listName}</em> to one of your friends and family.')"
                                    :share-list-email="getLocalizationProp('Labels.ShareListShelf.Email', 'Email')"
                                    :share-list-email-placeholder="getLocalizationProp('Labels.ShareListShelf.EmailPlaceholder', 'Enter Email Address')"
                                    :share-list-message="getLocalizationProp('Labels.ShareListShelf.Message', 'Message')"
                                    :share-list-message-placeholder="getLocalizationProp('Labels.ShareListShelf.MessagePlaceholder', 'Hi!\n\nI created this list of fantastic products for you.\n\nJennifer\n\n')"
                                    :share-list-send="getLocalizationProp('Labels.ShareListShelf.Send', 'Send')"
                                    :consent-label="getLocalizationProp('Labels.ShareListShelf.Consent', 'The recipient has agreed to sending this message, including and invitation to learn more about Melaleuca.')"
                                    :consent-error="getLocalizationProp('Labels.ShareListShelf.ConsentError', 'Please check the consent message.')">
                                </m-share-list-form>
                            </template>
                        </a-shelf-toggle>
                    </div>
                </div>

                <!-- Sort and Actions flyout -->
                <div v-if="activeList" class="o-shoplistsSection__col">
                    <!-- All sort options according to selected list -->
                    <m-shoplists-sort
                        :initial-sort="sort"
                        :sort="activeSortOptions"
                        :localization="localization"
                        @change="updateActiveSort">
                    </m-shoplists-sort>

                    <!-- Actions flyout -->
                    <m-shoplists-actions
                        :list-id="activeList.ListId"
                        :list-name="activeList.ListName"
                        :list-item-count="parseInt(activeList.ItemCount)"
                        :list-type="activeList.ListType"
                        :sort="activeSort"
                        :localization="localization"
                        :is-cn="isCn"
                        :items-loaded="itemsLoaded"
                        @adding-list="handleAddingList"
                        @manage-lists="handleManageLists"
                        @open-share-by-wmp-modal="openShareByWmpModal"
                    >
                    </m-shoplists-actions>
                </div>
            </div>

            <template v-if="isCn">
                <div v-if="itemsLoaded && listItems && parseInt(activeList.ItemCount)" class="o-shoplistsSection__header -isCn">
                    <div v-if="itemsLoaded && listItems && parseInt(activeList.ItemCount)" class="o-shoplistsSection__quicklink">
                        <div
                            class="o-shoplistsSection__item" @click="handleAddItemsToCart(storedListItems, 'modal-add-items', false, {
                                ListId: activeList.ListId,
                                ListName: activeList.ListName,
                                ListType: activeList.ListType
                            })"><span aria-hidden="true" class="a-icon material-icons -inherit">shopping_cart</span>{{ getLocalizationProp('Labels.AddListToCart', 'Add This List to Cart') }}</div>
                    </div>
                    <div
                        v-if="itemsLoaded && listItems && parseInt(activeList.ItemCount)
                            && activeList.ListType != 'PurchasedItemsList'
                            && activeList.ListType != 'SaveForLater'"
                        class="o-shoplistsSection__quicklink">
                        <button v-if="useWMPShareListFeatureFlag" class="o-shoplistsSection__item -share" @click="openShareByWmpModal">
                            <span aria-hidden="true" class="a-icon material-icons -inherit">share</span> {{ getLocalizationProp('Labels.ShareListByWMP', 'Share List By WMP') }}
                        </button>
                        <a-shelf-toggle v-else class="o-shoplistsSection__item -share" @click="gtmTrackAction({id: 173}, $event)">
                            <!-- Start: Shelf CTA -->
                            <span aria-hidden="true" class="a-icon material-icons -inherit">email</span> {{ getLocalizationProp('Labels.ShareList', 'Share List') }}
                            <!-- End: Shelf CTA -->

                            <template v-slot:heading>
                                <span class="text-2xl block pt-25 sm:text-2xl-2 sm:pt-20" role="text">
                                    {{ getLocalizationProp('Labels.ShareListShelf.Title', 'Add to Share list') }}
                                </span>
                            </template>

                            <template v-slot:content>
                                <m-share-list-form
                                    :email-validation-text="getLocalizationProp('Labels.ShareListShelf.ErrorEmail', 'Please add a valid Email address.')"
                                    :list-id="activeList.ListId"
                                    :list-name="activeList.ListName"
                                    :required-field-text="getLocalizationProp('Labels.ShareListShelf.Required', 'This field is required.')"
                                    :share-list-cancel="getLocalizationProp('Labels.ShareListShelf.Cancel', 'Cancel')"
                                    :share-list-description="getLocalizationProp('Labels.ShareListShelf.Description', 'Share the list <em>{listName}</em> to one of your friends and family.')"
                                    :share-list-email="getLocalizationProp('Labels.ShareListShelf.Email', 'Email')"
                                    :share-list-email-placeholder="getLocalizationProp('Labels.ShareListShelf.EmailPlaceholder', 'Enter Email Address')"
                                    :share-list-message="getLocalizationProp('Labels.ShareListShelf.Message', 'Message')"
                                    :share-list-message-placeholder="getLocalizationProp('Labels.ShareListShelf.MessagePlaceholder', 'Hi!\n\nI created this list of fantastic products for you.\n\nJennifer\n\n')"
                                    :share-list-send="getLocalizationProp('Labels.ShareListShelf.Send', 'Send')"
                                    :consent-label="getLocalizationProp('Labels.ShareListShelf.Consent', 'The recipient has agreed to sending this message, including and invitation to learn more about Melaleuca.')"
                                    :consent-error="getLocalizationProp('Labels.ShareListShelf.ConsentError', 'Please check the consent message.')">
                                </m-share-list-form>
                            </template>
                        </a-shelf-toggle>
                    </div>
                </div>
            </template>
            <!-- Header - Print -->
            <div v-if="activeList" class="o-shoplistsSection__header -print">
                <div class="o-shoplistsSection__row">
                    <header-print
                        :title="printTitle"
                    >
                    </header-print>
                </div>

                <div class="o-shoplistsSection__row">
                    <p class="o-shoplistsSection__text -listName">
                        {{ activeList.ListName }}
                        <span class="o-shoplistsSection__hightlight -listName">{{ activeList.ItemCount }} {{ getLocalizationProp('Labels.Items', 'items') }}</span>
                    </p>
                    <p class="o-shoplistsSection__text -listSort">
                        <span class="o-shoplistsSection__hightlight -listSort">{{ getLocalizationProp('Labels.SortBy', 'Sort by') }}</span>
                        {{ activeSortName }}
                    </p>
                </div>
            </div>

            <!-- Grid -->
            <o-shoplists-grid
                v-if="activeList"
                :is-preferred="isPreferred"
                :list-id="activeList.ListId"
                :list-type="activeList.ListType"
                :system-generated="activeList.SystemGenerated"
                :sort="activeSort"
                :localization="localization"
                :user-flags="userFlags"
                :script-id-configurator="scriptIdConfigurator"
                @items-loaded="handleItemsLoaded">
            </o-shoplists-grid>

            <!-- Footer - Print -->
            <div class="o-shoplistsSection__footer -print">
                <div class="o-shoplistsSection__row">
                    <footer-print
                        :address="printAddress"
                        :contact="printContact"
                    ></footer-print>
                </div>
            </div>
        </div>
        <!-- Manage Shopping Lists -->
        <o-shoplists-manage
            v-if="isManageLists"
            :localization="localization"
            @manage-lists="handleManageLists"
            @removed-list="handleRemovedList">
        </o-shoplists-manage>

        <m-add-items-modal
            v-if="listAdded && isCn"
            ref="modal-add-items"
            :is-cart="listAddingType === 'cart'"
            :is-buo="listAddingType === 'buo'"
            :is-cn="isCn"
            :localization="localization"
            modal-id="modal-add-items"
            @adding-list-hide="closeModal('modal-add-items')">
        </m-add-items-modal>
        <m-aif-out-of-stock
            ref="removedProducts"
            code="sc_OrderRemovedProducts"
            :modal-data="modalDetails"
        />

        <!-- share by wmp modal -->
        <modal :id="shareByWmpModalId">
            <template v-slot:content>
                <div v-html="getLocalizationProp('Data.ShareListModalContent')"></div>
            </template>
        </modal>
    </section>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import headerPrint from '../../01-molecules/print/print-header.vue';
    import footerPrint from '../../01-molecules/print/print-footer.vue';
    import shoplistsModalMixin from '../../../mixins/shopping-lists-modal';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'OShoplistsSection',
        components: {
            headerPrint,
            footerPrint
        },
        mixins: [ localizationMixin, shoplistsModalMixin],
        props: {
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            }
        },
        data() {
            return {
                activeList: {},
                activeSort: null,
                activeSortOptions: [],
                isManageLists: false,
                isAddingList: false,
                itemsLoaded: false,
                listId: null,
                listName: null,
                sort: null,
                urlParams: {},
                hasServicesFailure: false,
                modalDetails: {},
                shareByWmpModalId: 'share-by-wmp-modal'
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedListItems', 'storedListModalData']),
            listItems() {
                return this.storedListItems ? this.storedListItems.length : 0;
            },
            activeSortName() {
                let sort = null;

                if(this.activeSort && this.activeSortOptions) {
                    sort = this.activeSortOptions.find(item => item.Value === this.activeSort);
                }

                return sort?.Title;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isPreferred() {
                return this.localization?.Data?.IsPreferredMember;
            },
            printTitle() {
                const myAccount = this.localization?.Labels?.MyAccount || 'My Account';
                const myLists = this.localization?.Labels?.MyLists || 'My Lists';

                return '<span>' + myAccount + '</span> <span>/</span> <span class="uppercase">' + myLists + '</span>';
            },
            printAddress() {
                return this.localization?.Data?.Print?.Address;
            },
            printContact() {
                return this.localization?.Data?.Print?.Contact;
            },
            sortingOptions() {
                return this.localization?.Data?.SortingOptions;
            },
            currentPage() {
                return window.location.href;
            },
            userFlags() {
                return this.localization?.Data?.UserFlags;
            },
            useWMPShareListFeatureFlag() {
                return this.getLocalizationProp('Data.UseWMPShareListFeatureFlag');
            }
        },
        watch: {
            storedListModalData(newVal) {
                newVal.forEach(aif => {
                    if(aif.ValidationCode === 'sc_OrderRemovedProducts') {
                        this.modalDetails = aif.Modal;
                        this.$refs['removedProducts'].$emit('show');
                        this.getAllLists();
                    }
                });
            }
        },
        created() {
            this.urlParams = new URLSearchParams(window.location.search);

            // Get listId from query string
            if(this.urlParams.has('listId')) {
                this.listId = parseInt(this.urlParams.get('listId'));
            }

            // Get sort from query string
            if(this.urlParams.has('sort')) {
                this.sort = this.urlParams.get('sort');
            }

            // Get manageLists from query string
            if(this.urlParams.has('manageLists')) {
                this.handleManageLists(true);
            }
        },
        methods: {
            ...mapActions('shoppingLists', ['getAllLists']),
            handleManageLists(toggle) {
                this.isManageLists = toggle;
            },
            handleAddingList(adding) {
                this.isAddingList = adding;
            },
            handleRemovedList(list) {
                // If the removed list is the active list, then clear the shopping lists page
                if(list && this.activeList && list.ListId === this.activeList.ListId) {
                    this.activeList = null;
                    this.activeSortOptions = [];
                    this.activeSort = null;
                    this.listId = null;

                    // Clear selected list
                    eventBus.$emit('clear-selected-list', true);
                }
            },
            handleItemsLoaded(loaded) {
                this.itemsLoaded = loaded;
            },
            updateActiveList(list) {
                this.activeList = list;
                this.activeSortOptions = [];

                if(this.activeList && this.sortingOptions.length) {
                    for (let i = 0; i < this.sortingOptions.length; i++) {
                        if(this.sortingOptions[i].ListType === this.activeList.ListType) {
                            this.activeSortOptions = this.sortingOptions[i].Options;
                            break;
                        }
                    }
                }
            },
            updateActiveSort(sort) {
                this.activeSort = sort;
            },
            openShareByWmpModal() {
                this.$modal.show({ id: this.shareByWmpModalId });
            }
        }
    };
</script>
