<template>
    <section class="o-gcmsResults">
        <!-- Show spinner while API is being loaded -->
        <div v-if="!loaded" class="o-gcmsResults__loading">
            <a-loading-spinner
                :visible="true"
                aria-hidden="true">
            </a-loading-spinner>
        </div>

        <!-- Page Title and Search Form -->
        <div class="o-gcmsResults__header">
            <!-- Title -->
            <h1 class="o-gcmsResults__title">
                {{ getLocalizationProp('Labels.PageTitle') }}
            </h1>

            <!-- GCMS Search Form -->
            <div class="o-gcmsResults__search">
                <m-gcms-search
                    :action-url="actionUrl"
                    :input-value="searchQuery"
                    :localization="getLocalizationProp('Labels.GCMSSearchForm', null) || {}"
                    @gcms-search-submitted="newSearch" />
            </div>
        </div>

        <!-- Search Results -->
        <div v-if="result" class="o-gcmsResults__container" :class="{'-noResults' : !hasResults}">
            <!-- Back CTA -->
            <div class="o-gcmsResults__back">
                <a :href="getLocalizationProp('Data.ReturnPage.Url', '#')">
                    <span class="o-gcmsResults__arrow">arrow_back</span>
                    {{ getLocalizationProp('Labels.Back') }}
                </a>
            </div>

            <!-- If there's NO results -->
            <div v-if="!hasResults" class="o-gcmsResults__noResults">
                <p>{{ noResultsPhrase }}</p>
            </div>

            <!-- If there's results -->
            <div v-else class="o-gcmsResults__wrapper">
                <div class="o-gcmsResults__headerResult">
                    <!-- Left Column -->
                    <div class="o-gcmsResults__col -left">
                        <!-- Essential Oil -->
                        <div class="o-gcmsResults__info">
                            <span class="font-bold uppercase">{{ getLocalizationProp('Labels.EssentialOil') }} :</span>
                            {{ result.Name }}
                        </div>

                        <!-- Botanical Source -->
                        <div class="o-gcmsResults__info">
                            <span class="font-bold uppercase">{{ getLocalizationProp('Labels.BotanicalSource') }} :</span>
                            {{ result.Source }}
                        </div>

                        <!-- Analysis Date -->
                        <div class="o-gcmsResults__info">
                            <span class="font-bold uppercase">{{ getLocalizationProp('Labels.AnalysisDate') }} :</span>
                            {{ result.AnalysisDate }}
                        </div>

                        <!-- Origin -->
                        <div class="o-gcmsResults__info">
                            <span class="font-bold uppercase">{{ getLocalizationProp('Labels.Origin') }} :</span>
                            {{ result.Origin }}
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="o-gcmsResults__col">
                        <!-- Type -->
                        <div class="o-gcmsResults__info">
                            <span class="font-bold uppercase">{{ getLocalizationProp('Labels.Type') }} :</span>
                            {{ result.Type }}
                        </div>

                        <!-- Method -->
                        <div class="o-gcmsResults__info">
                            <span class="font-bold uppercase">{{ getLocalizationProp('Labels.Method') }} :</span>
                            {{ result.Method }}
                        </div>

                        <!-- Results -->
                        <div class="o-gcmsResults__info">
                            <span class="font-bold uppercase">{{ getLocalizationProp('Labels.Results') }} :</span>
                            {{ result.Results }}
                        </div>
                    </div>
                </div>

                <!-- Results table -->
                <div class="o-gcmsResults__result">
                    <table class="o-gcmsResults__table">
                        <thead class="o-gcmsResults__head">
                            <tr class="o-gcmsResults__row">
                                <th class="o-gcmsResults__col -head -id">
                                    {{ getLocalizationProp('Labels.Identification') }}
                                </th>
                                <th class="o-gcmsResults__col -head -rt">
                                    {{ getLocalizationProp('Labels.Rt') }}
                                </th>
                                <th class="o-gcmsResults__col -head -perc">
                                    %
                                </th>
                            </tr>
                        </thead>
                        <tbody class="o-gcmsResults__body">
                            <tr v-for="(identification, i) in result.Identifications" :key="i" class="o-gcmsResults__row -table">
                                <td class="o-gcmsResults__col -id">{{ identification.Name }}</td>
                                <td class="o-gcmsResults__col -rt">{{ identification.RetentionTime }}</td>
                                <td class="o-gcmsResults__col -perc">{{ identification.RelativeArea }}</td>
                            </tr>
                            <!-- Total -->
                            <tr class="o-gcmsResults__row -table">
                                <td class="o-gcmsResults__col -id">
                                    {{ getLocalizationProp('Labels.TotalIdentified') }}
                                </td>
                                <td class="o-gcmsResults__col -rt"></td>
                                <td class="o-gcmsResults__col -perc">{{ result.TotalIdentified }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Footnote below table -->
                <div v-if="footnote" class="o-gcmsResults__notes" v-html="footnote"></div>

                <!-- Images -->
                <div v-if="result.Images" class="o-gcmsResults__imgs">
                    <div v-for="(img, i) in result.Images" :key="i" class="o-gcmsResults__img">
                        <img :src="img.Url" :alt="img.Alt">
                    </div>
                </div>

                <!-- Footnote below last image -->
                <div v-if="footnoteImage" class="o-gcmsResults__notes -imgs text-xs italic" v-html="footnoteImage"></div>
            </div>
        </div>
    </section>
</template>

<script>
    import gcmsApi from '@api/routes/products/gcms';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OPureGcmsResults',
        mixins: [ localizationMixin ],
        data() {
            return {
                loaded: false,
                result: null
            };
        },
        computed: {
            actionUrl() {
                return `${window.location.origin}${window.location.pathname}`;
            },
            footnote() {
                return this.getLocalizationProp('Data.Footnote') || null;
            },
            footnoteImage() {
                return this.getLocalizationProp('Labels.FootnoteImage') || null;
            },
            hasResults() {
                return this.result?.Identifications?.length > 0;
            },
            noResultsPhrase() {
                return this.getLocalizationProp('Labels.NoResults').replace('{0}', `"${this.searchQuery}"`);
            },
            searchQuery() {
                let search = new URLSearchParams(window.location.search).get('search') || null;

                if(!search) {
                    search = this.getLocalizationProp('Data.PatternLabSearchQuery') || null;
                }

                return search;
            }
        },
        mounted() {
            if(this.searchQuery) {
                this.getResults();
            } else {
                this.loaded = true;
            }
        },
        methods: {
            async getResults() {
                const response = await gcmsApi.query({ id: this.searchQuery });

                if(response.data?.Success && response.data?.Data) {
                    this.result = response.data.Data;
                } else {
                    this.result = null;
                }

                this.loaded = true;
            },
            newSearch() {
                this.loaded = false;
            }
        }
    };
</script>
