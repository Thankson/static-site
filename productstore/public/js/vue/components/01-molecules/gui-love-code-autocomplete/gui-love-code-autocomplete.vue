<template>
    <div v-click-outside="hide" class="m-guiAutocomplete">
        <input
            :id="inputId"
            ref="input"
            v-model="inputValue"
            autocomplete="off"
            :class="inputClassNames"
            type="text"
            :placeholder="placeholder"
            required="required"
            aria-autocomplete="list"
            :aria-activedescendant="listboxVisible ? optionIds[activeIndex] : null"
            :aria-describedby="inputAriaDescribedBy || null"
            :aria-expanded="listboxVisible"
            :aria-invalid="inputAriaInvalid"
            :aria-owns="listboxId"
            :aria-required="required || null"
            :readonly="readonly"
            role="combobox"
            @focus="onFocus"
            @keydown.down.prevent="onDown($event)"
            @keydown.enter="onEnter($event)"
            @keydown.esc.prevent="hide"
            @keydown.tab="hide"
            @keydown.up.prevent="onUp($event)"
        />

        <button
            class="m-guiAutocomplete__arrow"
            type="button"
            tabindex="-1"
            aria-hidden="true"
            @click="[show(),focusInput()]">

            <arrow
                direction="-down"
                size="-sm"
                tailwind-color="black"
            />
        </button>

        <div
            v-if="listboxVisible"
            :id="listboxId"
            class="m-guiAutocomplete__dropdown"
            role="listbox">

            <perfect-scrollbar>
                <div class="m-guiAutocomplete__scroll">
                    <div :class="loading ? 'm-guiAutocomplete__loading' : ''">
                        <a-loading-spinner
                            class="ml-15"
                            mods="-m-0"
                            :visible="loading"
                            size="sm"
                        />
                    </div>

                    <template v-if="!loading && options.length > 0">
                        <div
                            v-for="(option, index) in options"
                            :id="optionIds[index]"
                            :key="optionIds[index]"
                            class="m-guiAutocomplete__item"
                            :class="activeIndex === index ? '-active' : ''"
                            :aria-selected="inputValue === option.code"
                            :aria-posinset="index + 1"
                            :aria-setsize="options.length"
                            role="option"
                            @click="selectOption(index)">

                            {{ option.code }} {{ option.name }}
                        </div>
                    </template>

                    <div
                        v-if="options.length === 0 && loaded"
                        class="m-guiAutocomplete__noResults">

                        {{ noResultsLabel }}
                    </div>

                </div>
            </perfect-scrollbar>
        </div>
    </div>
</template>

<script>
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';
    import { isDigits, isNonDigits } from '@common/source/js/utils/regex';
    import loveCodeApi from '@api/routes/account/customers/guidonationcodes';

    /**
     * @typedef {Object} LoveCode
     * @property {string} code
     * @property {string} name
     */

    export default {
        name: 'MGuiLoveCodeAutocomplete',
        mixins: [ safeIdMixin ],
        safeIds: [
            'listboxId'
        ],
        props: {
            inputAriaInvalid: {
                type: Boolean,
                default: false
            },
            inputAriaDescribedBy: {
                type: String,
                default: ''
            },
            inputId: {
                type: String,
                default: ''
            },
            inputClassNames: {
                type: [ String, Array ],
                default: ''
            },
            noResultsLabel: {
                type: String,
                default: 'No results found'
            },
            placeholder: {
                type: String,
                default: ''
            },
            readonly: {
                type: Boolean,
                default: false
            },
            required: {
                type: Boolean,
                default: true
            },
            value: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                /** -1 is the default state & indicates nothing is active/highlighted */
                activeIndex: -1,
                inputValue: '',
                listboxId: '',
                listboxVisible: false,
                loaded: false,
                loading: false,
                /**
                 * list of all love codes
                 * @type {Array<LoveCode>}
                 */
                loveCodes: [],
                /** component is not ready until after mount */
                ready: false
            };
        },
        computed: {
            isActive() {
                const charCount = this.inputValue.length;
                return (
                    (this.isDigitSearch && charCount > 2) ||
                    (this.isKeywordSearch && charCount > 1)
                );
            },
            isDigitSearch() {
                return isDigits(this.inputValue);
            },
            isKeywordSearch() {
                return isNonDigits(this.inputValue);
            },
            /**
             * list of filtered love codes base on user entry
             * @returns {Array<LoveCode>}
             */
            options() {
                switch (true) {
                    case this.isDigitSearch:
                        return this.loveCodes.filter(({ code }) => this.inputValue === code?.slice(0, this.inputValue.length));
                    case this.isKeywordSearch:
                        return this.loveCodes.filter(({ name }) => name?.toLowerCase().includes(this.inputValue.toLowerCase()));
                    case this.inputValue.length > 0:
                        return [];
                    default:
                        return [ ...this.loveCodes ];
                }
            },
            optionIds() {
                return this.options.map((...[, index]) => `${this.listboxId}__option__${index}`);
            }
        },
        watch: {
            inputValue() {
                if(this.ready && this.isActive) {
                    this.show();
                }

                this.$emit('input', this.inputValue);
            },
            options(...[, oldOptions]) {
                const oldValue = oldOptions[this.activeIndex]?.value || '';
                const newIndex = this.options.findIndex(({ code }) => oldValue === code);
                this.activeIndex = newIndex;
            },
            value() {
                this.inputValue = this.value;
            },
            listboxVisible() {
                if(this.listboxVisible && !this.loaded) {
                    this.getLoveCodes();
                }
            }
        },
        mounted() {
            this.inputValue = this.value;
            this.$nextTick(() => (this.ready = true));
        },
        methods: {
            focusInput() {
                this.$refs.input?.focus();
            },
            async getLoveCodes() {
                this.loading = true;

                const response = await loveCodeApi.get();
                if(response.success && response.data?.Success) {
                    this.loveCodes = response.data?.Data?.map(({ Code, Name }) => ({
                        code: Code,
                        name: Name
                    })) || [];
                } else {
                    console.error('There was an issue with the request:', loveCodeApi.route, response.data?.ErrorMessages || response.error);
                }

                this.loading = false;
                this.loaded = true;
            },
            hide() {
                this.listboxVisible = false;
            },
            nextOption() {
                if(this.activeIndex < (this.options.length - 1)) {
                    this.activeIndex++;
                }
            },
            onDown(evt) {
                if(this.listboxVisible) {
                    this.nextOption();
                } else if(evt.altKey) {
                    this.show();
                }
            },
            onFocus() {
                if(this.loaded) {
                    const match = this.options.find(({ code }) => this.inputValue === code);
                    // show only if isActive, autocomplete list is loaded, and if an input doesn't have a match
                    if(this.isActive && !match) {
                        this.show();
                    }
                }
            },
            onEnter(evt) {
                if(this.listboxVisible) {
                    evt.preventDefault();
                    this.selectOption(this.activeIndex);
                }
            },
            onUp(evt) {
                if(this.listboxVisible) {
                    if(evt.altKey) {
                        if(this.activeIndex > -1) {
                            this.activeIndex = -1;
                        } else {
                            this.hide();
                        }
                    } else {
                        this.prevOption();
                    }
                }
            },
            prevOption() {
                if(this.activeIndex > 0) {
                    this.activeIndex--;
                }
            },
            show() {
                this.listboxVisible = true;
            },
            selectOption(index) {
                if(this.options[index]) {
                    this.inputValue = `${this.options[index].code} ${this.options[index].name}`;
                    this.$nextTick(this.hide);
                }
            }
        }
    };
</script>
