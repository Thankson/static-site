<template>
    <div class="shipAddress">
        <button type="submit" class="a-button -save" @click="checkSave($event)">
            {{ getLocalizationProp('Labels.Save') }}
        </button>

        <!-- Cross country address modal -->
        <modal id="modal-cross-country-address" width="630px">
            <template v-slot:content>
                <div class="px-30 md:px-0">
                    <div
                        class="m-rte"
                        v-html="crossCountryModalRTE">
                    </div>
                    <div class="flex flex-col md:flex-row mt-30">
                        <button
                            v-modal-hide
                            type="button"
                            class="a-button -white justify-center text-base text-center font-medium mr-10 py-12 px-60 mb-20 md:mb-0">
                            {{ getLocalizationProp('Data.CrossCountryModal.Cancel') }}
                        </button>

                        <button
                            type="button"
                            class="a-button -green justify-center text-base text-center font-medium py-12 px-15 mr-10"
                            @click="continueCrossCountryAddress">
                            {{ crossCountryModalContinue }}
                        </button>

                        <a-loading-spinner v-if="crossCountryAddressLoading" :visible="crossCountryAddressLoading" size="sm" />
                    </div>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MShippingAddressCta',
        mixins: [ localizationMixin ],
        data() {
            return {
                crossCountryAddress: {
                    newAddress: null,
                    newAddressLabel: null,
                    oldAddress: null,
                    oldAddressLabel: null,
                    isDefault: null
                },
                crossCountryAddressLoading: false
            };
        },
        computed: {
            checkDefaultCountryAddress() {
                return this.getLocalizationProp('Data.CrossCountryModal.DefaultShippingCountry') || '';
            },
            crossCountryModalContinue() {
                return this.replaceTokenArray(
                    this.getLocalizationProp('Data.CrossCountryModal.ContinueToSite'),
                    [this.crossCountryAddress?.newAddressLabel]
                );
            },
            crossCountryModalRTE() {
                return this.replaceTokenArray(
                    this.getLocalizationProp('Data.CrossCountryModal.RteDescription'),
                    [this.crossCountryAddress?.newAddressLabel, this.crossCountryAddress?.oldAddressLabel]
                );
            }
        },
        mounted () {
            // Set vars
            this.crossCountryAddress.oldAddress = this.checkDefaultCountryAddress;
            this.crossCountryAddress.isDefault = this.checkIsDefaultAddress();
        },
        methods: {
            replaceTokenArray,
            checkCountryAddress() {
                return $('#country-select-mlc option:selected').val() || '';
            },
            checkIsDefaultAddress() {
                return $('#defaultShip').length ? $('#defaultShip').is(':checked') : '';
            },
            checkSave(evt) {
                // Calling modal if default is ticked and crosscountry
                this.crossCountryAddress.newAddress = this.checkCountryAddress();
                this.crossCountryAddress.isDefault = this.checkIsDefaultAddress();
                const newAddress = this.crossCountryAddress.newAddress;
                const oldAddress = this.crossCountryAddress.oldAddress;

                // Check if form is valid.
                // Waiting for window object to be updated by address-form.js
                setTimeout(() => {
                    const errors = $('.formError.-noIcon.-bgIcon').filter((idx, element) => element.style.display !== 'none');
                    if(window.sendform?.config?.isFormValid && errors.length === 0) {
                        if(this.crossCountryAddress.isDefault && (oldAddress !== newAddress)) {
                            // Cross country modal
                            evt.preventDefault();
                            this.openCrossCountryAddress(oldAddress, newAddress);
                        } else {
                            // Sending the form
                            if(window.sendform && window.sendform.sendForm) window.sendform.sendForm();
                        }
                    }
                }, 200);
            },
            continueCrossCountryAddress() {
                this.crossCountryAddressLoading = true;
                if(window.sendform && window.sendform.sendForm) window.sendform.sendForm();
            },
            openCrossCountryAddress(oldAddress, newAddress) {
                const countryLabelsProp = this.getLocalizationProp('Data.Provinces');
                // Old country
                countryLabelsProp.find(val => {
                    if(val.ServiceName === oldAddress) this.crossCountryAddress.oldAddressLabel = val.RegionName;
                });

                // New country
                countryLabelsProp.find(val => {
                    if(val.ServiceName === newAddress) this.crossCountryAddress.newAddressLabel = val.RegionName;
                });

                // Opening modal
                this.$modal.show({ id: 'modal-cross-country-address' });

                // Set as redirect after
                window.sendform.config['isCrossCountry'] = true;

                this.$modal.$on.hidden(() => {
                    window.sendform.config['isCrossCountry'] = false;
                    window.sendform.config['isFormValid'] = false;
                    window.sendform.setIsFormValid(false);
                });
            }
        }
    };
</script>
