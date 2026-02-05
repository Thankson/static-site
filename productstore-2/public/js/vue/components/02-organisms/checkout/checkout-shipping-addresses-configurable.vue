<template>

    <div class="o-shippingAddressCheckout">
        <button v-if="showSelectButton && isGiftOrder" class="o-shippingAddressCheckout__buttonLink" @click="showAddresses">{{ getLocalizationProp('Labels.ShippingSection.SelectShippingAddress') }}</button>
        <div v-if="showAddressEditView">
            <OCheckoutEditAddressOnFile
                ref="shippingAddressList"
                :edit-label="getLocalizationProp('Labels.Checkout.Edit')"
                :delete-label="getLocalizationProp('Labels.Checkout.Delete')"
                :is-gift-order="isGiftOrder"
                :set-default="getLocalizationProp('Labels.Checkout.SetDefault')"
                :cancel-label="getLocalizationProp('Data.CrossCountryModal.Cancel')"
                :close-label="getLocalizationProp('Labels.Checkout.Close')"
                :add-new-address="getLocalizationProp('Data.Checkout.AddShippingAddressLink.Text')"
                :rte-description="getLocalizationProp('Data.CrossCountryModal.RteDescription')"
                :continue-to-site="getLocalizationProp('Data.CrossCountryModal.ContinueToSite')"
                :error-aria-label="getLocalizationProp('Labels.Checkout.ErrorAriaLabel.ShippingAddresses', 'Error attention required')"
                :modal-labels-delete-addr="modalLabelsDeleteAddr"
                :selected-index="selectedIndex"
                :addresses="addresses"
                :formatted-address="formattedAddress"
                :show-improved-c-t-a-checkout="getLocalizationProp('Data.ShowImprovedCTACheckout')"
                :is-address-edit-mode="isAddressEditMode"
                :use-this-address-label="getLocalizationProp('Labels.ShippingSection.UseThisAddress')"
                :enable-cvs-pick-up="enableCvsPickUp"
                @openShippingAddForm="setAddNewAddressView"
                @closeAddressSequence="closeThisForm"
                @newShippingIndex="setNewShippingAddress"
                @setShowShippingTaxesTotal="$emit('setShowShippingTaxesTotal')"
            >
                <template v-if="openAddEditAddressForm">
                    <component
                        :is="addressFormComponentByCountry"
                        ref="editAddress"
                        :is-gift-order="isGiftOrder"
                        :is-in-checkout="true"
                        :is-address-edit-mode="isAddressEditMode"
                        :is-add-new-address-form="isAddNewAddressForm"
                        :is-riverbend-subscription="isRiverbendSubscription"
                        :mx-address-entry-enhancement-enabled="mxAddressEntryEnhancementEnabled"
                        :script-id="scriptId"
                        :show-business-add-form="false"
                        :show-cancel-button="showCancelButton"
                        :show-address-edit-view="showAddressEditView"
                        :has-make-default-checkbox="true"
                        :prefilled-edit-address-field="prefilledEditAddressField"
                        @addressPromptData="emitAddressPromptData"
                        @completeThisStatus="closeThisForm"
                        @getCheckoutDataAgain="getDataAgain"
                        @closeAddEditAddressForm="setAddressListMode"
                    />
                </template>
            </OCheckoutEditAddressOnFile>
        </div>

        <!-- #region When no address on file -->
        <div v-if="!showAddressEditView">
            <!-- the saved shipping-address on file to be shown when sequence open -->
            <div v-if="(formattedAddress && isShippingAddress) && !isGiftOrder">
                <div class="o-shippingAddressCheckout__address format" data-testid="container-addressContainer" v-html="updatedAddress"></div>
                <div><button class="o-shippingAddressCheckout__buttonLink -save" @click="[openAddressEditDelete(), gtmTrackAction({id: 453, text: 'Shipping Address'}, $event)]">
                    {{ getLocalizationProp('Labels.ShippingSection.Change', 'Change') }}</button></div>
            </div>

            <div
                class="o-shippingAddressCheckout__new"
                :class="'-' + chosenCountry"
            >
                <!-- Shipping Address form -->
                <div v-show="(showShippingAddForm && !specialImeaScenerio)">
                    <o-checkout-add-address
                        ref="addAddress"
                        :is-in-checkout="true"
                        :script-id="scriptId"
                        :has-business-address-checkbox-on-ole="hasBusinessAddressCheckboxOnOle"
                        :show-business-add-form="showBusinessAddForm"
                        :show-shipping-add-form="showShippingAddForm"
                        :has-shipping-address="hasShippingAddress"
                        :has-business-address="hasBusinessAddress"
                        :mx-address-entry-enhancement-enabled="mxAddressEntryEnhancementEnabled"
                        :set-first-ship-address-as-default="setFirstShipAddressAsDefault"
                        @setAddressForm="setActiveAddresForm"
                        @completeThisStatus="closeThisForm"
                        @getCheckoutDataAgain="getDataAgain"
                    ></o-checkout-add-address>
                </div>

                <!-- Business Address checkbox -->
                <div v-if="setCheckBox">
                    <m-checkbox
                        ref="businessAddCheckBox"
                        v-model="sameBusinessShippingAddress"
                        label-mods="text-base font-normal"
                        class="o-shippingAddressCheckout__checkbox"
                        name="sameBusinessShippingAddress"
                        :label="getLocalizationProp('Labels.ShippingSection.BusinessAddressCheckbox', 'Same')"
                        @input="gtmTrackAction({id: 451, text: getLocalizationProp('Labels.ShippingSection.BusinessAddressCheckbox')}, $event)"
                    >
                    </m-checkbox>
                    <div class="o-shippingAddressCheckout__disclaimer">{{ getLocalizationProp('Labels.ShippingSection.BusinessAddressCheckboxDisclaimer', 'Your business address will be used to send commission checks, awards, and invitations to events.') }}</div>
                </div>

                <!-- Business Address Continue -->
                <div v-if="isThisToContinue" class="o-shippingAddressCheckout__continue">
                    <button class="o-addressForm__button -save" data-testid="button-addNewAddressSaveBtn" @click="[checkBusinessAddressSame($event), gtmTrackAction({id: 452, text: getLocalizationProp('Labels.CTA.Continue', 'Save')}, $event)]">
                        {{ getLocalizationProp('Labels.CTA.Continue', 'Save') }}
                    </button>
                </div>

                <!-- Business Address form -->
                <div v-show="showBusinessAddForm">
                    <o-checkout-add-address
                        ref="businessAddress"
                        :is-in-checkout="true"
                        :is-business="true"
                        :business-address-id="addressId"
                        :script-id="scriptId"
                        :show-business-add-form="showBusinessAddForm"
                        :show-shipping-add-form="showShippingAddForm"
                        :mx-address-entry-enhancement-enabled="mxAddressEntryEnhancementEnabled"
                        :has-business-address-checkbox-on-ole="hasBusinessAddressCheckboxOnOle"
                        @getCheckoutDataAgain="getDataAgain"
                        @completeThisStatus="closeThisForm"
                    ></o-checkout-add-address>
                </div>
            </div>
        </div>
        <!-- #endregion When no address on file-->

        <AddressPromptModal
            ref="addressPrompt"
            :cancel-label="labelCancel"
            :confirm-label="labelConfirm"
            :desc-label="labelDesc"
            :is-prompt-enabled="isDefaultPaymethodAddressPromptEnabled"
            :ok-label="labelOk"
            :title-label="labelTitle"
            :updated-label="labelUpdated"
        />

    </div>

