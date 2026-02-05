<template>
    <div class="p-productsSurvey">
        <!-- If the link is valid -->
        <div v-if="!isExpired && surveyId" class="p-productsSurvey__wrapper">
            <!-- Survey Banner -->
            <m-survey-banner
                v-if="loaded"
                class="mb-20"
                :localization="localization"
                :survey-id="surveyId"
                :survey-status="isResult ? 'Complete' : 'Incomplete'"
                :is-authenticated="userFlags.IsAuthenticated"
                :products-total="String(totalProducts)"
                :products-points="String(totalPoints)"
                :products-commitment="String(totalCommitment)" />

            <!-- Survey Form/Result -->
            <div v-if="loaded" class="p-productsSurvey__container">
                <!-- Form -->
                <form v-if="!isResult" class="p-productsSurvey__form" @submit.prevent>
                    <!-- Accordion for each category -->
                    <o-survey-accordion
                        v-for="(section, index) in storedSurveyOptions" :key="index"
                        :accordion-index="index"
                        :localization="localization"
                        :section="section"
                        @update-choices="(choices) => updateChoices(choices)" />

                    <!-- Referrer Information -->
                    <p v-if="resultsSentTo && referrerInformation" class="m-0 p-0 text-sm text-gray-120">
                        {{ resultsSentTo }}
                    </p>

                    <!-- CTA and Error -->
                    <div class="p-productsSurvey__controls">
                        <!-- Get Results CTA -->
                        <button
                            type="submit"
                            class="p-productsSurvey__button a-button"
                            :aria-label="getLocalizationProp('Labels.GetResults')"
                            @click.prevent="submitSurvey($event)">
                            {{ getLocalizationProp('Labels.GetResults') }}
                        </button>

                        <!-- Show API/FE errors messages -->
                        <div v-if="listError && listError.length" class="p-productsSurvey__error e-formError">
                            <p v-for="(validation, index) in listError" :key="index" class="e-formError__item py-0" role="alert">
                                {{ validation.error ? validation.error : validation }}
                            </p>
                        </div>
                    </div>
                </form>

                <!-- Result -->
                <div v-else-if="storedSurveyResults && storedSurveyResults.Sections" class="p-productsSurvey__result">
                    <!-- Accordion for each category -->
                    <o-survey-accordion
                        v-for="(section, index) in storedSurveyResults.Sections" :key="index"
                        :localization="localization"
                        :section="section"
                        @update-total-products="updateTotalProducts" />

                    <!-- Total -->
                    <h3
                        class="mt-30 md:mt-50 text-2xl md:text-center"
                        role="alert"
                        v-html="totalPhrase"
                    ></h3>

                    <!-- CTAs -->
                    <div class="p-productsSurvey__controls">
                        <!-- Spinner used on Add to List -->
                        <a-loading-spinner :visible="loadingProductsToList" aria-hidden="true" />

                        <!-- Save Your List CTA -->
                        <button
                            v-if="userFlags.IsAuthenticated && userFlags.ViewLists && totalProducts > 0"
                            type="button"
                            class="p-productsSurvey__button a-button -white mb-20"
                            :aria-label="getLocalizationProp('Labels.SaveList')"
                            @click="addToList()">
                            {{ getLocalizationProp('Labels.SaveList') }}
                        </button>

                        <!-- Display generic error message for Save Your List -->
                        <div v-if="storedSurveyListError" class="e-formError -mt-10 mb-20">
                            <p class="e-formError__item m-0 p-0" role="alert">
                                {{ listGenericErrorMsg }}
                            </p>
                        </div>

                        <!-- Edit Results CTA -->
                        <button
                            type="button"
                            class="p-productsSurvey__button a-button"
                            :aria-label="getLocalizationProp('Labels.EditResults')"
                            @click="enableEdit()">
                            {{ getLocalizationProp('Labels.EditResults') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Become Member Section - Only on result page and for non-members (signed in/signed out) -->
            <div v-if="showBecomeMember" class="pt-40">
                <!-- Become Member Banner -->
                <slot name="become-member" />
            </div>

            <!-- Follow Up - Only on result page and for users that followed a share link -->
            <h4 v-if="isResult && followUpPhrase" class="p-productsSurvey__followup" v-html="followUpPhrase"></h4>
        </div>
        <!-- If the link is NOT valid -->
        <div v-else class="p-productsSurvey__wrapper">
            <div
                v-if="loaded"
                class="p-productsSurvey__container -expired">
                <div class="p-productsSurvey__expired">
                    <!-- Title -->
                    <h2
                        class="text-gray-150 text-2xl md:text-2xl-2 font-bold md:font-normal mb-20 md:mb-10"
                        alert="role">
                        {{ getLocalizationProp('Labels.Error.LinkExpired') }}
                    </h2>

                    <!-- Description -->
                    <p class="text-gray-150 text-base" alert="role">{{ getLocalizationProp('Labels.Error.TryAgain') }}</p>

                    <!-- CTA -->
                    <a
                        :href="getLocalizationProp('Data.AboutUsPage.Url')"
                        class="p-productsSurvey__button a-button -white -surveyExpired">
                        {{ getLocalizationProp('Labels.LearnAboutUs') }}
                    </a>
                </div>
            </div>
        </div>

        <!-- Show spinner while API is being loaded -->
        <div v-if="storedApiLoading" class="p-productsSurvey__loading">
            <a-loading-spinner
                :visible="true"
                size="lg"
                aria-hidden="true">
            </a-loading-spinner>
        </div>

        <!-- Modal - Are you sure? - Tells the user that will override the current list -->
        <modal id="alreadyHasList">
            <template v-slot:heading>
                <span class="text-2xl block md:text-4xl text-gray-150" role="text">
                    {{ getLocalizationProp('Labels.OverwriteListModal.Title') }}
                </span>
            </template>

            <template v-slot:body>
                <div class="text-gray-120 text-sm" v-html="getLocalizationProp('Labels.OverwriteListModal.Body')">
                </div>
            </template>

            <template v-slot:footer>
                <div class="flex items-center">
                    <button
                        class="a-button -white mr-12 inline-block px-25 py-12 text-base font-medium"
                        @click="closeModal('alreadyHasList')">
                        {{ getLocalizationProp('Labels.OverwriteListModal.Cancel') }}
                    </button>
                    <button
                        class="a-button -green inline-block px-25 py-12 text-base font-medium"
                        @click="addProductsToList()">
                        {{ getLocalizationProp('Labels.OverwriteListModal.Save') }}
                    </button>
                    <a-loading-spinner class="pl-10" size="sm" :visible="loadingProductsToListAgain" aria-hidden="true" />
                </div>
            </template>
        </modal>

        <!-- Modal - Result of list items addition -->
        <!-- Can be modal with attention items -->
        <!-- Can be modal with success message -->
        <m-add-items-modal
            v-if="listAdded"
            :ref="modalListAddedResult"
            :from-past-order="false"
            :from-survey="true"
            :is-cart="false"
            :is-buo="false"
            :is-list="true"
            :is-cn="isCn"
            :localization="localization"
            :modal-id="modalListAddedResult"
            @adding-list-hide="() => listAdded = false">
        </m-add-items-modal>
    </div>
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import shoplistsModalMixin from '../../../mixins/shopping-lists-modal';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'ProductsSurvey',
        mixins: [ localizationMixin, shoplistsModalMixin ],
        props: {
            isCn: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                loaded: false,
                urlParams: {},
                isResult: false,
                isEditing: false,
                listError: [],
                totalProducts: 0,
                loadingProductsToList: false,
                loadingProductsToListAgain: false,
                listAdded: false,
                modalListAddedResult: 'modalListAdded'
            };
        },
        computed: {
            ...mapState('productsSurvey', ['storedApiLoading', 'storedApiError', 'storedSurveyInfo', 'storedSurveyOptions', 'storedSurveyResults', 'hasWhichProductsList', 'storedSurveyListAdded', 'storedSurveyListResult', 'storedSurveyListError']),

            surveyId() {
                // Get surveyId from query string
                if(this.urlParams.get('surveyId')) return this.urlParams.get('surveyId');

                // Get surveyId from localization
                return this.localization?.Data?.SurveyId || null;
            },
            accessCode() {
                // Get accessCode from query string
                if(this.urlParams.get('accessCode')) return this.urlParams.get('accessCode');

                // Get accessCode from localization
                return this.localization?.Data?.AccessCode || null;
            },
            emailAddress() {
                // Get emailAddres from query string or localization
                return this.urlParams.get('emailAddress') || this.localization?.Data?.EmailAddress || null;
            },
            hidePoints() {
                return this.$env?.HidePoints || false;
            },
            isExpired() {
                return this.storedSurveyInfo?.AccessCode?.IsExpired;
            },
            isLastSubmit() {
                const searchParams = new URLSearchParams(window.location.search);
                const today = new Date().toLocaleDateString();

                return searchParams.get('completed') && today === searchParams.get('date');
            },
            isMember() {
                return this.userFlags?.IsAuthenticated && this.userFlags?.ViewMemberPricing;
            },
            showBecomeMember() {
                return this.isResult && !this.isMember;
            },
            referrerInformation() {
                return this.storedSurveyInfo?.AccessCode?.ReferrerInformation || null;
            },
            resultsSentTo() {
                return replaceTokenArray(this.localization?.Labels?.ResultsSentTo, [this.referrerInformation?.Name || '']);
            },
            totalPoints() {
                let str = '0';

                if(this.isResult && this.storedSurveyResults) {
                    // Pass price values instead of points in case of HidePoints flag
                    const points = this.hidePoints ? this.storedSurveyResults.TotalPrice : this.storedSurveyResults.TotalPoints;

                    if(points && typeof points === 'object') {
                        const defaultPoint = this.hidePoints ? points?.MaxPrice : points?.MaxPoints;
                        const showRange = this.hidePoints ? points?.ShowRangeForPrice : points?.ShowRangeForPoints;
                        str = showRange ? `${points?.MinPoints}-${defaultPoint}` : defaultPoint;
                    } else if(points) {
                        str = points;
                    }
                }

                return str;
            },
            totalCommitment() {
                let str = '0';

                if(this.isResult && this.storedSurveyResults) {
                    const commitment = this.storedSurveyResults.TotalCommitment;

                    if(commitment && typeof commitment === 'object') {
                        if(commitment.ShowRangeForCommitment) {
                            str = `${commitment.MinCommitment}-${commitment.MaxCommitment}`;
                        } else {
                            str = commitment.MaxCommitment;
                        }
                    } else if(commitment) {
                        str = commitment;
                    }
                }

                return str;
            },
            totalPhrase() {
                const products = this.localization?.Labels?.Products;
                const productPoints = this.hidePoints ? '' : this.localization?.Labels?.ProductPoints;
                const productCommitment = this.localization?.Labels?.ProductCommitment;
                const whichTotal = this.localization?.Labels?.WhichTotal;

                if(!this.useProductsCommitment) {
                    return `<span class="font-bold uppercase">
                                ${this.totalProducts} ${products}
                            </span> <span class="lowercase">${whichTotal}</span> <span class="capitalize">${this.totalPoints} ${productPoints}</span>`;
                } else {
                    return `<span class="font-bold uppercase">
                                ${this.totalProducts} ${products}
                            </span> <span class="lowercase">${whichTotal}</span> <span class="capitalize">${this.totalCommitment} ${productCommitment}</span>`;
                }
            },
            useProductsCommitment() {
                return this.localization?.Data?.UseProductsCommitment || false;
            },
            followUpPhrase() {
                if(this.referrerInformation) {
                    return replaceTokenArray(
                        this.localization?.Labels?.FollowUp,
                        [
                            `<span class="font-bold">${this.referrerInformation.Name || ''}</span>`,
                            `<span class="font-bold">${this.referrerInformation.PhoneNumber || ''}</span>`
                        ]
                    );
                }

                return null;
            },
            userFlags() {
                return this.localization?.Data?.UserFlags || {};
            },
            listInfo() {
                return this.storedSurveyListResult?.List || {};
            },
            listGenericErrorMsg() {
                return this.localization?.Labels?.ShoppingListGenericFailureMessage || 'Error';
            }
        },
        watch: {
            storedApiError() {
                this.listError = this.storedApiError;
            }
        },
        created() {
            this.urlParams = new URLSearchParams(window.location.search);
        },
        async mounted() {
            this.checkPreviousResults();

            this.loaded = true;
        },
        methods: {
            ...mapActions('productsSurvey', ['getSurveyOptions', 'saveSurvey', 'setSurveyList', 'getSavedResults']),
            ...mapMutations('productsSurvey', ['SET_SURVEY_RESULTS', 'SET_SURVEY_OPTIONS', 'SET_SURVEY_INFO', 'SET_UPDATED_CHOICES']),

            async checkPreviousResults() {
                const data = JSON.parse(sessionStorage.getItem('productSurvey'));

                if(this.isLastSubmit && data) {
                    const accessCode = JSON.parse(sessionStorage.getItem('accessCode'));
                    this.SET_SURVEY_RESULTS(data.Results);
                    this.SET_SURVEY_INFO({ AccessCode: accessCode });
                    this.SET_SURVEY_OPTIONS(data.Sections);
                    this.verifyHasResults();
                    return;
                }

                const payload = {
                    datasourceId: this.surveyId,
                    accessCode: this.accessCode || '',
                    guestEmailAddress: this.emailAddress || ''
                };
                await this.getSurveyOptions(payload);
            },
            validateSurvey() {
                let selected = 0;
                for (const section of this.storedSurveyOptions) {
                    for (const option of section.Options) {
                        if(option.Selected) {
                            selected++;
                            break;
                        }
                    }

                    if(selected > 0) {
                        break;
                    }
                }

                return selected > 0;
            },
            async submitSurvey(event) {
                event.preventDefault();
                this.listError = [];

                if(this.validateSurvey()) {
                    const forceSave = new URLSearchParams(window.location.search).get('forceSave');
                    const emailAddress = new URLSearchParams(window.location.search).get('emailAddress');

                    // Save survey
                    await this.saveSurvey({
                        AccessCode: this.accessCode,
                        EmailAddress: emailAddress,
                        ForceSave: forceSave,
                        SurveyId: this.surveyId,
                        Sections: this.storedSurveyOptions,
                        IsEditing: this.isEditing
                    });

                    this.isEditing = false;

                    this.verifyHasResults();
                } else {
                    this.listError.push(
                        this.localization?.Labels?.Error?.SelectItems || 'Error'
                    );
                }
            },
            async addProductsToList() {
                const forceSave = new URLSearchParams(window.location.search).get('forceSave');
                const emailAddress = new URLSearchParams(window.location.search).get('emailAddress');
                this.loadingProductsToListAgain = true;
                let allResults = [];
                this.storedSurveyResults.Sections.forEach(surveyResult => {
                    surveyResult.Results
                        .filter(result => result.IsProduct && result.ProductInnerData)
                        .forEach(result => allResults.push({
                            Sku: result.ProductInnerData.Sku,
                            Quantity: 1,
                            Configurations: result.ProductInnerData.Configurations
                        }));
                });

                const data = {
                    AccessCode: this.accessCode,
                    EmailAddress: emailAddress,
                    ForceSave: forceSave,
                    SurveyId: this.surveyId,
                    Sections: this.storedSurveyOptions,
                    IsEditing: this.isEditing,
                    Results: allResults
                };

                await this.setSurveyList(data);
                this.loadingProductsToListAgain = false;

                // If the items were added
                if(this.storedSurveyListAdded) {
                    this.listAdded = true;

                    // Open result modal:
                    // Can be modal with attention items
                    // Can be modal success message
                    this.handleItemsAddedToList(this.listInfo, this.modalListAddedResult);
                } else {
                    this.listAdded = false;
                    this.$modal.hide({id: 'alreadyHasList'});
                }
            },
            async addToList() {
                if(this.hasWhichProductsList) {
                    this.$modal.show({id: 'alreadyHasList'});
                } else {
                    this.loadingProductsToList = true;
                    await this.addProductsToList();
                    this.loadingProductsToList = false;
                }
            },
            closeModal(modalId) {
                this.$modal.hide({id: modalId});
            },
            async enableEdit() {
                this.isEditing = true;
                this.isResult = false;
                this.totalProducts = 0;

                this.scrollTop();
            },
            scrollTop() {
                window.scroll({top: 0, left: 0, behavior: 'smooth'});
            },
            updateChoices(choices) {
                this.SET_UPDATED_CHOICES(choices);
            },
            updateTotalProducts(products) {
                this.totalProducts = this.totalProducts + products;
            },
            verifyHasResults() {
                // If there's results, then enable result page
                if(this.storedSurveyResults?.Sections) {
                    this.isResult = true;

                    this.scrollTop();
                }
            }
        }
    };
</script>
