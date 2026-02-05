import { mapActions, mapState } from 'vuex';
import formHelper from '@common/source/js/vue/utils/form-helper';
import getCountryCode from '@common/source/js/utils/get-country-code';
import addAddressApi from '@api/routes/customeraccount/addaddress';
import { createFormattedAddress } from '../utils/format-address';

const EUROPE = ['austria', 'belgium', 'estonia', 'finland', 'germany', 'hungary', 'ireland', 'italy', 'latvia', 'lithuania', 'luxembourg', 'netherlands', 'poland', 'spain', 'unitedkingdom'];

export default {
    props: {
        hasBusinessAddressCheckboxOnOle: {
            type: Boolean,
            default: false
        },
        businessAddressId: {
            type: Number,
            default: 0
        },
        isAddNewAddressForm: {
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
        showAddressEditView: {
            type: Boolean,
            default: false
        },
        showCancelButton: {
            type: Boolean,
            default: true
        },
        prefilledEditAddressField: {
            type: Object,
            default: () => ({})
        },
        setFirstShipAddressAsDefault: {
            type: Boolean,
            default: false
        },
        isAddressEditMode: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            sameBusinessShippingAddress: true,
            prefilledMxState: ''
        };
    },
    computed: {
        ...mapState('riverbendSubscription', ['isRiverbend']),
        countryBusinessClass() {
            return this.showBusinessAddForm ? '-isBusinessAddress' : '';
        },
        deliveryInstructionsMaxLength() {
            // If deliveryInstructions max char is not defined in form-helper.js for the selected
            // country (US and CA), use default.shortDeliveryInstructions. Otherwise, use the deliveryInstructions
            // value for the selected country.
            return formHelper.maxChar[getCountryCode(this.chosenCountry)?.toLowerCase()]?.deliveryInstructions || formHelper.maxChar.default.shortDeliveryInstructions;
        },
        getButtonText() {
            return this.isAddNewAddressForm ? this.getLocalizationProp('Labels.CTA.Save', 'Save') : this.getLocalizationProp('Labels.CTA.Continue', 'Continue');
        },
        heading() {
            if(this.showBusinessAddForm) {
                return this.getLocalizationProp('Labels.ShippingSection.AddBusinessAddresss', 'Add Business Address');
            }

            if(this.isAddNewAddressForm) {
                return this.getLocalizationProp('Labels.ShippingSection.NewDeliveryAddress', 'New Delivery Address');
            }

            return '';
        },
        showMxAddressEntryEnhancementFields() {
            return this.isMexico && this.mxAddressEntryEnhancementEnabled;
        },
        showAreaCn() {
            return this.showFields.includes('areaCn');
        },
        showState() {
            return this.showFields.includes('state');
        },
        showProvince() {
            return this.showFields.includes('province');
        },
        showStateMx() {
            return this.showFields.includes('stateMx');
        }

    },
    watch: {
        chosenCountry(newVal) {
            /*
             * Reset delivery instructions data / user input when country changes
             * to update the max char length for US, CA, MX, AU, and NZ
             *
             * Do not reset delivery instructions for European countries
             */
            if(newVal && !EUROPE.includes(newVal)) this.deliveryInstructionsData = null;
        },
        sameBusinessShippingAddress() {
            this.updateAddresstypeStatus();
        },
        businessAddressId(newval) {
            this.addressId = newval;
        },
        prefilledEditAddressField(newval) {
            this.setPrefilledEditAddressFields(newval);
        },
        setFirstShipAddressAsDefault(newVal) {
            if(newVal) {
                this.defaultShip = true;
            }
        },
        stateMx() {
            // We only want this to show if the prefilled data is mexico and the edit address form is showing
            if(this.showAddressEditView && this.isMexico && this.prefilledEditAddressField.Country?.toLowerCase().replaceAll(' ', '') === 'mexico') {
                this.prefilledMxState = this.setMxStateForEditAddress();
                this.setPrefilledEditAddressFields(this.prefilledEditAddressField);
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            // prefill customer name
            if(this.isGiftOrder) {
                this.clearNameField();
            } else if(!this.getLocalizationProp('Data.NotAutoFillRecipientNameFeatureFlag', false)) {
                this.nameData = this.$custInfo?.customerFullName;
            }
            // prefill fields incase of edit address flow
            this.setPrefilledEditAddressFields(this.prefilledEditAddressField);
            // after exec this.this.setPrefilledEditAddressFields, if isEdit, `this.cityData this.suburbData this.postalCodeData` were set
            if(this.isTaiwan && this.isInCheckout) {
                this.setTwAreaRelatedDataForCheckoutPage();
            }
            if(this.isAddNewAddressForm && !this.isRiverbend) {
                this.defaultShip = true;
            }
            if(this.hasBusinessAddressCheckboxOnOle) {
                this.updateAddresstypeStatus();
            }
        });
    },
    methods: {
        ...mapActions('sequentialSections', ['completeSequence']),
        ...mapActions('shippingAddress', ['fetchAddresses']),
        completedStatus(newValue) {
            if(newValue.length === 0 || newValue[0] === undefined) {
                this.nameData = this.$custInfo?.customerFullName;
                this.$emit('completedStatus', {completed: false, isEmpty: true, index: 0, loading: false, isActive: true});
            } else {
                this.$emit('completedStatus', {completed: true, isEmpty: false, index: 0, loading: false});
            }
        },
        // Assign a state name as either a short or long version based on the content being set for the state
        setMxStateForEditAddress() {
            const fields = this.prefilledEditAddressField;
            const currentState = this.stateMx.includes(fields?.Province) ? fields.Province
                : this.stateMx.includes(fields?.ProvinceShortName) ? fields.ProvinceShortName
                    : this.stateMx[0];
            return currentState;
        },
        updateAddresstypeStatus() {
            this.checkboxChecked = this.sameBusinessShippingAddress;
        },
        clearFields() {
            this.nameData = '';
            this.address_1Data = '';
            this.address_2Data = '';
            this.address_3Data = '';
            this.suburbData = '';
            this.cityData = '';
            this.stateData = '';
            this.stateMxData = '';
            this.postalCodeData = '';
            this.provinceData = '';
            this.zipCodeData = '';
            this.deliveryInstructionsData = '';
            this.lastVerifiedDateTime = '';
        },
        clearNameField() {
            this.nameData = '';
        },
        closeThisNewAddForm() {
            this.$emit('closeAddEditAddressForm');
        },
        // Create custom error message to show how many characters the input exceeds the max length
        getFormattedMaxLengthError(fieldName) {
            const maxCharAllowed = this.$v[fieldName].$params.maxLength.max;
            const currFieldLength = this[fieldName] ? this[fieldName].length : 0;
            const excessCharLength = currFieldLength - maxCharAllowed;

            return this.getLocalizationProp(
                'Labels.ShippingSection.MaxCharacterLengthExceedError',
                'Maximum {0} characters ({1} too many)'
            ).replace('{0}', maxCharAllowed)
                .replace('{1}', excessCharLength);
        },
        async setPrefilledEditAddressFields(fields) {
            const shippingSectionRegion = this.localization.Data?.ShippingSection?.Regions?.[0]?.ServiceName?.replaceAll(' ', '').toLowerCase();
            // set isDefault for the address to be edited
            this.defaultShip = fields?.IsDefault || false;
            if(Object.keys(fields).length !== 0) {
                this.chosenCountry = fields?.Country?.toLowerCase().replaceAll(' ', '') || shippingSectionRegion;
                this.$nextTick(() => {
                    this.nameData = fields?.NameOnAddress || '';
                    this.addressId = fields?.AddressId || 0;
                    this.phoneNumberData = fields?.PhoneNumber || '';
                    this.address_1Data = fields?.AddressLine1 || '';
                    this.address_2Data = fields?.AddressLine2 || '';
                    this.address_3Data = fields?.AddressLine3 || '';
                    this.suburbData = fields?.Suburb || '';
                    this.cityData = fields?.City || '';
                    this.countyData = fields?.County || '';
                    this.stateData = fields?.ProvinceShortName || '';
                    this.stateMxData = this.prefilledMxState;
                    this.postalCodeData = fields?.PostalCode || '';
                    this.provinceData = fields?.ProvinceShortName || '';
                    this.zipCodeData = fields?.PostalCode || '';
                    this.postalCodeData = fields?.PostalCode || '';
                    this.deliveryInstructionsData = fields?.DeliveryInstructions || '';
                    this.lastVerifiedDateTime = fields?.LastVerifiedDateTime || null;
                });
            }
        },
        async submitRiverbendAddress() {
            await this.submitAddress();
            const addressApiRequest = {
                'AddressId': this.riverbendAddress?.AddressId || this.addressId || this.fetchedAddress?.AddressId,
                'AddressLine1': this.addressEntered.address1,
                'AddressLine2': this.addressEntered.address2,
                'AddressLine3': this.addressEntered.address3 ? this.addressEntered.address3 : this.addressEntered.companyName,
                'AddressType': 'ShippingAddress',
                'City': this.addressEntered.city,
                'CompanyName': this.addressEntered?.companyName,
                'Country': this.addressEntered.country.replaceAll(' ', ''),
                'DeliveryInstructions': this.addressEntered.deliveryInstructions,
                'IsDefault': false,
                'IsUserOverride': this.apiError ? false : this.suggestionPick,
                'LastVerifiedDateTime': this.apiError ? null : new Date().toUTCString(),
                'NameOnAddress': this.nameData,
                'PhoneNumber': this.phoneNumberData,
                'PostalCode': this.addressEntered.zipCode,
                'Province': this.addressEntered.state,
                'Suburb': this.addressEntered.suburb,
                'State': this.addressEntered.state
            };
            this.isLoadingSubmitForm = true;
            let response = await addAddressApi.post(addressApiRequest);

            if(response.success && response.data.Success) {
                let formattedAddress = createFormattedAddress(this, this.$env.Country);
                this.completeSequence({completed: true, isEmpty: false, index: 0, loading: false, isActive: false, selectedTitle: formattedAddress});
                this.$emit('addressSet', addressApiRequest);
                await this.fetchAddresses(null);
            } else {
                this.listApiErrors(response);
            }
            this.isLoadingSubmitForm = false;
        },
        closeSecondConfirmAddressModal() {
            this.$modal.hide({id: 'modal-second-confirmation-address'});
        },
        openSecondConfirmAddressModal() {
            this.$modal.show({ id: 'modal-second-confirmation-address' });
        },
        handleSecondConfirmAddress() {
            this.submitAddress();
            this.closeSecondConfirmAddressModal();
        }
    }
};