</template>

<script>
    import OCheckoutAddAddress from '../../02-organisms/checkout/checkout-add-address.vue';
    import OCheckoutAddAddressEurope from '../../02-organisms/checkout/checkout-add-address-europe.vue';
    import OCheckoutAddAddressTaiwan from '../../02-organisms/checkout/checkout-add-address-taiwan.vue';
    import OCheckoutEditAddressOnFile from '../../02-organisms/checkout/checkout-edit-address-on-file.vue';
    import addressFormLogic from '../../../mixins/address-form';
    import AddressPromptModal from '../../02-organisms/modals/address-paymethod-prompt.vue';
    import {mapState, mapMutations, mapActions, mapGetters } from 'vuex';
    import apiUpdate from '@api/routes/customeraccount/updateaddress';
    import api from '@api/routes/customeraccount/addaddress';
    import * as addressTypes from '../../../utils/address-types';
    import { compareAddress } from '../../../utils/format-address.js';

    export default {
        name: 'OCheckoutShippingAddressesConfigurable',
        components: {
            AddressPromptModal,
            OCheckoutAddAddress,
            OCheckoutAddAddressEurope,
            OCheckoutAddAddressTaiwan,
            OCheckoutEditAddressOnFile
        },
        mixins: [addressFormLogic],
        props: {
            enableCvsPickUp: {
                type: Boolean,
                default: false
            },
            isFirstTimeCheckout: {
                type: Boolean,
                default: false
            },
            isGuest: {
                type: Boolean,
                default: false
            },
            isGiftOrder: {
                type: Boolean,
                default: false
            },
            mxAddressEntryEnhancementEnabled: {
                type: Boolean,
                default: false
            },
            sequenceIndex: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                addressesMatchedForPrompt: [],
                busAddressId: 0,
                isAddNewAddressForm: true,
                isAddressEditMode: false,
                isAddressListView: false,
                isBusinessAddress: false,
                isShippingAddress: false,
                isShippingAddressSaved: false,
                isShippingBusinesSame: false,
                lastShippingAddress: {},
                newAddresses: {'shipping': '', 'business': ''},
                openAddEditAddressForm: false,
                openShippingAddForm: false,
                prefilledEditAddressField: {},
                sameBusinessShippingAddress: null,
                selectedIndex: null,
                setCheckBox: null,
                setFirstShipAddressAsDefault: false,
                showAddressEditViewGift: false,
                showCancelButton: true,
                showSelectButton: false,
                specialCaseCounter: 0

            };
        },
        computed: {
            ...mapState('checkout', ['selectedShippingAddressId', 'crossCountryOldAddressIndex', 'selectedCrossCountry', 'isRiverbend']),
            ...mapGetters('checkoutAccordions', ['onExpandShippingAddress']),
            ...mapGetters('shippingAddress', ['addressMatches']),
            addressFormComponentByCountry() {
                // Large component that handles AT, BE, DE, EE, ES, FI, HU, IE, IT, LT, LV, LU, NL, PL and UK
                if(this.isEurope) return 'OCheckoutAddAddressEurope';
                else if(this.isTaiwan) return 'OCheckoutAddAddressTaiwan';
                // Original component that handles US, CA, MX, AU, and NZ
                else return 'OCheckoutAddAddress';
            },
            defaultAddress() {
                return this.addresses?.find(addr => addr?.IsDefault);
            },
            formattedAddress() {
                const formattedAddress = (this.selectedIndex !== null) ? this.addresses[this.selectedIndex]?.FormattedAddress : '';
                return formattedAddress;
            },
            // checkbox visibility
            hasBusinessAddressCheckboxOnOle() {
                return !this.hasBusinessAddress && this.hasImea && !this.isRiverbend;
            },
            isDefaultPaymethodAddressPromptEnabled() {
                return this.getLocalizationProp('Data.FeatureFlag.PaymethodAddressPrompt') || this.getLocalizationProp('Data.RiverbendPaymethodAddressPrompt');
            },
            isThisToContinue() {
                return this.sameBusinessShippingAddress;
            },
            labelCancel() {
                return this.getPromptLabel('ChangeOne');
            },
            labelConfirm() {
                return this.getPromptLabel('ChangeBoth');
            },
            labelDesc() {
                return this.getPromptLabel('Description');
            },
            labelOk() {
                return this.getPromptLabel('Ok') || 'Ok';
            },
            labelTitle() {
                return this.getPromptLabel('Title');
            },
            labelUpdated() {
                return this.getPromptLabel('Updated');
            },
            showAddressEditViewComputed() {
                return this.showAddressEditView || this.showAddressEditViewGift;
            },
            updatedAddress() {
                if(this.newAddresses.shipping) {
                    return this.newAddresses.shipping;
                } else { return this.formattedAddress; }
            },
            specialImeaScenerio() {
                return (this.hasImea && this.isShippingAddress && !this.isBusinessAddress);
            },
            modalLabelsDeleteAddr() {
                return {
                    ...this.getLocalizationProp('Labels.DeleteAddressModal', {}),
                    ManageAddresses: this.getLocalizationProp('Data.Checkout.ManageShippingAddressLink.Text', ''),
                    ManageAddressUrl: this.getLocalizationProp('Data.Checkout.ManageShippingAddressLink.Url', '')
                };
            },
            getCountry() {
                return (this.selectedIndex !== null && this.addresses.length && this.addresses[this.selectedIndex]) ? this.addresses[this.selectedIndex].Country : '';
            },
            updateShippingOptionFeatureFlag() {
                return this.getLocalizationProp('Data.UpdateShippingOptionFeatureFlag');
            }
        },
        watch: {
            defaultAddress(newValue, oldValue) {
                const riverbendAddress = this.addresses.find(addr => addr?.AddressType === 'RiverbendAddress');
                if(!newValue || !oldValue) return;
                if(this.isDefaultPaymethodAddressPromptEnabled &&
                    riverbendAddress &&
                    !compareAddress(newValue, oldValue, this.$env.Country) &&
                    !this.isRiverbend &&
                    !compareAddress(newValue, riverbendAddress)) {
                    this.$refs?.addressPrompt.show(newValue, [riverbendAddress]);
                }
            },
            sameBusinessShippingAddress() {
                this.setBusinessAddView();
            },

            showBusinessAddForm(newVal) {
                if(newVal) {
                    this.setCheckBox = true;
                    this.sameBusinessShippingAddress = false;
                }
            },
            addresses(newValue, oldValue) {
                this.watchedAddressWork(newValue);
            },
            // for outer sequence view
            formattedAddress(newValue) {
                if(newValue) {
                    this.setSelectedTitle({
                        index: this.sequenceIndex,
                        selectedTitle: `<div class="o-shippingAddressCheckout__address">${newValue}</div>`
                    });
                }
            },
            getCountry() {
                this.SET_COUNTRY(this.getCountry);
            },
            isGiftOrder(newValue) {
                if(newValue) {
                    this.showEditAddressOnGiftOrderLoad();
                }
            },
            crossCountryOldAddressIndex() {
                if(this.crossCountryOldAddressIndex > -1 && this.selectedCrossCountry) {
                    this.SET_SELECTED_CROSS_COUNTRY(false);
                    this.selectedIndex = this.crossCountryOldAddressIndex;
                    this.$store.commit('checkout/SET_CROSS_COUNTRY_OLD_ADDRESS_INDEX', null);
                }
            },
            openAddEditAddressForm(newVal) {
                this.$emit('isAddressFormOpen', newVal);
            },
            prefilledEditAddressField(newVal) {
                if(this.isDefaultPaymethodAddressPromptEnabled) {
                    let excludeFields;
                    if(this.isRiverbend) {
                        excludeFields = ['RiverbendAddress'];
                    } else {
                        excludeFields = ['ShippingAddress', 'BusinessAddress'];
                    }
                    const addressesMatchedForPrompt = this.addressMatches(newVal, this.$env.Country, excludeFields);
                    this.addressesMatchedForPrompt = addressesMatchedForPrompt.map(address => ({...address}));
                }
            },
            selectedIndex(newValue, oldValue) {
                const currentAddress = this.addresses[this.selectedIndex];
                if(this.updateShippingOptionFeatureFlag) {
                    // Used for CN float banner show the ship address
                    this.$emit('updateShipAddress', currentAddress);
                }

                if(this.selectedIndex !== null && (this.selectedShippingAddressId !== currentAddress?.AddressId)) {
                    // If the selected address is from another country
                    if(currentAddress?.WithinCurrentCountry === false) {
                        this.SET_SELECTED_CROSS_COUNTRY(true);
                        this.$emit('cross-country-address', {
                            newAddress: currentAddress,
                            oldAddress: this.addresses[oldValue],
                            oldAddressIndex: oldValue
                        });

                    // If the selected address is from user's country
                    } else {
                        this.emitUpdateAddress();
                    }
                }
            },
            selectedShippingAddressId() {
                const addressIndex = this.addresses.findIndex((address) => address.AddressId === this.selectedShippingAddressId);
                if(addressIndex > -1) {
                    this.selectedIndex = addressIndex;
                }
            }
        },
        created() {
            this.onExpandShippingAddress(this.validateShipping);
        },
        mounted() {
            if(this.isGiftOrder) {
                this.showEditAddressOnGiftOrderLoad();
                this.selectedIndex = null;
            }
        },
        methods: {
            ...mapActions('sequentialSections', ['setSelectedTitle']),
            ...mapMutations('checkout', ['SET_SELECTED_CROSS_COUNTRY', 'SET_COUNTRY']),

            completedStatus(newValue) {
                //  whether to close/open sequence
                if((newValue.length === 0 || newValue[0] === undefined)) {
                    this.setFirstShipAddressAsDefault = true;
                    this.$emit('completedStatus', {completed: false, isEmpty: true, index: this.sequenceIndex, loading: false, isActive: true});
                } else if(this.specialCaseCounter === 0 && (this.isBusinessAddress && !this.isShippingAddress)) {
                    this.setFirstShipAddressAsDefault = true;
                    this.$emit('completedStatus', {completed: false, isEmpty: true, index: this.sequenceIndex, loading: false, isActive: true});
                } else if(!this.showBusinessAddForm && !this.specialImeaScenerio) {
                    this.$emit('completedStatus', {completed: true, isEmpty: false, index: this.sequenceIndex, loading: false});
                }

                // increase the counter for some scenarios to not run again after initial load
                this.specialCaseCounter += 1;
            },
            closeThisForm() {
                if(this.openAddEditAddressForm) {
                    this.openAddEditAddressForm = false;
                    this.isAddressEditMode = false;
                }
                this.$emit('completedStatus', {completed: true, index: this.sequenceIndex, isActive: false, isEmpty: false, loading: false});
            },
            emitAddressPromptData(data) {
                if(this.isDefaultPaymethodAddressPromptEnabled && !this.isRiverbend && this.addressesMatchedForPrompt.length) {
                    this.$refs?.addressPrompt.show(data, this.addressesMatchedForPrompt);
                }
            },
            getPromptLabel(label) {
                if(this.isRiverbendSubscription) {
                    let remappedLabel;
                    switch (label) {
                        case 'ChangeOne':
                            remappedLabel = 'AddressPromptCancel';
                            break;
                        case 'ChangeBoth':
                            remappedLabel = 'AddressPromptConfirm';
                            break;
                        case 'Description':
                            remappedLabel = 'AddressPromptText';
                            break;
                        case 'Ok':
                            remappedLabel = 'AddressPromptOk';
                            break;
                        case 'Title':
                            remappedLabel = '';
                            break;
                        case 'Updated':
                            remappedLabel = 'AddressPromptUpdated';
                            break;
                        default:
                            remappedLabel = '';
                    }
                    return this.getLocalizationProp(`Labels.ShippingSection.${remappedLabel}`);
                }
                const objPrompt = this.isRiverbend ? 'RBPrompt' : 'NSEPrompt';
                return this.getLocalizationProp(`Labels.AddressPaymethodPromptModel.${objPrompt}.${label}`);
            },
            setActiveAddresForm(e) {
                this.isShippingAddressSaved = true;
                this.$emit('setAddressFormProps', e);
            },
            getDataAgain(isBusiness, newAddressId) {
                this.$emit('getDataAgain', isBusiness, newAddressId);
            },
            setBusinessAddView() {
                // hide business address form if checkbox checked again on business address form
                if(this.setCheckBox) {
                    if(this.sameBusinessShippingAddress) {
                        this.$emit('setAddressFormProps', {shippingAddressForm: false, businessAddressForm: false});
                    } else if(!this.sameBusinessShippingAddress) {
                        this.$emit('setAddressFormProps', {shippingAddressForm: false, businessAddressForm: true});
                    }
                }
            },
            setNonGiftOrderView() {
                this.$refs['editAddress']?.clearFields();
                this.showCancelButton = true;
                this.showSelectButton = false;
                this.$refs['shippingAddressList']?.setNonGiftOrderView();
                this.openAddEditAddressForm = false;
            },
            showEditAddressOnGiftOrderLoad() {
                this.openAddEditAddressForm = true;
                this.showCancelButton = false;
                this.showSelectButton = true;
                this.$refs['shippingAddressList']?.setGiftOrderView();
                this.$refs['editAddress']?.clearNameField();
            },
            showAddresses() {
                this.$refs['shippingAddressList']?.setShowForGiftOrder(true);
                this.showCancelButton = true;
                this.openAddEditAddressForm = false;
                this.showSelectButton = false;
            },
            openAddressEditDelete() {
                // open address edit/delete flow
                this.$emit('openAddressEditDelete');
            },
            checkBusinessAddressSame(e) {
                this.updateShipToBusAddress(this.lastShippingAddress);
            },

            // For OLE checkout flow - Business address case
            async updateShipToBusAddress(lastShippingAddress) {
                const addressApiRequest = {...lastShippingAddress,
                                           'AddressId': this.addressId || 0,
                                           'AddressType': addressTypes.business};
                const response = this.addressId === 0 ? await api.post(addressApiRequest) : await apiUpdate.post(addressApiRequest);
                if(response.success && response.data.Success) {
                    this.isLoadingSubmitForm = false;
                    this.listError = [];
                    this.$emit('shippingAndBusinessAddress', this.newAddresses = {});
                    this.$emit('completedStatus', {completed: true, index: this.sequenceIndex, isActive: false, isEmpty: false});
                    this.getDataAgain(true);
                } else {
                    this.isLoadingSubmitForm = false;
                    this.listApiErrors(response);
                }
            },
            // get the address types on file
            setCustomerAddressStatus(newValue) {
                if(this.isInCheckout) {
                    newValue = this.addresses.filter((address) => address?.AddressType !== addressTypes.riverbend);
                }
                if(newValue.length > 0 && newValue[0] !== undefined) {
                    // set selected index as of the current shipping address
                    const addressIndex = this.addresses?.findIndex(address => address.AddressId === this.selectedShippingAddressId);
                    const fallBackIndex = this.isGiftOrder ? null : 0;
                    this.selectedIndex = addressIndex > -1 ? addressIndex : fallBackIndex;
                    // check available address-types of user
                    this.addresses?.forEach((item) => {
                        if(!this.isBusinessAddress && item.AddressType === addressTypes.business) {
                            this.isBusinessAddress = true;
                        }
                        if(!this.isShippingAddress && item.AddressType === addressTypes.shipping) {
                            this.isShippingAddress = true;
                        }
                    });
                    this.$emit('hasAddresses', this.isShippingAddress, this.isBusinessAddress);
                }
                // special case of checkbox when yesShipping, noBusiness, yesIMEA
                if(this.specialCaseCounter === 0 && !this.isRiverbend) {
                    if(this.specialImeaScenerio) {
                        this.setCheckBox = true;
                        this.sameBusinessShippingAddress = true;
                        this.$emit('completedStatus', {completed: false, isEmpty: true, index: this.sequenceIndex, loading: false, isActive: true});
                    }
                }
                this.completedStatus(newValue);
            },
            setAddNewAddressView(address) {
                this.prefilledEditAddressField = address;
                this.openAddEditAddressForm = true;
                // when add new address flow
                this.isAddNewAddressForm = address === undefined;
                // when edit existing address flow
                this.isAddressEditMode = address !== undefined;
            },
            setAddressListMode() {
                this.openAddEditAddressForm = false;
                this.isAddressEditMode = false;
            },
            setNewShippingAddress(newVal) {
                this.selectedIndex = newVal;
            },
            emitUpdateAddress() {
                this.SET_SELECTED_CROSS_COUNTRY(false);
                this.$emit('update', {
                    Country: this.addresses?.[this.selectedIndex]?.Country,
                    LastVerifiedDateTime: this.addresses[this.selectedIndex]?.LastVerifiedDateTime,
                    ShippingAddressId: this.addresses?.[this.selectedIndex]?.AddressId,
                    WarehouseGroupName: this.addresses?.[this.selectedIndex]?.WarehouseGroupName,
                    WithinCurrentCountry: this.addresses?.[this.selectedIndex]?.WithinCurrentCountry
                });
            },
            updateScroll() {
                this.$refs.shippingAddressList?.updateScroll?.();
            },
            validateShipping() {
                this.$refs?.['addAddress']?.$v?.$touch();
                this.$refs?.['editAddress']?.$v?.$touch();
                this.$refs?.['businessAddress']?.$v?.$touch();
            },
            watchedAddressWork(newValue) {
                this.setCustomerAddressStatus(newValue);
                //  when shipping address and business address entered different by the user
                if(this.formattedAddress) {
                    if(this.addresses[0]?.AddressType === addressTypes.shipping) {
                        this.lastShippingAddress = this.addresses[0];
                        this.newAddresses.shipping = this.formattedAddress;
                    }
                    if(this.addresses[0]?.AddressType === addressTypes.business) {
                        this.addressId = this.addresses[0]?.AddressId;
                        this.newAddresses.business = this.formattedAddress;
                    }
                    if(this.addresses[0]?.AddressType === addressTypes.riverbend) {
                        this.lastShippingAddress = this.addresses[0];
                        this.newAddresses.shipping = this.formattedAddress;
                    }
                    // emit to display both the addresses
                    this.$emit('shippingAndBusinessAddress', this.newAddresses);
                }
            }
        }
    };
</script>
