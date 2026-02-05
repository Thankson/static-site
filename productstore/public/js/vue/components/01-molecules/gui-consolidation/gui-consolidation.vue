<template>
    <div class="m-guiConsolidation">
        <button
            type="button"
            class="m-guiConsolidation__btn"
            @click="$modal.show()">

            {{ toggleLabel }}
        </button>

        <div
            v-if="descLabel"
            class="m-guiConsolidation__desc"
            v-html="descLabel"
        />

        <form
            ref="eInvoiceForm"
            :action="submissionUrl"
            method="POST"
            target="_blank">

            <input v-model="companyTaxId" type="hidden" name="card_ban">
            <input v-model="cardNumber1" type="hidden" name="card_no1">
            <input v-model="cardNumber2" type="hidden" name="card_no2">
            <input v-model="cardType" type="hidden" name="card_type">
            <input v-model="backUrl" type="hidden" name="back_url">
            <input v-model="token" type="hidden" name="token">
        </form>

        <modal
            :heading-class="modalHeadingClass"
            width="426px">

            <template #heading>
                <span
                    ref="heading"
                    @blur="onHeadingBlur">

                    <span v-html="modalHeading" />
                </span>
            </template>

            <template v-if="modalDescLabel" #body>
                <div v-if="!hasError" class="leading-tight" v-html="modalDescLabel" />
            </template>

            <template #footer>
                <div v-if="!hasError" class="flex">
                    <v-button
                        v-modal-hide
                        class="-white flex-1 text-center justify-center py-12 mr-6">

                        {{ cancelLabel }}
                    </v-button>

                    <v-button
                        class="flex-1 text-center justify-center py-12 ml-6"
                        @click="onConfirm">

                        <span class="relative" role="text">
                            {{ confirmLabel }}

                            <span class="absolute ml-5">
                                <a-loading-spinner class="-m-0" color="white" size="sm" :visible="loading" />
                            </span>
                        </span>
                    </v-button>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import api from '@api/routes/account/customers/guibinding';

    export default {
        name: 'MGuiConsolidation',
        props: {
            cancelLabel: {
                type: String,
                default: 'Cancel'
            },
            confirmLabel: {
                type: String,
                default: 'Confirm'
            },
            descLabel: {
                type: String,
                default: ''
            },
            errorLabel: {
                type: String,
                default: 'Sorry, the system is currently unable to connect to the electronic invoice platform of the Ministry of Finance, please try again later, thank you.'
            },
            modalDescLabel: {
                type: String,
                default: ''
            },
            modalHeadingLabel: {
                type: String,
                default: 'Please Confirm'
            },
            submissionUrl: {
                type: String,
                required: true
            },
            toggleLabel: {
                type: String,
                default: 'GUI Carrier Consolidation'
            }
        },
        data() {
            return {
                backUrl: '',
                cardNumber1: '',
                cardNumber2: '',
                cardType: '',
                companyTaxId: '',
                hasError: false,
                loading: false,
                token: ''
            };
        },
        computed: {
            modalHeading() {
                return !this.hasError ? this.modalHeadingLabel : this.errorLabel;
            },
            modalHeadingClass() {
                return !this.hasError ? 'text-lg font-bold leading-base' : 'text-base font-normal leading-tight mb-50';
            }
        },
        mounted() {
            this.$modal.$on.hidden(() => this.resetError());
        },
        methods: {
            async onConfirm() {
                this.loading = true;

                const response = await api.get();
                if(response.success && response.data.Success) {
                    const data = response.data.Data || {};

                    this.backUrl = data.BackUrl;
                    this.companyTaxId = data.CompanyTaxId;
                    this.token = data.Token;

                    // eInvoice service accepts cardNumber1, cardNumber2, and cardType as base64 strings, so we use the btoa method to convert
                    this.cardNumber1 = data.CardNumber1;
                    this.cardNumber2 = data.CardNumber2;
                    this.cardType = data.CardType;

                    this.$nextTick(() => {
                        this.submit();
                        this.$modal.hide();
                    });
                } else {
                    this.setError();
                }

                this.loading = false;
            },
            handleErrorFocus() {
                this.$refs.heading?.setAttribute('tabindex', 0);
                this.$refs.heading?.focus();
            },
            onHeadingBlur() {
                this.$refs.heading.removeAttribute('tabindex');
            },
            resetError() {
                this.hasError = false;
            },
            setError() {
                this.hasError = true;
                this.handleErrorFocus();
            },
            submit() {
                this.$refs.eInvoiceForm?.submit();
            }
        }
    };
</script>
