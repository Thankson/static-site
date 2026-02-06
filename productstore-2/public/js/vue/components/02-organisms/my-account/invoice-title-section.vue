<template>
    <div class="o-acctSettProfile -invoice">
        <div class="o-acctSettProfile__wrapper">
            <h2 class="o-acctSettProfile__title">{{ getLocalizationProp('Labels.Title', 'Invoice Title') }}</h2>

            <div class="o-acctSettProfile__subtitle">{{ subTitle }}</div>

            <update-invoice-title
                :labels="updateInvoiceTitleLabels"
                :invoice-titles="invoiceTitle"
                :cur-invoice-title="currentInvoiceTitle"
                :cur-invoice-type="curInvoiceTitleType"
                @update-title="updateTitle"
            ></update-invoice-title>
        </div>

    </div>
</template>

<script>
    import api from '@api/routes/account/getinvoicetitles';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import updateInvoiceTitle from '../../01-molecules/my-account/update-invoice-title.vue';

    export default {
        name: 'InvoiceTitleSection',

        components: {
            updateInvoiceTitle
        },

        mixins: [ localizationMixin],

        props: {
            scriptId: {
                type: String,
                default: 'data-localization'
            }
        },

        data() {
            return {
                invoiceTitle: [],
                editTitle: false
            };
        },

        computed: {
            updateInvoiceTitleLabels() {
                return {
                    title: this.getLocalizationProp('Labels.InvoiceTitle', 'Title'),
                    change: this.getLocalizationProp('Labels.Change', 'Change'),
                    submit: this.getLocalizationProp('Labels.Submit', 'Submit')
                };
            },
            currentInvoiceTitle() {
                return this.invoiceTitle?.filter((item) => {
                    return item.IsSelected === true;
                })[0]?.Title;
            },
            curInvoiceTitleType() {
                return this.invoiceTitle?.filter((item) => {
                    return item.IsSelected === true;
                })[0]?.InvoiceTitleType;
            },
            isCn: function () {
                return this.$env?.IsCn || false;
            },
            subTitle() {
                return this.editTitle ? this.getLocalizationProp('Labels.EditSubTitle', 'Invoice EditTitle') : this.getLocalizationProp('Labels.SubTitle', 'Invoice Title');
            }
        },

        created() {
            if(this.apiEndpoint) {
                api.setRoute(this.apiEndpoint);
            }
        },
        async mounted() {
            this.getInvoiceTitle();
        },
        methods: {
            async updateTitle(value) {
                if(value === false) {
                    await this.getInvoiceTitle();
                }
                this.editTitle = value;
            },
            async getInvoiceTitle() {
                const response = await api.get();
                if(response.success) {
                    this.invoiceTitle = response.data?.Data || {};
                }
            }
        }
    };
</script>
