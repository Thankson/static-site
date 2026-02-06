<template>
    <div class="m-shoplistsActions">
        <button
            class="m-shoplistsActions__button"
            type="button"
            :aria-label="getLabels(localization, 'Labels.SeeMoreActions', 'Open pop-up to see more actions')"
            :aria-pressed="visible ? 'true' : 'false'"
            v-on:click.stop.prevent="togglePopUp('lists')">
            <span class="material-icons" aria-hidden="true">more_vert</span>
        </button>
        <popup
            ref="lists"
            mods="-shoplists-actions"
            arrow-mods="-filled -shadow absolute -top-13 right-10"
            :header-visible="false"
            :footer-visible="false"
            :close-alt="getLabels(localization, 'Labels.ClosePopUp', 'Close pop-up')"
            :close-aria-label="getLabels(localization, 'Labels.ClosePopUp', 'Close pop-up')"
            :cancel-trapped="cancelPopupTrapped"
            v-on:visibility="checkVisibility">
            <ul class="m-shoplistsActions__list" :class="{'-isCn': isCn}">
                <li
                    v-if="showShareListOption"
                    class="m-shoplistsActions__item">
                    <button v-if="getLabels(localization, 'Data.UseWMPShareListFeatureFlag', false)" class="m-shoplistsActions__link" @click="openShareByWmpModal">
                        {{ getLabels(localization, 'Labels.ShareListByWMP', 'Share List By WMP') }}
                    </button>
                    <a-shelf-toggle v-else class="m-shoplistsActions__link" @click="gtmTrackAction({id: 173}, $event)" @shelf-open="cancelPopupTrapped = $event">
                        <!-- Start: Shelf CTA -->
                        {{ getLabels(localization, 'Labels.ShareList', 'Share List') }}
                        <!-- End: Shelf CTA -->

                        <template v-slot:heading>
                            <span class="text-2xl block pt-25 sm:text-2xl-2 sm:pt-20" role="text">
                                {{ getLabels(localization, 'Labels.ShareListShelf.Title', 'Add to Share list') }}
                            </span>
                        </template>

                        <template v-slot:content>
                            <m-share-list-form
                                :email-validation-text="getLabels(localization, 'Labels.ShareListShelf.ErrorEmail', 'Please add a valid Email address.')"
                                :list-id="listId"
                                :list-name="listName"
                                :required-field-text="getLabels(localization, 'Labels.ShareListShelf.Required', 'This field is required.')"
                                :share-list-cancel="getLabels(localization, 'Labels.ShareListShelf.Cancel', 'Cancel')"
                                :share-list-description="getLabels(localization, 'Labels.ShareListShelf.Description', 'Share the list <em>{listName}</em> to one of your friends and family.')"
                                :share-list-email="getLabels(localization, 'Labels.ShareListShelf.Email', 'Email')"
                                :share-list-email-placeholder="getLabels(localization, 'Labels.ShareListShelf.EmailPlaceholder', 'Enter Email Address')"
                                :share-list-message="getLabels(localization, 'Labels.ShareListShelf.Message', 'Message')"
                                :share-list-message-placeholder="getLabels(localization, 'Labels.ShareListShelf.MessagePlaceholder', 'Hi!\n\nI created this list of fantastic products for you.\n\nJennifer\n\n')"
                                :share-list-send="getLabels(localization, 'Labels.ShareListShelf.Send', 'Send')"
                                :consent-label="getLabels(localization, 'Labels.ShareListShelf.Consent', 'The recipient has agreed to sending this message, including and invitation to learn more about Melaleuca.')"
                                :consent-error="getLabels(localization, 'Labels.ShareListShelf.ConsentError', 'Please check the consent message.')">
                            </m-share-list-form>
                        </template>
                    </a-shelf-toggle>
                </li>

                <li v-if="showAddItemsToBuo && !isCn" class="m-shoplistsActions__item">
                    <button
                        type="button"
                        class="m-shoplistsActions__link"
                        @click="[handleAddItemsToBuo(storedListItems, modalAddItems), gtmTrackAction({id: 173}, $event)]">
                        {{ getLabels(localization, 'Labels.MakeListBackupOrder', 'Make This List my Backup Order') }}
                    </button>
                </li>

                <li v-if="(itemsLoaded && listItems && listItemCount) || (!isCn && (listType === 'SaveForLater'))" class="m-shoplistsActions__item">
                    <button
                        type="button"
                        class="m-shoplistsActions__link"
                        :aria-label="getLabels(localization, 'Labels.AddListToCartAriaLabel') ? replaceToken(getLabels(localization, 'Labels.AddListToCartAriaLabel'), listName) : null"
                        @click="[handleAddItemsToCart(storedListItems, modalAddItems, false, {
                            ListId: listId,
                            ListName: listName,
                            ListType: listType
                        }), gtmTrackAction({id: 173}, $event)]">
                        {{ getLabels(localization, 'Labels.AddListToCart', 'Add This List to Cart') }}
                    </button>
                </li>

                <li v-if="showAddItemsToBuo && isCn" class="m-shoplistsActions__item">
                    <button
                        type="button"
                        class="m-shoplistsActions__link"
                        @click="[handleAddItemsToBuo(storedListItems, modalAddItems), gtmTrackAction({id: 173}, $event)]">
                        {{ getLabels(localization, 'Labels.MakeListBackupOrder', 'Make This List my Backup Order') }}
                    </button>
                </li>

                <li v-if="!isCn" class="m-shoplistsActions__item">
                    <button
                        type="button"
                        class="m-shoplistsActions__link"
                        @click="[printList(), gtmTrackAction({id: 173}, $event)]">
                        {{ getLabels(localization, 'Labels.PrintList', 'Print List') }}
                    </button>
                </li>
                <li class="m-shoplistsActions__item -footer">
                    <button
                        type="button"
                        class="m-shoplistsActions__link"
                        @click="[manageLists(), gtmTrackAction({id: 173}, $event)]">
                        {{ getLabels(localization, 'Labels.ManageLists', 'Manage My Lists') }}
                    </button>
                </li>
            </ul>
        </popup>

        <!-- Modal - Add List to Cart/BUO -->
        <m-add-items-modal
            v-if="listAdded"
            :ref="modalAddItems"
            :is-cn="isCn"
            :is-cart="listAddingType === 'cart'"
            :is-buo="listAddingType === 'buo'"
            :localization="localization"
            :modal-id="modalAddItems"
            @adding-list-hide="closeModal(modalAddItems)">
        </m-add-items-modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import togglePopUpMixin from '../../../mixins/toggle-popup';
    import shoplistsModalMixin from '../../../mixins/shopping-lists-modal';
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MShoplistsActions',
        mixins: [ labels, togglePopUpMixin, shoplistsModalMixin ],
        props: {
            itemsLoaded: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            listId: {
                type: [Number, String],
                default: null
            },
            listName: {
                type: String,
                default: null
            },
            listItemCount: {
                type: Number,
                default: null
            },
            listType: {
                type: String,
                default: null
            },
            sort: {
                type: [Number, String],
                default: null
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                visible: true,
                cancelPopupTrapped: false,
                modalAddItems: 'modal-add-items'
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedListItems']),
            hideShareList() {
                return this.getLabels(this.localization, 'Data.HideShareList', false);
            },
            listItems() {
                return this.storedListItems ? this.storedListItems.filter(item => !item.Removed && !item.MovedTo).length : 0;
            },
            showAddItemsToBuo() {
                const hideMakeListBackupOrder =
                    this.getLabels(this.localization, 'Data.HideMakeListBackupOrder', false);

                if(hideMakeListBackupOrder) return false;

                return (!this.isCn || (this.isCn && this.getLabels(this.localization, 'Data.IsPreferredMember', false))) && this.itemsLoaded && this.listItems && this.listItemCount && this.getLabels(this.localization, 'Data.IsShippingCrossCountry', 'true') === 'false';
            },
            showShareListOption() {
                return !this.hideShareList && this.itemsLoaded && this.listItems && this.listItemCount && this.listType !== 'PurchasedItemsList' && this.listType !== 'SaveForLater';
            }
        },
        methods: {
            replaceToken,
            checkVisibility: function(val) {
                this.visible = val;
            },
            manageLists() {
                this.$emit('manage-lists', true);
            },
            printList() {
                window.print();
            },
            openShareByWmpModal() {
                this.$emit('open-share-by-wmp-modal');
                this.cancelPopupTrapped = true;
            }
        }
    };
</script>
