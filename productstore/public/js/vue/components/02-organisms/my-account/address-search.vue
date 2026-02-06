<template>
    <div class="o-addressSearch">
        <h2 :id="headingId" class="o-addressSearch__heading">
            {{ headingLabel }}
        </h2>

        <p v-if="subheadingLabel" class="o-addressSearch__subheading">
            {{ subheadingLabel }}
        </p>

        <form
            class="o-addressSearch__form"
            @submit.prevent="onSearchSubmit">

            <input-basic
                id="o-addressSearch"
                v-model="addressValue"
                class="py-8 md:py-10"
                name="o-addressSearch"
                :placeholder="inputPlaceholder"
            />

            <button
                type="submit"
                class="a-button o-addressSearch__search">

                {{ searchLabel }}
            </button>
        </form>

        <div class="o-addressSearch__content">
            <div class="text-center">
                <a-loading-spinner :visible="loading" size="md" />
            </div>

            <div v-if="dirty && !loading" aria-live="polite">
                <div v-if="addressList && addressList.length">
                    <fieldset class="o-addressSearch__addressList">
                        <legend class="sr-only">
                            {{ selectAddressSrText }}
                        </legend>

                        <div
                            v-for="(address, index) in addressList"
                            :key="uniqueId(index)"
                            class="o-addressSearch__address">

                            <input
                                :id="uniqueId(index)"
                                v-model="selectedAddressIndex"
                                type="radio"
                                name="AddressSearchList"
                                class="o-addressSearch__radio sr-only"
                                :value="index" />

                            <label
                                :for="uniqueId(index)"
                                class="o-addressSearch__label">

                                <span role="text">
                                    <template v-if="!isJP">
                                        <span class="hidden md:inline">{{ address.PostalCode }}</span> {{ address.CityName }} {{ address.RoutingLine }} {{ address.SuburbName }}
                                    </template>
                                    <template v-else>
                                        <span class="hidden md:inline">{{ address.PostalCode }}</span> {{ address.StateName }} {{ address.CityName }} {{ address.SuburbName }}
                                    </template>

                                    <span class="md:hidden"><br /> {{ zipCodeLabel }} {{ address.PostalCode }}</span>
                                </span>
                            </label>
                        </div>
                    </fieldset>

                    <div class="flex justify-center flex-col md:flex-row">
                        <button
                            type="button"
                            class="o-addressSearch__btn -white mb-12 md:mb-0 md:mr-10"
                            @click="closeModal()">

                            {{ cancelLabel }}
                        </button>

                        <button
                            type="button"
                            class="o-addressSearch__btn md:ml-10"
                            @click="onConfirmClick">

                            {{ confirmLabel }}
                        </button>
                    </div>
                    <p
                        v-if="addressNotSelectedError"
                        class="o-addressSearch__alert py-10"
                        role="alert"
                        v-html="addressNotSelectedLabel">
                    </p>
                </div>

                <div v-else-if="errorMsg">
                    <div
                        class="o-addressSearch__alert"
                        v-html="errorMsg"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import searchAddressService from '@api/routes/address/searchaddress';

    export default {
        name: 'OAddressSearch',
        props: {
            addressNotSelectedLabel: {
                default: 'Please select Address',
                type: String
            },
            cancelLabel: {
                default: 'Cancel',
                type: String
            },
            confirmLabel: {
                default: 'Confirm',
                type: String
            },
            headingId: {
                default: '',
                type: String
            },
            headingLabel: {
                default: 'Address Search',
                type: String
            },
            inputPlaceholder: {
                default: '',
                type: String
            },
            noEntryError: {
                default: '<p>Please enter a zip code to search.</p>',
                type: String
            },
            noResultsError: {
                default: '<p>No results found</p>',
                type: String
            },
            searchLabel: {
                default: 'Search',
                type: String
            },
            selectAddressSrText: {
                default: 'Select Your Address',
                type: String
            },
            subheadingLabel: {
                default: '',
                type: String
            },
            zipCodeLabel: {
                default: 'Zip Code',
                type: String
            }
        },
        data() {
            return {
                addressValue: '',
                addressList: [],
                dirty: false,
                errorMsg: '',
                loading: false,
                selectedAddressIndex: null,
                addressNotSelectedError: false
            };
        },
        computed: {
            isJP() {
                return this.$env.Country === 'Japan';
            }
        },
        methods: {
            onConfirmClick() {
                if(this.addressValue !== null && this.selectedAddressIndex !== null) {
                    const address = this.addressList[this.selectedAddressIndex];
                    const payload = {
                        city: address.CityName,
                        routingLine: address.RoutingLine,
                        suburb: address.SuburbName,
                        postalCode: address.PostalCode,
                        state: address.StateName
                    };

                    this.$emit('confirm', payload);
                    this.closeModal();
                    this.addressNotSelectedError = false;
                } else {
                    this.addressNotSelectedError = true;
                }
            },
            async onSearchSubmit() {
                this.dirty = true;
                this.errorMsg = '';

                if(!this.addressValue) {
                    this.errorMsg = this.noEntryError;
                    return;
                }

                this.loading = true;

                const { success, error, data } = await searchAddressService.query({ postalcode: this.addressValue });

                if(success && data.Success) {
                    this.addressList = data.Data?.AddressList || [];

                    if(!this.addressList || !this.addressList.length) {
                        this.errorMsg = this.noResultsError;
                    }
                } else if(error) {
                    console.log('Service Error:', error);
                }

                this.loading = false;
            },
            uniqueId(index) {
                return `_addressSearch_${this._uid}_${index}`;
            },
            closeModal() {
                this.$emit('closeModal');
                this.addressValue = '';
                this.addressList = [];
            }
        }
    };
</script>
