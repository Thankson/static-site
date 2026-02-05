<template>
    <div class="o-checkoutEditAddressSection">
        <div v-show="!isAddressEditMode">
            <div v-if="hasOneShippingAddress" class="o-checkoutEditAddressSection__frmtAddress pt-3" data-testid="container-addressListContainer">
                <span class="text-base" v-html="addresses[0].FormattedAddress" />
                <button
                    v-if="addresses[0].AddressId"
                    class="o-checkoutEditAddressSection__editDeleteGroup ml-0 pb-0"
                    @click="editThisAddress(addresses[0])"
                >
                    <span class="">{{ editLabel }} </span>
                </button>
            </div>
            <perfect-scrollbar v-else-if="!hasOneShippingAddress && showForGiftOrder" ref="scroll">
                <ul class="o-checkoutEditAddressSection__list pt-3 px-2">
                    <li
                        v-for="(address, index) in addresses"
                        :key="index"
                        class="o-checkoutEditAddressSection__radio">
                        <!-- List should show only Shipping address type-->
                        <div v-if="checkAddressType(address)" @click="checkForIsSelectedAddressInGiftOrder">
                            <m-radio
                                v-model="selectedIndx"
                                name="CheckoutShippingAddress"
                                :input-value="index"
                                label-mods="-ole font-normal pb-0"
                                mods="pr-20 flex-1"
                                @change="newShippingIndex(index)">
                                <div class="o-checkoutEditAddressSection__frmtAddress" data-testid="container-addressListContainer">
                                    <span class="text-base" v-html="address.FormattedAddress" />
                                </div>
                            </m-radio>
                            <div class="o-checkoutEditAddressSection__editDeleteGroup">
                                <button
                                    v-if="showEditButtons(address)"
                                    class="o-checkoutEditAddressSection__button"
                                    data-testid="button-checkoutEditAddressSection_edit"
                                    @click="editThisAddress(address)"
                                >
                                    <span class="">{{ editLabel }} </span>
                                </button>
                                <button
                                    v-if="showDeleteButtons(address)"
                                    class="o-checkoutEditAddressSection__button"
                                    data-testid="button-checkoutEditAddressSection_delete"
                                    @click="openDeleteShippingAddressModal(address)"
                                >
                                    <span class="">{{ deleteLabel }} </span>
                                </button>
                                <button
                                    v-if="address.AddressId && !address.IsDefault && !isRiverbend"
                                    class="o-checkoutEditAddressSection__button"
                                    data-testid="button-checkoutEditAddressSection"
                                    @click="setAsDefaultAddress(address)"
                                >
                                    <span class="">{{ setDefault }} </span>
                                </button>
                            </div>
                        </div>

                    </li>
                </ul>
            </perfect-scrollbar>
        </div>

        <!-- Shipping address form -->
        <div v-if="$slots['default']">
            <slot />
        </div>

        <div v-else class="flex flex-col md:flex-row justify-start items-start md:items-center mt-20">
            <div v-if="showImprovedCTACheckout || enableCvsPickUp">
                <button
                    v-if="showCloseButton"
                    class="a-authorBtn bg-green rounded py-16 px-24 mr-20 mt-20 mb-20 md:mb-0 font-normal md:max-w-1_2"
                    :aria-label="useThisAddressLabel"
                    @click="closeTheSequence()">
                    {{ useThisAddressLabel }}
                </button>
                <button
                    class="a-authorBtn bg-white rounded py-15 px-24 mt-20 md:mr-100 md:max-w-1_2"
                    :aria-label="addNewAddress"
                    @click="addNewShippingAddress()">
                    {{ addNewAddress }}
                </button>
            </div>
            <div v-else class="mt-20">
                <button
                    class="a-authorBtn bg-green rounded py-16 px-12 mr-20 mb-20 md:mb-0 font-normal"
                    @click="addNewShippingAddress()">
                    {{ addNewAddress }}
                </button>
                <button
                    v-if="showCloseButton"
                    class="a-authorBtn bg-white rounded py-15 px-30"
                    @click="closeTheSequence()">
                    {{ closeLabel }}
                </button>
            </div>
        </div>

        <modal id="confirm-delete-shipping-address" heading-class="o-acctCardSection__modalHeading">
            <template v-slot:heading>
                {{ modalLabelsDeleteAddr.DeleteAddressHeading }}
            </template>

            <template v-slot:body>
                <p class="o-acctCardSection__modalDesc">{{ modalLabelsDeleteAddr.DeleteAddressDetails }}</p>
            </template>

            <template v-slot:footer>
                <div class="o-acctCardSection__modalFooter">
                    <div class="o-acctCardSection__modalBtn -secondary">
                        <v-button v-modal-hide class="-white -full">{{ modalLabelsDeleteAddr.Cancel }}</v-button>
                    </div>

                    <div class="o-acctCardSection__modalBtn -primary">
                        <v-button class="-green -full" @click="onDeletedShippingAddress()">{{ modalLabelsDeleteAddr.Delete }}</v-button>
                    </div>
                </div>
            </template>
        </modal>

        <modal id="selected-shipping-address" heading-class="o-acctCardSection__modalHeading">
            <template v-slot:heading>
                {{ modalLabelsDeleteAddr.DeleteAddressSelectedHeading }}
            </template>
            <template v-slot:body>
                <p class="o-acctCardSection__modalDesc">{{ modalLabelsDeleteAddr.DeleteAddressSelectedDetails }}</p>
            </template>
            <template v-slot:footer>
                <div class="o-acctCardSection__modalBtn">
                    <v-button v-modal-hide class="-green -full">{{ modalLabelsDeleteAddr.DeleteAddressSelectedAction }}</v-button>
                </div>
            </template>
        </modal>

        <!-- Cross Country Modal -->
        <modal id="modal-cross-country-shipping-address" width="630px">
            <template v-slot:heading>
                <div
                    class="m-rte"
                    v-html="crossCountryModalRTE">
                </div>
            </template>

            <template v-slot:footer>
                <div class="mt-30 w-full md:flex">
                    <v-button
                        v-modal-hide
                        type="button"
                        class="a-button -white block font-medium mb-20 py-12 text-base text-center w-full md:mb-0 md:mr-10 md:px-60 md:w-auto"
                    >
                        {{ cancelLabel }}
                    </v-button>
                    <button
                        type="button"
                        class="a-button block font-medium py-12 text-base text-center w-full md:px-20 md:w-auto"
                        @click="continueCrossCountryAddress()"
                    >
                        {{ crossCountryModalContinue }}
                    </button>
                </div>
            </template>
        </modal>
    </div>

