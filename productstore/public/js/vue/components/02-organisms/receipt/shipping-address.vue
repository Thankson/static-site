<template>
    <!-- Address 1,  2, and  3, should always be shown for all countries. ONLY when Address 2 or 3 actually has a value in it-->
    <address class="w-full md:w-400 not-italic">
        <span class="font-bold block leading-tight" :class="isOleCheckoutFlow ?'text-base':'text-xl'">{{ orderData.ShipToName }}</span>
        <span class="text-base font-normal block leading-tight">{{ orderData.ShipToAddress.Address1 }}</span>
        <span v-if="orderData.ShipToAddress.Address2" class="text-base font-normal block leading-tight">{{ orderData.ShipToAddress.Address2 }}</span>
        <span v-if="orderData.ShipToAddress.Address3" class="text-base font-normal block leading-tight">{{ orderData.ShipToAddress.Address3 }}</span>
        <span class="text-base font-normal block leading-tight">{{ orderData.ShipToAddress.Suburb }}</span>
        <span v-if="isKr" class="text-base font-normal block md:pt-3 leading-tight">
            {{ orderData.ShipToAddress.PostalCode }}
        </span>
        <span v-else class="text-base font-normal block md:pt-3 leading-tight">
            {{ orderData.ShipToAddress.City }},
            {{ showState ? orderData.ShipToAddress.State : '' }}
            {{ orderData.ShipToAddress.PostalCode }}
        </span>
        <span v-if="showCountry" class="text-base font-normal block leading-tight">{{ orderData.ShipToAddress.Country }}</span>
    </address>
</template>

<script>
    export default {
        name: 'OShippingAddress',
        props: {
            orderData: {
                type: Object,
                default: () => {
                    return {
                        ShipToName: String,
                        ShipToAddress: {
                            Address1: String,
                            Address2: String,
                            Address3: String,
                            Suburb: String,
                            City: String,
                            State: String,
                            PostalCode: String,
                            Country: String
                        }
                    };
                }
            },
            showCountry: {
                type: Boolean,
                default: false
            },
            showState: {
                type: Boolean,
                default: false
            },
            isOleCheckoutFlow: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            isKr() {
                return this.$env.Country === 'Korea';
            }
        }
    };
</script>
