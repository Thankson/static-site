<template>
    <div class="mPagination flex flex-wrap py-2 text-sm items-center justify-end lg:justify-between">
        <div class="mPagination__wrapper flex flex-col md:flex-row md:justify-between md:items-center md:py-5">
            <div class="mPagination__labels md:mb-0 mb-10">{{ statusLabel }}</div>
            <ul class="mPagination__list flex">
                <li class="mPagination__item flex-grow border bg-white rounded-md mr-5 ml-0 flex h-40 items-center justify-center border-gray">
                    <button
                        :class="['mPagination__button flex items-center justify-center w-full h-full', isPrevButtonDisabled ? 'opacity-25 pointer-events-none' : '']"
                        :disabled="isPrevButtonDisabled"
                        data-test-id="button-paginationPrevPage"
                        @click="goToPreviousPages">
                        <span class="a-arrow -left" aria-hidden="true">
                            <span class="a-arrow__icon  border-gray text-gray"></span>
                        </span>
                    </button>
                </li>
                <li :class="['mPagination__item flex-grow border bg-white rounded-md mr-5 flex h-40 items-center justify-center border-gray', Number(currentPage) === 1 ? '-selected bg-gray-120 text-white' : '']">
                    <button
                        class="mPagination__button flex items-center justify-center w-full h-full"
                        data-test-id="button-paginationFirstPage"
                        @click="updateCurrentPage(1)">
                        <span>1</span>
                    </button>
                </li>
                <li v-if="!isMobile && currentPage > 1 && pagesVisibleInView !== totalPages" class="mPagination__item flex-grow border bg-white rounded-md mr-5 flex h-40 items-center justify-center border-gray">
                    <div class="mPagination__button opacity-25 pointer-events-none flex items-center justify-center w-full h-full">
                        <span> ... </span>
                    </div>
                </li>
                <li v-for="page in activePages" :key="page" :class="['mPagination__item flex-grow border bg-white rounded-md mr-5 flex h-40 items-center justify-center border-gray', Number(currentPage) === page ? '-selected bg-gray-120 text-white': '']">
                    <button
                        class="mPagination__button flex items-center justify-center w-full h-full"
                        :data-test-id="`button-paginationPage-${page}`"
                        @click="updateCurrentPage(page)">{{ page }}
                    </button>
                </li>
                <li v-if="currentPage < totalPages && pagesVisibleInView !== totalPages" class="mPagination__item flex-grow border bg-white rounded-md mr-5 flex h-40 items-center justify-center border-gray">
                    <div class="mPagination__button opacity-25 pointer-events-none flex items-center justify-center w-full h-full">
                        <span> ... </span>
                    </div>
                </li>
                <li
                    :class="['mPagination__item flex-grow border bg-white rounded-md mr-5 flex h-40 items-center justify-center border-gray', Number(currentPage) === totalPages ? '-selected bg-gray-120 text-white' : '']">
                    <button
                        class="mPagination__button flex items-center justify-center w-full h-full"
                        data-test-id="button-paginationLastPage"
                        @click="updateCurrentPage(totalPages)">{{ totalPages }}
                    </button>
                </li>
                <li class="mPagination__item flex-grow border bg-white rounded-md mr-0 flex h-40 items-center justify-center border-gray">
                    <button
                        :class="['mPagination__button flex items-center justify-center w-full h-full', isNextButtonDisabled && 'opacity-25 pointer-events-none']"
                        :disabled="isNextButtonDisabled"
                        data-test-id="button-paginationNextPage"
                        @click="goToNextPages">
                        <span class="a-arrow" aria-hidden="true">
                            <span class="a-arrow__icon border-gray text-gray"></span>
                        </span>
                    </button>
                </li>
            </ul>
        </div>
        <div class="mPagination__control md:mt-0 mt-10 ml-5">
            <span>{{ getLocalizationProp('Labels.GoToPage') }}</span>
            <input
                v-model="inputPage"
                class="mPagination__input border rounded-md text-center h-40 bg-white mx-5 w-50 px-2 py-6 border-gray"
                type="number"
                :min="1"
                :max="totalPages"
                name="pagination-input"
                data-test-id="input-pagination"
                @keyup.enter="goToPage(inputPage)" />
            <button
                class="a-button"
                :data-test-id="`button-paginationGoPage-${currentPage}`"
                @click="goToPage(inputPage)">{{ getLocalizationProp('Labels.Go') }}
            </button>
        </div>
    </div>
