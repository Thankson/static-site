<template>
    <div class="o-checkoutShipMethods">
        <div v-if="shippingOptions.length > 1">
            <div
                v-for="(option, indx) in shippingOptions"
                :key="indx"
                class="o-checkoutShipMethods__radio">

                <m-radio
                    v-model="selectedIndex"
                    name="CheckoutShippingMethod"
                    :input-value="indx"
                    label-mods="-ole"
                    mods="w-auto"
                    @input="gtmTrackAction({id: 454, text: option.ShipMethod}, $event)">
                    <m-checkout-shipping-label
                        :carrier="option.Carrier || option.CarrierDisplayName"
                        :date="option.FormattedEstimatedDateTo"
                        :get-by-label="getByLabel"
                        :has-shipping-date="option.HasShippingDate"
                        :hide-carrier="option.HideCarrier"
                        :hide-ship-method="hideShipMethod"
                        :quote="option.FormattedShipMethodQuote"
                        :ship-method="option.FormattedShipMethod ? option.FormattedShipMethod : option.ShipMethod" />
                </m-radio>
                <div v-if="reimbursedInLsd && indx===selectedIndex" class="o-checkoutShipMethods__rmbrdsLsd" v-html="reimbursedInLsd"></div>
            </div>

        </div>
        <div v-else-if="shippingOptions.length === 1" class="o-checkoutShipMethods__one bg-white">
            <m-checkout-shipping-label
                class="w-full"
                :carrier="carrier"
                :date="shippingOptions[0].FormattedEstimatedDateTo"
                :get-by-label="getByLabel"
                :hide-ship-method="hideShipMethod"
                :hide-carrier="shippingOptions[0].HideCarrier"
                :quote="shippingOptions[0].FormattedShipMethodQuote"
                :ship-method="shippingMethod" />
        </div>

        <!-- Shipping Method Continue -->
        <div class="o-checkoutShipMethods__continue py-20">
            <button class="o-addressForm__button -save" data-testid="button-addNewAddressSaveBtn" @click="[updateShippingMethod(), gtmTrackAction({id: 452, text: continueLabel}, $event)]">
                {{ continueLabel }}
            </button>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'OCheckoutShippingMethodsConfigurable',
        props: {
            isActive: {
                type: Boolean,
                default: false
            },
            index: {
                type: Number,
                default: 1
            },
            getByLabel: {
                type: String,
                default: 'Get it by'
            },
            reimbursedInLsd: {
                type: String,
                default: ''
            },
            continueLabel: {
                type: String,
                default: ''
            },
            hasShippingMethod: {
                type: Boolean,
                default: false
            },
            hideShipMethod: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                selectedIndex: 0
            };
        },
        computed: {
            // ...mapGetters('checkoutAccordions', ['onExpandShippingMethod', 'onCollapseShippingMethod', 'shippingMethodError']),
            ...mapState('checkout', ['selectedShippingOption', 'shippingOptions']),

            carrier() {
                return this.shippingOptions[0]?.Carrier || this.shippingOptions[0]?.CarrierDisplayName;
            },
            shippingMethod() {
                if(this.shippingOptions[0]?.FormattedShipMethod) {
                    return this.shippingOptions[0]?.FormattedShipMethod;
                }
                return this.shippingOptions[0]?.ShipMethod || '';
            }
        },
        watch: {
            selectedShippingOption() {
                this.setSelectedIndex();
            }
        },
        created() {
            this.setSelectedIndex();
        },
        mounted() {
            this.completeStatus();
        },
        methods: {
            setSelectedIndex() {
                if(this.hasShippingMethod && this.shippingOptions.length > 0) {
                    const selectedIndex = this.shippingOptions.findIndex(
                        option =>
                            option.ShipMethod === this.selectedShippingOption.ShipMethod &&
                            option.Carrier === this.selectedShippingOption.Carrier
                    );
                    this.selectedIndex = selectedIndex > -1 ? selectedIndex : -1;
                }
                this.completeStatus();
            },
            completeStatus() {
                if(this.hasShippingMethod) {
                    this.$emit('completedStatus', {completed: true, isEmpty: false, isActive: false, index: this.index, loading: false});
                } else {
                    this.$emit('completedStatus', {completed: true, isEmpty: true, index: this.index, loading: false});
                }
            },
            updateShippingMethod() {
                if(this.selectedShippingOption.ShipMethod !== this.shippingOptions[this.selectedIndex].ShipMethod ||
                    this.selectedShippingOption.Carrier !== this.shippingOptions[this.selectedIndex].Carrier) {
                    this.$emit('update', {
                        ShipMethod: this.shippingOptions[this.selectedIndex].ShipMethod,
                        Carrier: this.shippingOptions[this.selectedIndex]?.Carrier,
                        Index: this.selectedIndex
                    });
                } else {
                    // close the sequence and do nothing
                    this.$emit('completedStatus', {completed: true, isEmpty: false, isActive: false, index: this.index, loading: false});
                }
            }
        }
    };
</script>
