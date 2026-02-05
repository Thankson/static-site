<template>
    <article v-if="data.CanShow" class="o-cfdi">
        <h2 class="o-cfdi__title" v-html="labels.TaxReceiptTitle"></h2>
        <p class="o-cfdi__text" v-html="labels.TaxReceiptText"></p>
        <!-- cfdi certificate options -->
        <div v-if="isCertificateOptions" class="flex flex-col">
            <m-cfdi-certificate-opts
                :common-certificate="commonCertificate"
                :additional-certificate="additionalCertificate"
                :selected-cert-option="selectedCertOption"
                :labels="labels"
                @selectedCertificate="getSelectedCertificate">
            </m-cfdi-certificate-opts>
            <!-- Save default -->
            <div class="o-cfdi__saveDefault">
                <div class="o-cfdi__saveLoading">
                    <a-loading-spinner :visible="loadingSavedDefault" size="sm" />
                </div>
                <button
                    v-if="!isDefaultSaved && !isfirstLoad"
                    class="o-cfdi__saveButton"
                    :aria-label="labels.ButtonSaveAsDefault"
                    @click="saveAsDefault"
                    v-html="labels.ButtonSaveAsDefault">
                </button>

                <div v-if="isDefaultSaved" class="o-cfdi__saved" v-html="labels.DefaultSaved"></div>

            </div>
        </div>

        <div class="o-cfdi__actions">
            <v-button
                :cta="labels.ButtonText"
                :aria-label="labels.ButtonAriaLabel"
                class="-backupOrder -center mb-16 md:mb-10"
                :class="{'-disabled -cursor-pointer' : !canRequestCfdi}"
                @click="[requestCfdi(), gtmTrackAction({id: 191, text: labels.ButtonText}, $event)]" />
            <div class="o-cfdi__loading">
                <a-loading-spinner :visible="loading" size="sm" />
            </div>
        </div>
        <p v-if="showSuccessMessage" role="alert" class="o-cfdi__message -success" v-html="labels.TaxReceiptSentText"></p>
        <p v-if="showErrorMessage" role="alert" class="o-cfdi__message -error" v-html="labels.TaxReceiptUnavailable"></p>
        <p v-if="showEmailMissingMessage" role="alert" class="o-cfdi__message -error" v-html="labels.TaxReceiptEmailMissingText"></p>
        <p v-if="showSaveDefaultError" role="alert" class="o-cfdi__message -error" v-html="labels.SaveDefaultCertificateError"></p>
        <p v-if="showDuplicateMessage" role="alert" class="o-cfdi__message -error" v-html="labels.TaxReceiptDuplicate"></p>
    </article>
</template>

<script>
    import cfdiApi from '@api/routes/receipt/cfdi';
    import taxRegime from '@api/routes/receipt/taxRegime';
    import CfdiCertificateOpts from '../../01-molecules/receipt/cfdi-certificate-options.vue';
    export default {
        name: 'OCfdi',
        components: {
            'm-cfdi-certificate-opts': CfdiCertificateOpts
        },
        props: {
            labels: {
                type: Object,
                default: () => ({})
            },
            orderDate: {
                type: String,
                required: true
            },
            orderNumber: {
                type: String,
                required: true
            },
            orderStatus: {
                type: String,
                required: true
            },
            params: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                data: {},
                loading: false,
                loadingSavedDefault: false,
                errorMessage: '',
                showSuccessMessage: false,
                showErrorMessage: false,
                showEmailMissingMessage: false,
                showDuplicateMessage: false,
                showSaveDefaultError: false,
                commonCertificate: {},
                additionalCertificate: {},
                selectedCertOption: {},
                isDefaultSaved: false,
                isfirstLoad: true,
                isCertificateOptions: false,
                canRequestCfdi: false
            };
        },
        mounted() {
            this.getData();
            // Get the certificate lists
            this.getCertificateList();
        },
        methods: {
            dataLayerPushError(errorMessage) {
                window.dataLayer && window.dataLayer.push({
                    'event': 'Error State',
                    'errorType': 'CFDI Error',
                    'errorMessage': errorMessage
                });
            },
            getData: async function() {
                const response = await cfdiApi.query({ OrderDate: this.orderDate, OrderStatus: this.orderStatus, OrderNumber: this.orderNumber, ...this.params });
                if(response.success) {
                    this.data = response.data?.Data;
                    this.enableCfdiRequest();
                    if(this.data.IsDuplicateRequest) {
                        this.showDuplicateMessage = true;
                    }
                }
            },
            requestCfdi: async function() {
                if(!this.data.HasEmail) {
                    this.showEmailMissingMessage = true;

                    // GTM DataLayer Push for Errors
                    this.dataLayerPushError(this.labels.TaxReceiptEmailMissingText);
                }

                if(!this.data.CanRequest) {
                    this.showErrorMessage = true;

                    // GTM DataLayer Push for Errors
                    this.dataLayerPushError(this.labels.TaxReceiptUnavailable);
                }

                if(this.canRequestCfdi && this.data.HasEmail) {
                    this.showSuccessMessage = false;
                    this.showErrorMessage = false;
                    this.showEmailMissingMessage = false;
                    this.loading = true;
                    const response = await cfdiApi.post({ OrderNumber: this.orderNumber, TaxRegime: this.selectedCertOption?.certificate || '' });
                    this.loading = false;
                    if(response.success) {
                        this.showSuccessMessage = true;
                        this.canRequestCfdi = false;
                        return;
                    }
                    console.warn(response.error);

                    // GTM DataLayer Push for Errors
                    this.dataLayerPushError(this.labels.TaxReceiptUnavailable);
                }
            },
            async saveAsDefault() {
                this.isDefaultSaved = false;
                this.loadingSavedDefault = true;

                const response = await taxRegime.post({ TaxRegime: this.selectedCertOption.certificate });
                this.loadingSavedDefault = false;
                if(response.success) {
                    this.isDefaultSaved = true;
                } else {
                    this.isDefaultSaved = false;
                    this.showSaveDefaultError = true;
                    console.warn(response.error);
                }
            },
            getSelectedCertificate(obj) {
                this.isfirstLoad = false;
                this.selectedCertOption = obj;
                this.enableCfdiRequest();
                if(this.selectedCertOption.certificate !== this.labels.DefaultCertificate) {
                    this.isDefaultSaved = false;
                }
            },
            getCertificateList() {
                const allCertificates = this.labels?.Certificates || '';
                if((allCertificates?.Common && Object.keys(allCertificates.Common).length > 0) ||
                    (allCertificates?.Additional && Object.keys(allCertificates.Additional).length > 0)) {
                    this.isCertificateOptions = true;
                    this.commonCertificate = this.labels.Certificates.Common;
                    this.additionalCertificate = this.labels.Certificates.Additional;
                    this.setDefaultAsInitial();
                }
            },
            setDefaultAsInitial() {
                for (const certificates in this.labels.Certificates) {
                    for (const certificate in this.labels.Certificates[certificates]) {
                        if(certificate === this.labels.DefaultCertificate) {
                            this.defaultCertName = this.labels.Certificates[certificates][certificate];
                            this.selectedCertOption['certificate'] = this.labels.DefaultCertificate;
                            this.selectedCertOption['name'] = this.defaultCertName;
                            return this.selectedCertOption;
                        }
                    }
                }
            },
            enableCfdiRequest() {
                if(this.data.CanRequest) {
                    this.canRequestCfdi = true;
                    if(this.isCertificateOptions && !this.selectedCertOption.certificate) {
                        this.canRequestCfdi = false;
                    }
                } else {
                    this.canRequestCfdi = false;
                }
            }
        }
    };
</script>