</template>

<script>
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MPagination',
        mixins: [ localizationMixin ],
        props: {
            itemsPerPage: {
                type: String,
                required: true
            },
            tabsInView: {
                type: String,
                default: '8'
            },
            totalItems: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                currentPage: this.getPageFromUrl(),
                inputPage: this.getPageFromUrl(),
                startPagesInView: (this.getPageFromUrl())
            };
        },
        computed: {
            activePages() {
                // Show a sliding window of pages between first and last
                if(this.totalPages <= 2) return [];
                const trimmed = this.pages.slice(1, -1);
                const pagesEachSide = Math.floor(this.pagesVisibleInView / 2);
                let idx = trimmed.indexOf(this.currentPage);
                if(idx === -1) idx = Math.max(0, this.currentPage - 2); // fallback
                let start = Math.max(0, idx - pagesEachSide);
                let end = start + this.pagesVisibleInView;
                if(end > trimmed.length) {
                    end = trimmed.length;
                    start = Math.max(0, end - this.pagesVisibleInView);
                }
                return trimmed.slice(start, end);
            },
            endItem() {
                const calculated = this.currentPage * this.itemsPerPage;
                return Math.min(calculated, this.totalItems);
            },
            isMobile() {
                return !!((navigator.userAgent.toLowerCase().match(/mobile/i)) && (window.innerWidth <= 767));
            },
            isSelectedButton() {
                return Number(this.currentPage) === this.page;
            },
            isPageOutOfRange() {
                return this.remainingPages > 0 ? this.currentPage >= this.totalPages : false;
            },
            isPrevButtonDisabled() {
                return this.currentPage <= 1;
            },
            isNextButtonDisabled() {
                return this.currentPage === this.totalPages || this.isPageOutOfRange;
            },
            pages() {
                return Array.from({ length: this.totalPages }, (_, i) => i + 1);
            },
            pagesVisibleInView() {
                return this.isMobile ? 4 : Number(this.tabsInView);
            },
            remainingPages() {
                return this.totalPages - this.pagesVisibleInView;
            },
            startItem() {
                return (this.currentPage - 1) * this.itemsPerPage + 1;
            },
            statusLabel() {
                return replaceTokenArray(this.getLocalizationProp('Labels.ShowingOf'), [this.startItem, this.endItem, this.totalItems]);
            },
            totalPages() {
                return Math.ceil(this.totalItems / this.itemsPerPage);
            }
        },
        watch: {
            currentPage(newPage) {
                this.inputPage = newPage;
            }
        },
        methods: {
            getPageFromUrl() {
                const urlParams = new URLSearchParams(window.location.search);
                return parseInt(urlParams.get('page')) || 1;
            },
            goToNextPages() {
                if(this.currentPage < this.totalPages) {
                    let nextPage = this.currentPage + this.pagesVisibleInView;
                    if(nextPage > this.totalPages) nextPage = this.totalPages;
                    this.updateCurrentPage(nextPage);
                }
            },
            goToPage(_page) {
                const page = parseInt(_page);
                if(page >= 1 && page <= this.totalPages) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('page', page);
                    window.location.href = url.toString();
                } else {
                    this.inputPage = this.currentPage;
                }
            },
            goToPreviousPages() {
                if(this.currentPage > 1) {
                    let prevPage = this.currentPage - this.pagesVisibleInView;
                    if(prevPage < 1) prevPage = 1;
                    this.updateCurrentPage(prevPage);
                }
            },
            replaceTokenArray,
            updateCurrentPage(page) {
                this.currentPage = page;
                this.goToPage(page);
            }
        }
    };
</script>
