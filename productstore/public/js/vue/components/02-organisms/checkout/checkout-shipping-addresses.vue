<template>
    <div>
        <o-checkout-accordion
            ref="accordion"
            :has-error="shippingAddressError || selectedIndex===null "
            :is-guest="isGuest"
            :selected-title="selectedContent"
            :gtm-id="247"
            :title="title"
            :disabled="disableAccordian"
            :error-aria-label="errorAriaLabel"
            :is-cn="isCn"
            :class="(isFirstTimeCheckout && selectedIndex===null)?'-isFirstTimeCheckout':''">

            <div
                v-for="(address, index) in addresses"
                :key="index"
                class="o-checkoutAccordion__radio">

                <m-radio
                    v-model="selectedIndex"
                    name="CheckoutShippingAddress"
                    :input-value="index"
                    label-mods="-top"
                    mods="w-auto flex-1">

                    <span class="text-base -mt-4" v-html="address.FormattedAddress" />
                </m-radio>

                <div class="o-checkoutAccordion__editDeleteGroup">
                    <a
                        v-if="address.AddressId && editLink"
                        class="o-checkoutAccordion__edit"
                        :href="getEditLink(address)">

                        <span class="font-material text-base leading-base" aria-hidden="true">edit</span>
                        <span class="uppercase pl-5">{{ editLabel }} <span class="sr-only" v-html="address.FormattedAddress"></span></span>
                    </a>
                    <button
                        v-if="address.AddressId"
                        class="o-checkoutAccordion__delete"
                        data-testid="button-checkoutAccordion_delete"
                        @click="openDeleteShippingAddressModal(address)"
                    >
                        <a-icon-svg icon-name="trash"></a-icon-svg>
                        <span class="sr-only">{{ deleteLabel }} <span v-html="address.FormattedAddress"></span></span>
                    </button>
                </div>

            </div>

            <div v-if="$slots['default']" class="o-checkoutAccordion__action">
                <slot />
            </div>

            <template v-if="selectedContent && editGuestLink" v-slot:guest-button>
                <a
                    class="o-checkoutAccordion__edit"
                    :href="editGuestLink">

                    <span class="font-material text-base leading-base" aria-hidden="true">edit</span>
                    <span class="uppercase pl-5">{{ editLabel }} <span class="sr-only" v-html="selectedContent"></span></span>
                </a>

                <button>
                    <img src="https://cdnsc1.melaleuca.com/na/images/header/trash.png" alt="">
                    <span class="uppercase pl-5">{{ editLabel }} <span class="sr-only" v-html="selectedContent"></span></span>
                </button>

            </template>

        </o-checkout-accordion>

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

        <modal id="default-shipping-address" heading-class="o-acctCardSection__modalHeading">
            <template v-slot:heading>
                {{ modalLabelsDeleteAddr.DeleteAddressDefaultHeading }}
            </template>
            <template v-slot:body>
                <p class="o-acctCardSection__modalDesc">{{ modalLabelsDeleteAddr.DeleteAddressDefaultDetails }}</p>
            </template>
            <template v-slot:footer>
                <div class="o-acctCardSection__modalBtn">
                    <v-button :href="modalLabelsDeleteAddr.ManageAddressUrl" :is-anchor="true" class="-green px-30">{{ modalLabelsDeleteAddr.ManageAddresses }}</v-button>
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
    </div>

</template>

