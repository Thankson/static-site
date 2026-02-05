<template>
    <o-checkout-accordion
        ref="invoiceAccordion"
        :gtm-id="248"
        :is-cn="isCn"
        :title="title">

        <template v-slot:selected-title>
            <a-pay-label
                :display-name="selectedInvoice.Title"
                :type="selectedInvoice.InvoiceTitleType"
                :is-cn="true" />
        </template>

        <template v-slot:need-invoice>
            <m-checkbox
                ref="needInvoice"
                v-model="isInvoiceSelected"
                :name="needInvoiceName"
                :label="needInvoiceLabel"
                :value="isInvoice"
                :input-value="needInvoiceLabel"
            >
            </m-checkbox>
        </template>

        <div
            v-for="(method, index) in invoicesSorted"
            :key="index"
            class="o-checkoutAccordion__radio">
            <m-radio
                v-model="selectedInvoiceType"
                name="CheckoutInvoiceMethod"
                :input-value="method.InvoiceTitleType"
                mods="w-auto flex-1">

                <a-pay-label
                    :display-name="method.Title"
                    :type="method.InvoiceTitleType"
                    :is-cn="true" />
            </m-radio>
        </div>

        <span
            v-if="isAttention"
            ref="invoiceAttention"
            v-html="attentionInvoice" />

        <m-checkbox
            ref="needInvoice"
            v-model="isInvoiceSelected"
            :name="needInvoiceName"
            :label="needInvoiceLabel"
            :value="isInvoice"
            :input-value="needInvoiceLabel"
        >
            >
        </m-checkbox>

        <div v-if="$slots['default']" class="o-checkoutAccordion__action">
            <slot />
        </div>
    </o-checkout-accordion>
</template>

<script>
    import { mapGetters, mapState, mapActions } from 'vuex';

    export default {
        name: 'OCheckoutInvoiceCn',
        props: {
            title: {
                type: String,
                required: true
            },
            isInvoice: {
                type: Boolean,
                default: true
            },
            needInvoiceLabel: {
                type: String,
                required: true
            },
            needInvoiceName: {
                type: String,
                required: true
            },
            attentionInvoice: {
                type: String,
                required: true
            },
            isAttention: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                selectedInvoiceIndex: 0,
                isInvoiceSelected: false,
                selectedInvoiceType: ''
            };
        },
        computed: {
            ...mapGetters('checkout', ['selectedInvoice']),
            ...mapGetters('checkoutAccordions', ['onExpandInvoice', 'onCollapseInvoice']),
            ...mapState('invoice', ['storedInvoices']),

            invoicesSorted() {
                let invoice = this.storedInvoices || [];

                // // Sort by IsMelaleucaCard
                // invoice.sort((a, b) => b.IsMelaleucaCard - a.IsMelaleucaCard);

                return invoice;
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            isInvoiceSelected() {
                this.$emit('updateChecked', {
                    isInvoiceSelected: this.isInvoiceSelected
                });
            },
            storedInvoices(newVal) {
                const selectedInvoice = newVal.find(item => item.IsSelected);
                if(selectedInvoice) {
                    this.selectedInvoiceType = selectedInvoice?.InvoiceTitleType;
                }
            },
            async selectedInvoiceType(newVal) {
                let that = this;
                if(that.selectedInvoiceType) {
                    if(that.selectedInvoiceType === newVal) {
                        that.updateInvoicestype({invoiceType: that.selectedInvoiceType}).then(function() {
                            if(that.selectedInvoiceType !== that.selectedInvoice?.InvoiceTitleType) {
                                that.$emit('update', true);
                            }
                            that.getInvoices();
                        }).then(function() {
                            setTimeout(() => {
                                that.collapse();
                            }, 800);
                        });
                    } else {
                        that.$emit('update', false);
                    }
                }
            }
        },
        mounted() {
            this.onExpandInvoice(this.expand);
            this.onCollapseInvoice(this.collapse);
            this.$emit('update', false);
        },
        methods: {
            ...mapActions('invoice', ['updateInvoicestype', 'getInvoices']),
            collapse() {
                if(this.$refs['invoiceAccordion']) {
                    this.$refs['invoiceAccordion'].$emit('hide');
                    this.$refs['invoiceAccordion'].$emit('focus');
                }
            },
            expand() {
                if(this.$refs['invoiceAccordion']) {
                    this.$refs['invoiceAccordion'].$emit('show');
                    this.$refs['invoiceAccordion'].$emit('focus');
                }
            }
        }
    };
</script>
