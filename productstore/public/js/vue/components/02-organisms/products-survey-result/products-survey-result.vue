<template>
    <div class="o-productsSurveyResult">
        <div v-if="loading" class="o-productsSurveyResult__loadingWrapper">
            <a-loading-spinner class="o-productsSurveyResult__loadingSpinner" :visible="loading" />
        </div>
        <template v-else-if="!isExpired">
            <div class="o-productsSurveyResult_title mb-36" v-html="title"></div>

            <table v-for="(item, index) in surveyResult" :key="item.Title" class="o-productsSurveyResult__table">
                <thead class="o-productsSurveyResult__head">
                    <tr class="o-productsSurveyResult__row -head">
                        <th class="o-productsSurveyResult__col -title">{{ item.Title }}</th>
                        <th class="o-productsSurveyResult__col -value">{{ index === 0 ? item.Type : '' }}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="i in item.Results">
                        <tr v-if="i.ProductInnerData" :key="i.Title" class="o-productsSurveyResult__row -data">
                            <td class="o-productsSurveyResult__col -title">
                                {{ i.ProductInnerData.FamilyTitle }}
                            </td>
                            <td class="o-productsSurveyResult__col -value">
                                {{ useProductsCommitment ? i.ProductInnerData.PriceRange.RawMaxPreferredPrice : i.ProductInnerData.PriceRange.MaxPoints }}
                            </td>
                        </tr>
                    </template>

                    <tr class="o-productsSurveyResult__row -footer">
                        <td class="o-productsSurveyResult__col -title">{{ subtotalLabel }}</td>
                        <td class="o-productsSurveyResult__col -value">{{ item.SubtotalValue }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="o-productsSurveyResult__total">
                <span class="o-productsSurveyResult__totalLabel -title">{{ getLocalizationProp('Labels.Total') }}</span>
                <span class="o-productsSurveyResult__totalValue -value">{{ total }}</span>
            </div>

            <div class="o-productsSurveyResult__note mt-64" v-html="getLocalizationProp('Data.Note')"></div>
        </template>
        <div v-else class="o-productsSurveyResult__expired">
            <h1 class="o-productsSurveyResult__expiredTitle">{{ getLocalizationProp('Labels.Error.LinkExpired') }}</h1>
            <div class="o-productsSurveyResult__expiredDescription">{{ getLocalizationProp('Labels.Error.LinkExpiredDescription') }}</div>

            <v-button
                class="o-productsSurveyResult__expiredCta -transparent"
                is-anchor
                :href="getLocalizationProp('Data.AboutUsPage.Url')"
                :target="getLocalizationProp('Data.AboutUsPage.Target')"
            >
                {{ getLocalizationProp('Labels.LearnAboutUs') }}
            </v-button>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/productsurveyresult';

    export default {
        name: 'OProductsSurveyResult',
        mixins: [ localizationMixin],
        data() {
            return {
                isExpired: false,
                loading: false,
                recipientInformation: {},
                surveyResult: [],
                total: '',
                totalWithSymbol: ''
            };
        },
        computed: {
            isCustomer() {
                return this.recipientInformation?.IsCustomer || false;
            },
            subtotalLabel() {
                return this.getLocalizationProp('Labels.Subtotal');
            },
            title() {
                return (this.isCustomer
                    ? this.getLocalizationProp('Data.TitleForCustomer')
                    : this.getLocalizationProp('Data.TitleForNonCustomer'))
                    .replace('{0}', this.isCustomer ? (this.recipientInformation?.Name || '') : (this.recipientInformation?.Email || this.recipientInformation?.PhoneNumber || this.recipientInformation?.Name || ''))
                    .replace('{1}', `${this.totalWithSymbol}${this.type}`);
            },
            type() {
                const commitmentLabel = this.getLocalizationProp('Labels.Commitment');
                const pointsLabel = this.getLocalizationProp('Labels.Points');
                return this.useProductsCommitment ? commitmentLabel : pointsLabel;
            },
            useProductsCommitment() {
                return this.getLocalizationProp('Data.UseProductsCommitment');
            }
        },
        mounted () {
            this.getData();
        },
        methods: {
            async getData() {
                const url = new URL(window.location);
                const accessCode = url.searchParams.get('accessCode');
                if(!accessCode) {
                    this.isExpired = true;
                    return;
                }

                this.loading = true;
                const response = await api.query({ accessCode });
                if(response.success && response.data?.Success) {
                    const apiData = response.data?.Data || {};
                    this.isExpired = apiData?.AccessCode?.IsExpired || false;
                    if(!this.isExpired) {
                        this.surveyResult = (apiData?.SurveyResult?.Sections || []).map(i => {
                            return {
                                ...i,
                                Title: i.Title,
                                Type: this.type,
                                SubtotalValue: this.useProductsCommitment
                                    ? i.Commitment?.RawMaxCommitment || ''
                                    : i.Points?.MaxPoints || ''
                            };
                        });
                        this.total = this.useProductsCommitment
                            ? apiData?.SurveyResult?.TotalCommitment?.RawMaxCommitment || ''
                            : apiData?.SurveyResult?.TotalPoints?.MaxPoints || '';
                        this.totalWithSymbol = this.useProductsCommitment
                            ? apiData?.SurveyResult?.TotalCommitment?.MaxCommitment || ''
                            : apiData?.SurveyResult?.TotalPoints?.MaxPoints || '';
                        this.recipientInformation = apiData?.AccessCode?.RecipientInformation || {};
                    }
                } else {
                    this.isExpired = true;
                }
                this.loading = false;
            }
        }
    };
</script>
