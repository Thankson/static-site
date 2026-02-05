<template>
    <div
        v-click-outside="handleClickOutside"
        class="m-cultureSelector relative bg-white"
    >
        <button
            ref="selectButton"
            type="button"
            class="m-cultureSelector__selectButton relative flex w-full items-center py-10 pl-15 pr-40 border border-gray-50 text-md cursor-pointer"
            :class="[isListOpen ? 'rounded-t-md' : 'rounded-md']"
            :aria-labelledby="ariaLabelledby"
            aria-controls="optionsList"
            data-testid="button-cultureSelectorSelect"
            @click="isListOpen = !isListOpen"
            @keydown="handleSelectButtonKeydown($event)"
        >
            <img
                class="w-24 h-18 mr-10"
                :src="currentCultureObject.Icon && currentCultureObject.Icon.Url"
                :alt="currentCultureObject.Icon && currentCultureObject.Icon.Alt"
            />
            {{ currentCultureObject.Text }}
            <arrow
                direction="-down"
                size="-sm"
                other-mods="absolute -filled right-15 top-16 pointer-events-none"
            />
        </button>
        <perfect-scrollbar
            v-show="isListOpen"
            class="m-cultureSelector__optionsCollapse absolute w-full z-5 py-4 pr-40 pl-15 border-r border-b border-l border-gray-50 rounded-b-md bg-white"
        >
            <ul id="optionsList">
                <li
                    v-for="cultureObject in culturesDataArray"
                    :key="uniqid(cultureObject.Culture)"
                >
                    <button
                        ref="optionButton"
                        type="button"
                        class="m-cultureSelector__optionButton flex items-center w-full text-left text-md py-4 my-4 cursor-pointer"
                        :data-testid="`button-cultureSelectorOption-${cultureObject.Culture}`"
                        @click="handleOptionButtonClick(cultureObject)"
                        @keydown="handleOptionButtonKeydown($event)"
                    >
                        <img
                            class="w-24 h-18 mr-10"
                            :src="cultureObject.Icon && cultureObject.Icon.Url"
                            :alt="cultureObject.Icon && cultureObject.Icon.Alt"
                        />
                        {{ cultureObject.Text }}
                    </button>
                </li>
            </ul>
        </perfect-scrollbar>
    </div>
</template>

<script>
    import uniqid from 'uniqid';

    export default {
        name: 'MCultureSelector',
        props: {
            ariaLabelledby: {
                type: String,
                default: ''
            },
            culturesDataArray: {
                type: Array,
                default: () => []
            },
            initialCulture: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                currentCultureObject: {},
                optionFocusIndex: -1,
                isListOpen: false
            };
        },
        mounted() {
            this.currentCultureObject = this.culturesDataArray.find(object => object.Culture === this.initialCulture);
        },
        methods: {
            handleClickOutside() {
                this.isListOpen = false;
            },
            handleOptionButtonClick(cultureObject) {
                this.currentCultureObject = cultureObject;
                this.$emit('change', this.currentCultureObject.Culture);
                this.isListOpen = false;
                this.$refs['selectButton'].focus();
            },
            handleOptionButtonKeydown(event) {
                if(event.key === 'Tab') {
                    event.preventDefault();
                    return;
                }
                if(event.key === 'Escape') {
                    this.isListOpen = false;
                    this.$refs['selectButton'].focus();
                    return;
                }
                if(event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    const optionButtonsList = this.$refs['optionButton'];
                    if(event.key === 'ArrowDown') {
                        event.preventDefault();
                        this.optionFocusIndex =
                            this.optionFocusIndex + 1 >= optionButtonsList.length
                                ? this.optionFocusIndex
                                : this.optionFocusIndex + 1;
                    }
                    if(event.key === 'ArrowUp') {
                        event.preventDefault();
                        this.optionFocusIndex =
                            this.optionFocusIndex - 1 === -1
                                ? this.optionFocusIndex
                                : this.optionFocusIndex - 1;
                    }
                    optionButtonsList[this.optionFocusIndex].focus();
                }
            },
            handleSelectButtonKeydown(event) {
                if(event.key === 'Escape' || event.key === 'Tab') {
                    this.isListOpen = false;
                    return;
                }
                if(event.key === 'ArrowDown') {
                    event.preventDefault();
                    this.isListOpen = true;
                    this.$refs['optionButton'][0].focus();
                    this.optionFocusIndex = 0;
                }
            },
            uniqid(id) {
                return uniqid(id);
            }
        }
    };
</script>
