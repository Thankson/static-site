<template>
    <div class="m-createAccountSection">
        <!-- Title -->
        <h2 class="m-createAccountSection__title">
            {{ getLabels(localization, 'Labels.ShippingSection.Title', 'Shipping Address') }}
        </h2>

        <!-- The component that will emit the result -->
        <o-shipp-address-form
            script-id="data-shipp-address-localization"
            :is-form="false"
            :localization-shipping="localization"
            :address1-prop="addressLine1"
            :address2-prop="addressLine2"
            :address3-prop="addressLine3"
            :city-prop="city"
            :country-prop="country"
            :postal-code-prop="postalCode"
            :province-prop="province"
            :state-mx-prop="province"
            :state-us-prop="province"
            :suburb-prop="suburb"
            :zip-code-prop="postalCode"
            @shippingAddressValid="submit"
        >
        </o-shipp-address-form>
    </div>
</template>

<script>
    import labels from '@common/source/js/vue/mixins/api-localization';

    export default {
        name: 'MCreateAccountShipping',
        mixins: [ labels ],
        props: {
            defaultAddress: {
                type: Object,
                default: () => {}
            },
            isForm: {
                type: Boolean,
                default: true
            },
            localization: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                country: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                suburb: '',
                city: '',
                province: '',
                postalCode: ''
            };
        },
        mounted() {
            const address = this.defaultAddress;
            if(address && Object.keys(address).length) {
                this.country = address.Country;
                this.addressLine1 = address.AddressLine1;
                this.addressLine2 = address.AddressLine2;
                this.addressLine3 = address.AddressLine3;
                this.suburb = address.Suburb;
                this.city = address.City;
                this.province = address.Province;
                this.postalCode = address.PostalCode;
            }
        },
        methods: {
            submit(payload) {
                this.$emit('validate-section', {
                    section: 'shipping',
                    valid: true
                });
                this.$emit('update-info', {
                    model: 'shipping',
                    value: payload
                });
                this.$emit('go-to-next');
            }
        }
    };
</script>