<script>
    import { mapGetters, mapState, mapMutations, mapActions } from 'vuex';

    export default {
        name: 'OCheckoutShippingAddresses',
        props: {
            deleteLabel: {
                type: String,
                default: 'Delete'
            },
            editLabel: {
                type: String,
                default: 'Edit'
            },
            editLink: {
                type: String,
                default: null
            },
            editGuestLink: {
                type: String,
                default: null
            },
            errorAriaLabel: {
                type: String,
                default: 'Error attention required'
            },
            title: {
                type: String,
                required: true
            },
            errorMsgs: {
                type: Object,
                default: () => {}
            },
            isCn: {
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
            }
        },
        data() {
            return {
                selectedIndex: 0,
                urlParams: {},
                selectedContent: '',
                addressToDelete: {},
                disableAccordian: false
            };
        },
        computed: {
            ...mapGetters('checkoutAccordions', ['onExpandShippingAddress', 'onCollapseShippingAddress', 'shippingAddressError']),
            ...mapState('checkout', ['selectedShippingAddressId', 'crossCountryOldAddressIndex', 'selectedCrossCountry', 'selectedShippingOption']),
            ...mapState('shippingAddress', ['addresses']),

            formattedAddress() {
                const formattedAddress = (this.selectedIndex !== null) ? this.addresses[this.selectedIndex].FormattedAddress?.toLowerCase() : '';
                return formattedAddress;
            },
            getCountry() {
                return (this.selectedIndex !== null) ? this.addresses[this.selectedIndex].Country : '';
            }
        },
        watch: {
            addresses(value) {
                const shipTo = value[0];
                if(this.selectedShippingOption.ShipMethod === 'CustomerPickUp') {
                    this.disableAccordian = true;
                    this.selectedContent = shipTo.FormattedAddress;
                } else {
                    this.disableAccordian = false;
                }
            },
            crossCountryOldAddressIndex() {
                if(this.crossCountryOldAddressIndex > -1 && this.selectedCrossCountry) {
                    this.SET_SELECTED_CROSS_COUNTRY(false);
                    this.selectedIndex = this.crossCountryOldAddressIndex;
                    this.$store.commit('checkout/SET_CROSS_COUNTRY_OLD_ADDRESS_INDEX', null);
                }
            },
            selectedIndex(newValue, oldValue) {
                this.selectedContent = (this.selectedIndex !== null) ? this.addresses[this.selectedIndex].FormattedAddress : '';
                if(this.isCn) {
                    // Used for CN float banner show the ship address
                    this.$emit('updateShipAddress', this.addresses[this.selectedIndex]);
                }
                if(this.selectedIndex !== null && (this.selectedShippingAddressId !== this.addresses[this.selectedIndex]?.AddressId || (this.isCn && this.isFirstTimeCheckout))) {
                    // If the selected address is from another country
                    if(this.addresses[this.selectedIndex]?.WithinCurrentCountry === false) {
                        this.SET_SELECTED_CROSS_COUNTRY(true);

                        this.$emit('cross-country-address', {
                            newAddress: this.addresses[this.selectedIndex],
                            oldAddress: this.addresses[oldValue],
                            oldAddressIndex: oldValue
                        });

                    // If the selected address is from user's country
                    } else {
                        this.SET_SELECTED_CROSS_COUNTRY(false);
                        this.$emit('update', {
                            Country: this.addresses[this.selectedIndex].Country,
                            LastVerifiedDateTime: this.addresses[this.selectedIndex].LastVerifiedDateTime,
                            ShippingAddressId: this.addresses[this.selectedIndex].AddressId,
                            WarehouseGroupName: this.addresses[this.selectedIndex].WarehouseGroupName,
                            WithinCurrentCountry: this.addresses[this.selectedIndex]?.WithinCurrentCountry
                        });

                        // Banner Puerto Rico
                        this.checkCity(this.formattedAddress);
                    }
                }

                this.SET_COUNTRY(this.getCountry);
            }
        },
        created() {
            const addressIndex = this.addresses.findIndex(address => address.AddressId === this.selectedShippingAddressId);
            this.selectedIndex = addressIndex > -1 ? addressIndex : 0;
            if(this.isCn && this.isFirstTimeCheckout) {
                this.selectedIndex = null;
            }
            if(this.selectedIndex !== null) {
                this.selectedContent = this.addresses[this.selectedIndex].FormattedAddress;
            }
            if(this.isCn && this.selectedIndex === 0) {
                // Used for CN float banner show the ship address
                this.$emit('updateShipAddress', this.addresses[this.selectedIndex]);
            }
            this.onExpandShippingAddress(this.expand);
            this.onCollapseShippingAddress(this.collapse);

            // Banner Puerto Rico
            this.checkCity(this.formattedAddress);
        },
        mounted() {
            // Get all query strings from URL
            this.urlParams = new URLSearchParams(window.location.search);

            // Verify if there's some Address ID on query string
            this.$nextTick(() => {
                this.checkQueryAddress();
            });

            if(this.isCn && this.isFirstTimeCheckout) {
                this.expand();
            }

            this.SET_COUNTRY(this.getCountry);
        },
        methods: {
            ...mapMutations('checkout', ['SET_SELECTED_CROSS_COUNTRY', 'SET_COUNTRY']),
            ...mapActions('shippingAddress', ['deleteAddress']),

            checkCity(val) {
                (val.indexOf('puerto rico') > -1 || val.indexOf('puertorico') > -1)
                    ? this.$emit('checkCity', true)
                    : this.$emit('checkCity', false);
            },
            collapse() {
                if(this.$refs['accordion']) {
                    this.$refs['accordion'].$emit('hide');
                    this.$refs['accordion'].$emit('focus');
                }
            },
            expand() {
                if(this.$refs['accordion']) {
                    this.$refs['accordion'].$emit('show');
                    this.$refs['accordion'].$emit('focus');
                }
            },
            getEditLink(address) {
                // Concat Origin and Pathname to prevent Query Strings
                const backTo = `${window.location.origin}${window.location.pathname}`;
                return `${this.editLink}?addressId=${address.AddressId}&backTo=${backTo}`;
            },
            // Get address ID from query string
            checkQueryAddress() {
                const queryAddressId = parseInt(this.urlParams.get('addressId'));
                console.log('queryAddressId=>', queryAddressId);

                // If there's some Address ID on query string
                if(queryAddressId) {
                    console.log('this.addresses.length', this.addresses.length);
                    // Search for address index
                    const addressIndex = this.addresses.findIndex(address => address.AddressId === queryAddressId);
                    console.log('addressIndex=>', addressIndex);

                    // Select address ID from query string and update address on checkout API
                    if(addressIndex > -1) {
                        this.selectedIndex = addressIndex;
                    }
                }
            },
            onDeletedShippingAddress: function() {
                this.$modal.hide();
                this.deleteAddress(this.addressToDelete.AddressId);
            },
            openDeleteShippingAddressModal(address) {
                this.addressToDelete = address;
                const selectedAddressId = this.addresses[this.selectedIndex].AddressId;
                if(address.IsDefault) {
                    this.$modal.show({id: 'default-shipping-address'});
                } else if(address.AddressId === selectedAddressId) {
                    this.$modal.show({id: 'selected-shipping-address'});
                } else {
                    this.$modal.show({id: 'confirm-delete-shipping-address'});
                }
            }
        }
    };
</script>
