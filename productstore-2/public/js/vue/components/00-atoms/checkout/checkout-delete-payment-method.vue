<template>
    <button
        type="button"
        @click="onInitDelete">

        <slot v-if="$slots['default']" />
        <template v-else>
            {{ buttonLabel }}
        </template>

        <!-- START: Delete Confirmation and Prevention Modals -->
        <modal
            id="confirm-delete-pay-method"
            heading-class="o-acctCardSection__modalHeading"
        >

            <template v-slot:heading>
                <span v-html="modalHeading"></span>
            </template>

            <template v-slot:body>
                <p class="o-acctCardSection__modalDesc">
                    {{ modalDesc }}
                </p>
            </template>

            <template v-slot:footer>
                <div class="o-acctCardSection__modalFooter">
                    <div class="o-acctCardSection__modalBtn -secondary">
                        <v-button
                            v-modal-hide
                            class="-white -full">

                            {{ cancelLabel }}
                        </v-button>
                    </div>

                    <div class="o-acctCardSection__modalBtn -primary">
                        <v-button
                            class="-green -full"
                            @click="onDelete()">

                            {{ deleteLabel }}
                        </v-button>
                    </div>
                </div>
            </template>
        </modal>

        <modal
            id="default-pay-method"
            heading-class="o-acctCardSection__modalHeading"
        >

            <template v-slot:heading>
                <span v-html="modalHeadingDefault"></span>
            </template>

            <template v-slot:body>
                <p class="o-acctCardSection__modalDesc">
                    {{ modalDescDefault }}
                </p>
            </template>

            <template v-slot:footer>
                <div class="o-acctCardSection__modalBtn">
                    <v-button
                        :href="managePayMethodsLink.url"
                        :is-anchor="true" class="-green px-30">

                        {{ managePayMethodsLink.text }}
                    </v-button>
                </div>
            </template>
        </modal>

        <modal
            id="selected-pay-method"
            heading-class="o-acctCardSection__modalHeading"
        >
            <template v-slot:heading>
                {{ modalHeadingSelected }}
            </template>

            <template v-slot:body>
                <p class="o-acctCardSection__modalDesc">
                    {{ modalDescSelected }}
                </p>
            </template>

            <template v-slot:footer>
                <div class="o-acctCardSection__modalBtn">
                    <v-button
                        v-modal-hide
                        :href="managePayMethodsLink.url"
                        :is-anchor="true"
                        class="-green -full text-center">

                        {{ modalCtaSelected }}
                    </v-button>
                </div>
            </template>
        </modal>
        <!-- END: Delete Confirmation and Prevention Modals -->
    </button>
</template>

<script>
    import { mapActions, mapState } from 'vuex';

    export default {
        name: 'ACheckoutDeletePaymentMethod',
        props: {
            buttonLabel: {
                type: String,
                default: 'Delete'
            },
            cancelLabel: {
                type: String,
                default: 'Cancel'
            },
            canDeleteSelected: {
                type: Boolean,
                default: false
            },
            deleteLabel: {
                type: String,
                default: 'Delete'
            },
            isDefault: {
                type: Boolean,
                required: true
            },
            managePayMethodsLink: {
                type: Object,
                default: () => ({
                    text: 'Manage Payment Methods',
                    url: '/'
                })
            },
            modalHeading: {
                type: String,
                default: 'Are you sure?'
            },
            modalDesc: {
                type: String,
                default: 'Deleting this credit card cannot be undone.'
            },
            modalHeadingDefault: {
                type: String,
                default: 'Sorry.'
            },
            modalDescDefault: {
                type: String,
                default: 'You cannot delete a Default Payment Method. Edit another payment method and make it the default.'
            },
            modalHeadingSelected: {
                type: String,
                default: 'Sorry.'
            },
            modalDescSelected: {
                type: String,
                default: 'The selected pay method can not be deleted. Please choose a different pay method.'
            },
            modalCtaSelected: {
                type: String,
                default: 'Choose another pay method'
            },
            owingBalanceCustomerId: {
                type: Number,
                default: null
            },
            payMethodId: {
                type: [ Number, String ],
                required: true
            }
        },
        computed: {
            ...mapState('checkout', ['selectedPayMethodId']),

            isSelected() {
                return this.selectedPayMethodId === this.payMethodId;
            }
        },
        methods: {
            ...mapActions('paymentMethod', ['getCheckoutPayMethod', 'deletePayMethod', 'getPayMethods']),

            async onDelete() {
                this.$modal.hide();
                this.$emit('deletingPayMethod', true);

                // select default pay method if this is the currently selected pay method
                if(this.isSelected) {
                    this.$emit('delete-selected');
                }

                await this.deletePayMethod({
                    payMethodId: this.payMethodId,
                    customerId: this.owingBalanceCustomerId
                });

                if(this.owingBalanceCustomerId) {
                    await this.getPayMethods({
                        checkout: true,
                        owingBalance: true,
                        customerId: this.owingBalanceCustomerId,
                        country: this.$env?.Country
                    });
                } else {
                    await this.getCheckoutPayMethod();
                }

                this.$emit('deletingPayMethod', false);
            },
            onInitDelete() {
                let modalId = 'confirm-delete-pay-method';

                if(this.isDefault) {
                    modalId = 'default-pay-method';
                } else if(this.isSelected && !this.canDeleteSelected) {
                    modalId = 'selected-pay-method';
                }

                this.$modal.show({ id: modalId });
            }
        }
    };
</script>
