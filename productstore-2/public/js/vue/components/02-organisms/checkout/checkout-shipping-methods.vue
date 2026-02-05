<template>
    <div>
        <component
            :is="useSequenceStyle ? 'o-checkout-sequence' : 'o-checkout-accordion'"
            v-if="shippingOptions.length > 1 || useSequenceStyle"
            :ref="useSequenceStyle ? 'sequence' : 'accordion'"
            :gtm-id="414"
            :title="title"
            :has-shipping-unavailable-error="hasShippingUnavailableError"
            :error-shipping-unavailable-label="errorShippingUnavailableLabel"
            :error-learn-why-label="errorLearnWhyLabel"
            :error-aria-label="errorAriaLabel"
            container-type="fieldset"
            title-type="legend"
            :title-copy="titleCopy"
            :sequence-index="sequenceIndex"
            :script-id="scriptId"
            sequential-section-class-modifier="mb-0"
            sequential-title-class-modifier="mt-40"
            @open-modal="openModal">

            <template v-slot:selected-title>
                <m-checkout-shipping-label
                    :carrier="selectedShippingOption.CarrierDisplayName || selectedShippingOption.Carrier"
                    :date="selectedShippingOption.FormattedEstimatedDateTo"
                    :get-by-label="getByLabel"
                    :hide-ship-method="hideShipMethod"
                    :hide-carrier="selectedShippingOption.HideCarrier"
                    :quote="selectedShippingOption.FormattedShipMethodQuote"
                    :ship-method="selectedShippingOption.FormattedShipMethod || selectedShippingOption.ShipMethodDisplayName || selectedShippingOption.ShipMethod" />
            </template>

            <div
                v-for="(option, index) in shippingOptions"
                :key="index"
                class="o-checkoutAccordion__radio">

                <m-radio
                    v-model="selectedIndex"
                    name="CheckoutShippingMethod"
                    :input-value="index"
                    label-mods="-blue"
                    mods="w-auto">

                    <m-checkout-shipping-label
                        :carrier="getCarrierName(option)"
                        :date="option.FormattedEstimatedDateTo"
                        :get-by-label="getByLabel"
                        :has-shipping-date="option.HasShippingDate"
                        :hide-carrier="option.HideCarrier"
                        :hide-ship-method="hideShipMethod"
                        :quote="option.FormattedShipMethodQuote"
                        :ship-method="option.FormattedShipMethod || option.ShipMethodDisplayName || option.ShipMethod" />
                </m-radio>
            </div>
        </component>

        <div v-else class="o-checkoutAccordion bg-white">
            <div class="o-accordion__toggler">
                <div class="o-checkoutAccordion__title">
                    <span class="o-checkoutAccordion__label">
                        {{ title }}
                    </span>
                </div>
                <m-checkout-shipping-label
                    class="w-full"
                    :carrier="carrier"
                    :date="shippingOptions[0].FormattedEstimatedDateTo"
                    :get-by-label="getByLabel"
                    :hide-carrier="shippingOptions[0].HideCarrier"
                    :hide-ship-method="hideShipMethod"
                    :quote="shippingOptions[0].FormattedShipMethodQuote"
                    :ship-method="shippingMethod" />
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapState, mapActions } from 'vuex';
    export default {
        name: 'OCheckoutShippingMethods',
        props: {
            errorAriaLabel: {
                type: String,
                default: 'Error attention required'
            },
            errorLearnWhyLabel: {
                type: String,
                default: ''
            },
            hasShippingUnavailableError: {
                type: Boolean,
                default: false
            },
            hideShipMethod: {
                type: Boolean,
                default: false
            },
            errorShippingUnavailableLabel: {
                type: String,
                default: ''
            },
            getByLabel: {
                type: String,
                default: 'Get it by'
            },
            scriptId: {
                type: String,
                default: ''
            },
            sequenceIndex: {
                type: Number,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            titleCopy: {
                type: String,
                default: ''
            },
            useSequenceStyle: {
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
            ...mapGetters('checkoutAccordions', ['onExpandShippingMethod', 'onCollapseShippingMethod', 'shippingMethodError']),
            ...mapState('checkout', ['selectedShippingOption', 'shippingOptions']),

            carrier() {
                return this.shippingOptions[0]?.CarrierDisplayName || this.shippingOptions[0]?.Carrier;
            },
            shippingMethod() {
                return this.shippingOptions[0].FormattedShipMethod || this.shippingOptions[0].ShipMethodDisplayName || this.shippingOptions[0].ShipMethod;
            }
        },
        watch: {
            selectedIndex(index) {
                if(this.selectedShippingOption.ShipMethod !== this.shippingOptions[index].ShipMethod ||
                    this.selectedShippingOption.Carrier !== this.shippingOptions[index].Carrier
                ) {
                    if(this.shippingOptions[index].ShipMethod === 'CustomerPickUp') {
                        this.$emit('update', {
                            ShipMethod: this.shippingOptions[index].ShipMethod,
                            WarehouseId: this.getWarehouseInfo(index)?.PickupWarehouse?.WarehouseId,
                            Index: index
                        });
                        this.$store.commit('shippingAddress/UPDATE_ADDRESSES', [this.getWarehouseInfo(index).PickupWarehouse?.WarehouseAddress]);
                    } else {
                        this.$emit('update', {
                            ShipMethod: this.shippingOptions[index].ShipMethod,
                            Carrier: this.shippingOptions[index]?.Carrier,
                            Index: index
                        });
                        this.$store.dispatch('shippingAddress/fetchAddresses');
                    }
                }
            },
            selectedShippingOption() {
                this.setSelectedIndex();
            }
        },
        created() {
            this.setSelectedIndex();
            this.onExpandShippingMethod(this.expand);
            this.onCollapseShippingMethod(this.collapse);
        },
        mounted() {
            if(this.useSequenceStyle) {
                this.completeSequence({
                    isActive: false,
                    index: this.sequenceIndex,
                    loading: false
                });
            }
        },
        methods: {
            ...mapActions('sequentialSections', ['completeSequence']),
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
            openModal() {
                this.$emit('open-modal');
            },
            setSelectedIndex() {
                const selectedIndex = this.shippingOptions.findIndex(
                    option =>
                        option.ShipMethod === this.selectedShippingOption.ShipMethod &&
                        option.Carrier === this.selectedShippingOption.Carrier
                );
                this.selectedIndex = selectedIndex > -1 ? selectedIndex : 0;
            },
            getWarehouseInfo(selectedIndex) {
                return this.shippingOptions[selectedIndex].ShipMethod === 'CustomerPickUp' ? this.shippingOptions[this.selectedIndex] : null;
            },
            getCarrierName(option) {
                if(option.ShipMethod === 'CustomerPickUp') {
                    return option.PickupWarehouse?.WarehouseDescription;
                }
                return option.CarrierDisplayName || option.Carrier;
            }
        }
    };
</script>