</template>

<script>
    import { mapActions, mapMutations, mapGetters, mapState } from 'vuex';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
    import * as addressTypes from '../../../utils/address-types';

    export default {
        name: 'OCheckoutEditAddressOnFile',
        components: {

        },
        props: {
            addNewAddress: {
                type: String,
                default: ''
            },
            addresses: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            cancelLabel: {
                type: String,
                default: ''
            },
            closeLabel: {
                type: String,
                default: ''
            },
            continueToSite: {
                type: String,
                default: ''
            },
            deleteLabel: {
                type: String,
                default: ''
            },
            editLabel: {
                type: String,
                default: ''
            },
            enableCvsPickUp: {
                type: Boolean,
                default: false
            },
            formattedAddress: {
                type: String,
                default: ''
            },
            isGiftOrder: {
                type: Boolean,
                default: false
            },
            modalLabelsDeleteAddr: {
                type: Object,
                default: () => {
                    return {
                        'DeleteAddressHeading': 'Are you sure?',
                        'DeleteAddressDetails': 'Deleting this saved address cannot be undone.',
                        'DeleteAddressDefaultHeading': 'Sorry.',
                        'DeleteAddressDefaultDetails': 'You cannot delete a Default Address. Edit another address and make it the default.',
                        'DeleteAddressSelectedHeading': 'Sorry.',
                        'DeleteAddressSelectedDetails': 'The selected shipping address can not be deleted. Please choose a different shipping address.',
                        'DeleteAddressSelectedAction': 'Choose another address',
                        'Cancel': 'cancel',
                        'Delete': 'delete'
                    };
                }
            },
            isAddressEditMode: {
                type: Boolean,
                default: false
            },
            rteDescription: {
                type: String,
                default: ''
            },
            selectedIndex: {
                type: Number,
                default: 0
            },
            setDefault: {
                type: String,
                default: ''
            },
            showImprovedCTACheckout: {
                type: Boolean,
                default: false
            },
            useThisAddressLabel: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                addressToDelete: {},
                isFirstLoadWithGiftOrder: false,
                showForGiftOrder: true
            };
        },
        computed: {
            ...mapGetters('shippingAddress', ['crossCountryAddress']),
            ...mapState('checkout', ['isRiverbend', 'selectedShippingAddressId']),

            acceptedTypes() {
                if(this.isRiverbend) {
                    return [this._shippingAddressType, this._riverbendAddressType];
                } else {
                    return [this._shippingAddressType];
                }
            },
            crossCountryModalRTE() {
                return this.replaceTokenArray(
                    this.rteDescription,
                    [this.crossCountryAddress?.CountryDisplayName, this.currentDefaultAddress?.CountryDisplayName]
                );
            },
            crossCountryModalContinue() {
                return this.replaceTokenArray(
                    this.continueToSite,
                    [this.crossCountryAddress?.CountryDisplayName]
                );
            },
            hasOneShippingAddress() {
                if(this.isGiftOrder) return false;
                if(this.isRiverbend) {
                    return this.addresses.filter(address => this.checkAddressType(address)).length === 1;
                } else {
                    return this.addresses.filter(address => address.AddressType === this._shippingAddressType).length === 1;
                }
            },
            selectedIndx: {
                get() {
                    return this.selectedIndex;
                },
                set(val) {
                    return val;
                }
            },
            showCloseButton() {
                // if we're in the gift+improved flow, always show it
                if(this.isGiftOrder && (this.showImprovedCTACheckout || this.enableCvsPickUp)) {
                    return true;
                }
                return !this.isFirstLoadWithGiftOrder;
            },
            showCrossCountryModal() {
                return this.crossCountryAddress;
            }
        },
        watch: {
            showCrossCountryModal(newValue) {
                if(newValue) {
                    this.$modal.show({
                        id: 'modal-cross-country-shipping-address'
                    });
                }
            }
        },
        mounted() {
            if(this.isGiftOrder) {
                this.setGiftOrderView();
            }
        },
        created() {
            // non-reactive prop for shipping address type string
            this._shippingAddressType = addressTypes.shipping;
            this._riverbendAddressType = addressTypes.riverbend;
        },
        methods: {
            ...mapActions('shippingAddress', ['deleteAddress', 'setDefaultAddress', 'setDefaultCrossCountryAddress']),
            ...mapMutations('shippingAddress', ['SET_CROSS_COUNTRY_ADDRESS']),
            replaceTokenArray,

            addNewShippingAddress() {
                this.$emit('openShippingAddForm');
            },
            checkAddressType(address) {
                return this.acceptedTypes.includes(address.AddressType);
            },
            checkForIsSelectedAddressInGiftOrder(e) {
                if(e.target.name === 'CheckoutShippingAddress' && Number(e.target.value) === Number(this.selectedIndx) && this.isGiftOrder) {
                    this.closeTheSequence();
                    this.$emit('setShowShippingTaxesTotal', true);
                }
            },
            closeTheSequence() {
                this.$emit('closeAddressSequence');
            },
            async continueCrossCountryAddress() {
                this.$modal.hide({ id: 'modal-cross-country-shipping-address' });
                this.setDefaultCrossCountryAddress({
                    AddressId: this.crossCountryAddress.AddressId,
                    Country: this.crossCountryAddress.Country
                });
            },
            editThisAddress(address) {
                this.$emit('openShippingAddForm', address);
            },
            newShippingIndex(index) {
                this.$emit('newShippingIndex', index);
            },
            onDeletedShippingAddress: function() {
                this.$modal.hide();
                this.deleteAddress(this.addressToDelete.AddressId);
            },
            openDeleteShippingAddressModal(address) {
                this.addressToDelete = address;
                let selectedAddressId = this.addresses[this.selectedIndx]?.AddressId;
                if(selectedAddressId === undefined) {
                    selectedAddressId = this.addresses.find(a => a.AddressId === this.selectedShippingAddressId);
                }
                if(address.AddressId === selectedAddressId) {
                    this.$modal.show({id: 'selected-shipping-address'});
                } else {
                    this.$modal.show({id: 'confirm-delete-shipping-address'});
                }
            },
            async setAsDefaultAddress(address) {
                // If the selected address is from another country
                if(address.WithinCurrentCountry === false) {
                    this.SET_CROSS_COUNTRY_ADDRESS({
                        AddressId: address.AddressId,
                        Country: address.Country,
                        CountryDisplayName: address.CountryDisplayName
                    });

                // If the selected address is from user's country
                } else {
                    await this.setDefaultAddress(address);
                    this.selectedIndx = 0;
                    this.newShippingIndex(0);
                }
            },
            setGiftOrderView() {
                this.isFirstLoadWithGiftOrder = true;
                this.showForGiftOrder = false;
            },
            setNonGiftOrderView() {
                this.showForGiftOrder = true;
                this.isFirstLoadWithGiftOrder = false;
            },
            setShowForGiftOrder(value) {
                this.showForGiftOrder = value;
            },
            showDeleteButtons(address) {
                if(address.IsDefault) return false;
                return address.AddressId && address.AddressType !== this._riverbendAddressType;
            },
            showEditButtons(address) {
                return address.AddressId && address.AddressType !== this._riverbendAddressType;
            },
            updateScroll() {
                this.$refs.scroll?.update();
            }
        }
    };
</script>
