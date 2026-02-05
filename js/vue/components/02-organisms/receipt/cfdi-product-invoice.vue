<template>
    <div class="o-cfdiProductInvoice bg-white border-gray-50 border-1 rounded py-20 px-24 mb-40">
        <h2 class="text-gray-120 mb-20">{{ labels.Invoice }}</h2>

        <div class="text-sm">
            <p
                v-if="statusMessage"
                class="text-sm"
                :class="statusMessage.class"
                v-text="statusMessage.text"
            />

            <!-- New Invoice Version Available -->
            <template v-if="(downloadAvailable || hasNewVersion)">
                <v-button
                    class="a-button text-base font-medium py-12 px-25 mt-20"
                    :cta="labels.DownloadInvoice"
                    :disabled="isDownloading"
                    data-testid="button-downloadInvoice"
                    @click="downloadInvoice"
                />
            </template>

            <!-- Invoice Download Error -->
            <p v-if="downloadError" class="text-red mt-20">
                {{ labels.DownloadErrorMessage }}
            </p>

            <template v-if="showCfdiForm">
                <m-checkbox
                    id="requestInvoice"
                    v-model="isInvoiceRequested"
                    :label="labels.RequestInvoice"
                    label-mods="text-sm font-normal"
                    data-testid="checkbox-requestInvoice"
                />
                <div v-show="isInvoiceRequested" class="mt-36">
                    <cfdi-product-invoice-form
                        :has-multiple-pay-methods="hasMultiplePayMethods"
                        :labels="labels"
                        :cfdi-use-value="cfdiUseValue"
                        :cfdi-api-error-messages="cfdiData.FormErrors || []"
                        :is-user-errors="cfdiData.IsUserErrors"
                        :order-number="orderNumber"
                        :postal-code="postalCode"
                        :pay-method="payMethod"
                        :is-submitting="isSubmitting"
                        @taxEntityUpdated="hideIfAnApiError()"
                        @submit="submitForm"
                    />
                    <p
                        v-if="isSubmitFailed"
                        class="text-red pt-20">
                        {{ labels.SubmissionErrorMessage }}
                    </p>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    import apiCfdiProductInvoice from '@api/routes/cfdi/productInvoice';
    import apiCfdiDownloadInvoice from '@api/routes/cfdi/pdf';
    import CfdiProductInvoiceForm from './cfdi-product-invoice-form.vue';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import { downloadFromApiService } from '@common/source/js/utils/download';

    export default {
        name: 'OCfdiProductInvoice',
        components: { CfdiProductInvoiceForm },
        props: {
            cfdiData: {
                type: Object,
                default: () => ({})
            },
            cfdiUseValue: {
                type: String,
                default: ''
            },
            hasMultiplePayMethods: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            orderNumber: {
                type: String,
                default: ''
            },
            payMethod: {
                type: String,
                default: ''
            },
            postalCode: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                downloadError: false,
                isDownloading: false,
                isFormSubmitted: false,
                isInvoiceRequested: false,
                isSubmitFailed: false,
                isSubmitting: false
            };
        },
        computed: {
            autoOrManualCancellation() {
                return this.cfdiData?.Status === 6 ||
                    (this.cfdiData?.Status === 2 && !this.cfdiData?.CanRequestCfdi &&
                        [1, 2, 4].includes(this.cfdiData?.CancellationReason));
            },
            canNoLongerRequestOrDownload() {
                return this.cfdiData?.Status === 2 && !this.cfdiData?.CanRequestCfdi &&
                    this.cfdiData?.CancellationReason === 3;
            },
            canRequestInvoice() {
                return [8, 9].includes(this.cfdiData?.Status) && this.cfdiData?.CanRequestCfdi;
            },
            delayedInvoice() {
                return this.cfdiData?.Status === 0 && !this.cfdiData?.IsUserErrors;
            },
            downloadAvailable() {
                return this.isInvoiceDownloadable && (this.cfdiData?.CancelledInvoiceNewOrderNumber === null ||
                    this.cfdiData?.CancelledInvoiceNewOrderNumber === '');
            },
            formattedCanViewCfdiUntilDate() {
                return replaceToken(this.labels.HasNewVersion, this.cfdiData?.FormattedCanViewCfdiUntilDate);
            },
            invoiceAvailableUntilMsg() {
                return replaceToken(this.labels.InvoiceAvailableUntil, this.cfdiData?.FormattedCanViewCfdiUntilDate);
            },
            hasFormErrors() {
                return this.cfdiData?.FormErrors?.length > 0 && this.cfdiData?.IsUserErrors &&
                    this.cfdiData?.Status === 0;
            },
            hasNewVersion() {
                return this.isInvoiceDownloadable && this.cfdiData?.CancelledInvoiceNewOrderNumber !== '';
            },
            isCancelled() {
                return this.cfdiData?.Status === 2 && !this.cfdiData?.CanRequestCfdi && this.cfdiData?.CancellationReason === 5;
            },
            isExpired() {
                return (this.cfdiData?.Status === 5 && !this.cfdiData?.CanViewCfdi) ||
                    ([8, 9].includes(this.cfdiData?.Status) && !this.cfdiData?.CanRequestCfdi);
            },
            isInvoiceDownloadable() {
                return !!(this.cfdiData?.Status === 5 && this.cfdiData?.CanViewCfdi && !this.cfdiData?.CanRequestCfdi &&
                    this.cfdiData?.CanViewCfdiUntilDate);
            },
            isRequestInProcess() {
                return this.isFormSubmitted || this.cfdiData?.Status === 7 ||
                    (this.cfdiData?.Status === 1 && !this.cfdiData?.CanRequestCfdi);
            },
            showCfdiForm() {
                return (this.startProcessAgain || this.canRequestInvoice || this.hasFormErrors) && !this.isFormSubmitted;
            },
            startProcessAgain() {
                return this.cfdiData?.Status === 2 && this.cfdiData?.CanRequestCfdi &&
                    this.cfdiData?.CancellationReason === 3;
            },
            statusMessage() {
                if(this.isExpired) return { text: this.labels.ExpiredInvoiceMessage };
                else if(this.isCancelled) return { text: this.labels.InvoiceCancelled };
                else if(this.downloadAvailable) return { text: this.invoiceAvailableUntilMsg };
                else if(this.hasNewVersion) return { text: this.formattedCanViewCfdiUntilDate };
                else if(this.autoOrManualCancellation) return { text: this.labels.AutoOrManualCancellation };
                else if(this.delayedInvoice) return { text: this.labels.DelayedInvoice };
                else if(this.canNoLongerRequestOrDownload) return { text: this.labels.CanNoLongerRequestOrDownload, class: 'mt-20' };
                else if(this.startProcessAgain && !this.isFormSubmitted) return { text: this.labels.StartProcessAgain, class: 'my-20' };
                else if(this.isRequestInProcess) return { text: this.labels.SubmissionSuccess };
                return '';
            }
        },
        mounted() {
            if(this.cfdiData?.FormErrors && this.cfdiData.FormErrors.length > 0) {
                this.isInvoiceRequested = true;
            }
        },
        methods: {
            hideIfAnApiError() {
                // If tax entity switched, hide localized error message below the form
                if(this.isSubmitFailed) this.isSubmitFailed = false;
            },
            async submitForm(payload) {
                if(this.isSubmitting) return;
                try {
                    this.isSubmitting = true;
                    this.isSubmitFailed = false;
                    console.log('payload', payload);
                    const response = await apiCfdiProductInvoice.post(payload);
                    if(response.success && response.data?.Success) {
                        this.isFormSubmitted = true;
                    } else {
                        this.isFormSubmitted = false;
                        // Show localized error message below the form
                        this.isSubmitFailed = true;
                    }
                } catch (error) {
                    this.isFormSubmitted = false;
                    this.isSubmitFailed = true;
                    console.error('Some Network issue:', error);
                } finally {
                    this.isSubmitting = false;
                }
            },
            async downloadInvoice() {
                if(this.isDownloading) return;
                this.isDownloading = true;
                this.downloadError = false;

                try {
                    const orderNumberForDownload = this.cfdiData?.CancelledInvoiceNewOrderNumber
                        ? this.cfdiData.CancelledInvoiceNewOrderNumber : this.orderNumber;
                    const result = await downloadFromApiService(apiCfdiDownloadInvoice, {
                        slug: `?OrderNumber=${encodeURIComponent(orderNumberForDownload)}`,
                        fileName: `invoice-${orderNumberForDownload}.pdf`,
                        mime: 'application/pdf',
                        config: {
                            responseType: 'blob',
                            headers: { Accept: 'application/octet-stream' }
                        }
                    });

                    if(!result.success) this.downloadError = true;
                } catch (e) {
                    console.error('CFDI PDF Download Failed:', e);
                    this.downloadError = true;
                } finally {
                    this.isDownloading = false;
                }
            }
        }
    };
</script>
