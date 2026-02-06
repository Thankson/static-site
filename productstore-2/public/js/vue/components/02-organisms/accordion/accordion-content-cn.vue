<template>
    <article class="o-accordion -isCn">
        <h1 class="w-full mx-auto text-2xl font-medium px-10 pt-20 tracking-tight text-gray-150 max-w-contain font-global-sans mb-18 md:px-0 md:pt-0">
            {{ getLocalizationProp('Labels.PageTitle') }}
        </h1>
        <nav class="mb-20 bg-transparent md:hidden">
            <m-category-swipe script-id="AccordionContentAnnoData" :current="currentCategory" :category="sideNav" @swipeCate="setCurrentCate"> </m-category-swipe>
        </nav>

        <div class="w-full bg-white px-10 pt-10 pb-36 mx-auto mt-10 mb-0 border max-w-contain border-gray-50 text-gray-150 md:p-40 md:rounded">
            <h2 class="text-3xl font-light leading-tight mb-18 hidden md:mb-50 md:text-5xl md:block">{{ getLocalizationProp('Labels.PageSubtitle') }}</h2>

            <div class="md:flex md:justify-between">
                <div class="mb-30 hidden md:block md:mb-6">
                    <nav>
                        <h3 class="text-2xl font-extrabold tracking-tight uppercase mt-7 mb-15 md:font-medium md:mb-5">
                            {{ getLocalizationProp('Data.SideNav.SectionTitle') }}
                        </h3>
                        <ul class="text-sm font-medium leading-relaxed text-green-100 mt-15 mr-15 md:text-md">
                            <li
                                v-for="(item, index) in sideNav"
                                :key="index"
                                :class="currentCategory === index ? 'border-l-4 pl-6 text-black border-green-100 font-semibold leading-base py-2 my-27 md:my-6' : ''"
                                class="my-24 md:my-3"
                            >
                                <button class="o-accordion__btn -isCn" @click="setCurrentCate(index)">{{ item.Label }}</button>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div class="md:w-2_3 md:px-40 xl:px-60">
                    <div class="border-b py-10  border-gray-50 flex justify-between md:py-0">
                        <h4 class="w-full pb-10 mx-auto text-2xl text-gray-150 font-medium max-w-contain font-global-sans px-0 md:text-3xl">
                            {{ contentTitle }}
                        </h4>
                        <div class="w-120">
                            <m-select-year
                                id="getLocalizationProp('Data.Years.Id')"
                                :current-year="currYear"
                                :years="dropDownYears"
                                @selectedYear="setCurrentYear"
                            >
                            </m-select-year>
                        </div>
                    </div>
                    <div
                        v-if="hasRows && !apiError"
                        class="o-accordion -thin"
                        :class="wrapperMods">
                        <template v-for="(row, index) in news">
                            <h2
                                :key="row.ContentID"
                                class="o-accordion__title"
                                :class="[row.Mods.Title ? row.Mods.Title : null, currentAccordion === index ? '-open' : '']"
                                :style="row.HeaderBackground ? `background-color:${row.HeaderBackground}` : null"
                            >
                                <button
                                    :id="row.ToggleID"
                                    class="o-accordion__toggler -vue"
                                    :class="row.Mods.Toggler"
                                    :aria-controls="row.ContentID"
                                    aria-expanded="false"
                                    @click="openAccordion(index)"
                                >
                                    <span>
                                        {{ row.Title }}
                                        <span class="text-md text-gray-100 font-normal block sm:hidden">
                                            {{ row.Date }}
                                        </span>
                                    </span>
                                    <span>
                                        <span class="text-md text-gray-100 font-normal hidden sm:inline-block">
                                            {{ row.Date }}
                                        </span>
                                        <arrow
                                            :direction="currentAccordion === index ? '-up' : arrowDirection"
                                            :size="arrowSize"
                                            :tailwind-color="arrowTailwindColor"
                                            :other-mods="arrowOtherMods"
                                        ></arrow>
                                    </span>
                                </button>
                            </h2>

                            <div
                                :id="row.ContentID"
                                :key="index"
                                class="o-accordion__content"
                                :class="[row.Mods.Content , currentAccordion === index ? '-open' : 'hidden' ]"
                                :style="row.HeaderBackground ? `background-color:${row.ContentBackground}` : null"
                                :aria-labelledby="row.ToggleID"
                                role="region">
                                <MAccordionContent :content="row" />
                            </div>
                        </template>
                        <button
                            v-show="isLoadMoreShow"
                            class="a-authorBtn text-center my-30"
                            :class="getLocalizationProp('Data.AuthorBtn.Class')"
                            :aria-label="getLocalizationProp('Data.AuthorBtn.AriaLabel')"
                            @click="setCurrentPage"
                        >
                            {{ getLocalizationProp('Data.AuthorBtn.Text') }}
                        </button>
                    </div>
                    <div
                        v-else
                        class="o-accordion -thin"
                        :class="wrapperMods">
                        <div v-if="apiError" class="py-10">
                            {{ apiErrorMessage }}
                        </div>
                        <div v-else class="py-10">
                            {{ noResultsMessage }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </article>
</template>

<script>
    import MAccordionContent from '../../01-molecules/accordion/accordion-content.vue';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/latestnews';
    export default {
        name: 'AccordionContentCn',
        components: {
            MAccordionContent
        },
        mixins: [ localizationMixin ],
        data() {
            return {
                arrowDirection: '-down',
                arrowTailwindColor: 'gray-120',
                arrowOtherMods: 'mt-6 md:right-0 ml-15',
                wrapperMods: '-alt',
                arrowSize: '-sm',
                currYear: 0,
                currentPage: 1,
                news: null,
                perPage: 0,
                totalPages: 0,
                isLoadMoreShow: true,
                dropDownYears: [],
                sideNav: null,
                pageId: '',
                currentCategory: 0,
                contentTitle: '',
                currentAccordion: -1,
                noResultsMessage: '',
                apiErrorMessage: '',
                apiError: false
            };
        },
        computed: {
            hasRows() {
                return this.news && this.news.length > 0;
            }
        },
        mounted() {
            this.news = this.getLocalizationProp('Data.Accordion.Rows', {}) ? this.getLocalizationProp('Data.Accordion.Rows', {}) : null;
            this.sideNav = this.getLocalizationProp('Data.SideNav.ListItem');
            this.contentTitle = this.sideNav[this.currentCategory].Label;
            this.currYear = this.getLocalizationProp('Data.Years.CurrentYear', 0);
            this.dropDownYears = this.getLocalizationProp('Data.Years.DropDownValues');
            this.currentCategory = this.getLocalizationProp('Data.SideNav.CurrentCategory');
            this.pageId = this.getLocalizationProp('Data.PageId');
            this.noResultsMessage = this.getLocalizationProp('Data.NoResultsMessage');
            this.apiErrorMessage = this.getLocalizationProp('Data.ErrorMessage');
            api.setRoute(`/api/news/search/${this.pageId}`);
            this.setCurrentCate(0);
        },
        methods: {
            async setCurrentYear(year) {
                this.currYear = year;
                this.currentPage = 1;
                this.currentAccordion = -1;
                const response = await api.get(`${this.sideNav[this.currentCategory].Id}/${this.currYear}?pageNumber=1`);
                if(response.success) {
                    this.apiError = false;
                    this.news = response.data.Rows;
                    this.totalPages = response.data.Pages.TotalPages;
                    this.perPage = response.data.Pages.perPage;
                    this.wrapperMods = response.data.WrapperMods;
                    this.arrowSize = response.data.ArrowSize;
                    this.isLoadMoreShow = this.currentPage < this.totalPages;
                } else {
                    this.apiError = true;
                }
            },
            async setCurrentPage() {
                this.currentPage = this.currentPage + 1;
                const response = await api.get(`${this.sideNav[this.currentCategory].Id}/${this.currYear}?pageNumber=${this.currentPage}`);
                if(response.success) {
                    this.apiError = false;
                    this.news = response.data.Rows;
                    this.totalPages = response.data.Pages.TotalPages;
                    this.perPage = response.data.Pages.perPage;
                    this.wrapperMods = response.data.WrapperMods;
                    this.arrowSize = response.data.ArrowSize;
                    this.isLoadMoreShow = this.currentPage < this.totalPages;
                } else {
                    this.apiError = true;
                }
            },
            async setCurrentCate(index) {
                this.currentAccordion = -1;
                this.currentCategory = index;
                this.currentPage = 1;
                this.currYear = this.dropDownYears[0];
                this.contentTitle = this.sideNav[this.currentCategory].Label;
                const response = await api.get(`${this.sideNav[this.currentCategory].Id}/${this.currYear}?pageNumber=1`);
                if(response.success) {
                    this.apiError = false;
                    this.news = response.data.Rows;
                    this.totalPages = response.data.Pages.TotalPages;
                    this.perPage = response.data.Pages.perPage;
                    this.wrapperMods = response.data.WrapperMods;
                    this.arrowSize = response.data.ArrowSize;
                    this.isLoadMoreShow = this.currentPage < this.totalPages;
                } else {
                    this.apiError = true;
                }
            },
            openAccordion(index) {
                if(this.currentAccordion !== index) {
                    this.currentAccordion = -1;
                    this.currentAccordion = index;
                } else {
                    this.currentAccordion = -1;
                }
            }
        }
    };
</script>
