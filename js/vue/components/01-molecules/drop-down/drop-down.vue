<template>
    <div class="m-dropDown o-addressForm__inputContainer">
        <button
            v-if="disableSearch"
            v-click-outside="handleBlur"
            class="m-dropDown__button cursor-pointer relative pb-10 px-15 py-10 bg-white flex items-center justify-between w-full border rounded"
            :class="{ '-open': isVisible, 'border-red': isInvalid }"
            aria-haspopup="listbox"
            :aria-labelledby="ariaLabelledby"
            :aria-expanded="isVisible"
            @click="handleFocus"
            @keyup.esc="handleBlur"
        >
            <span class="m-dropDown__optionTitle whitespace-no-wrap overflow-hidden" v-html="inputValue" />
            <arrow
                :direction="isVisible ? '-up' : '-down'"
                size="-sm"
                other-mods="-filled shadow-none pointer-events-none ml-5"
            >
            </arrow>
        </button>
        <input-basic
            v-else
            :id="id"
            ref="input"
            :value="inputValue"
            :placeholder="ariaLabel"
            :class="{ '-isInvalid': isInvalid }"
            role="combobox"
            aria-autocomplete="list"
            :aria-expanded="isVisible"
            aria-controls="suggestion-list"
            :aria-activedescendant="selectedIndex >= 0 ? `suggestion-option-${selectedIndex}` : undefined"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            @keydown="handleKeydown"
        />
        <div v-show="isVisible" aria-live="polite" class="absolute w-full" style="top: 100%;">
            <perfect-scrollbar
                ref="suggestionList"
                class="o-addressForm__list -suggest -noTop"
            >
                <ul
                    id="suggestion-list"
                    role="listbox"
                    :aria-label="ariaLabel"
                    class="text-black"
                >
                    <li
                        v-for="(item, index) in filteredItems"
                        :id="`suggestion-option-${index}`"
                        :key="item"
                        class="o-addressForm__listItem -suggest"
                        :class="optionModifier"
                        role="option"
                        :aria-selected="selectedIndex === index"
                    >
                        <button
                            ref="suggestion"
                            type="button"
                            class="o-addressForm__btn -suggest py-10"
                            :class="{ 'bg-gray-35': selectedIndex === index }"
                            tabindex="-1"
                            @click.prevent="selectItem(item)"
                            @mousedown.prevent
                            @mouseenter="selectedIndex = index"
                            v-html="item"
                        />
                    </li>
                </ul>
            </perfect-scrollbar>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'DropDown',
        props: {
            ariaLabel: {
                type: String,
                required: true
            },
            ariaLabelledby: {
                type: String,
                default: ''
            },
            disableSearch: {
                type: Boolean,
                default: false
            },
            id: {
                type: String,
                required: true
            },
            // Filter enabled by default
            isFilterEnabled: {
                type: Boolean,
                default: true
            },
            isInvalid: {
                type: Boolean,
                default: false
            },
            items: {
                type: [Array, String],
                required: true
            },
            optionModifier: {
                type: String,
                default: ''
            },
            value: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                inputValue: this.value,
                isVisible: false,
                selectedIndex: -1
            };
        },
        computed: {
            filteredItems() {
                const searchTerm = this.inputValue.toLowerCase();
                const selectOptions = Array.isArray(this.items) ? this.items : this.items.split(',');
                if(!this.isFilterEnabled) {
                    return selectOptions;
                }
                return selectOptions.filter(item =>
                    item.toLowerCase().includes(searchTerm)
                );
            }
        },
        watch: {
            inputValue(newValue) {
                this.$emit('input', newValue);
            },
            value(newValue) {
                this.inputValue = newValue;
            }
        },
        methods: {
            handleBlur() {
                // Delay hiding to allow click events to register
                setTimeout(() => {
                    this.isVisible = false;
                    this.$emit('blur');
                }, 200);
            },
            handleFocus() {
                this.isVisible = true;
                this.$emit('focus');
            },
            handleInput(value) {
                this.inputValue = value;
                this.selectedIndex = -1;
            },
            handleKeydown(event) {
                if(!this.isVisible) return;

                switch (event.key) {
                    case 'ArrowDown':
                        event.preventDefault();
                        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredItems.length - 1);
                        this.scrollToSelected();
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                        this.scrollToSelected();
                        break;
                    case 'Enter':
                        event.preventDefault();
                        if(this.selectedIndex >= 0 && this.selectedIndex < this.filteredItems.length) {
                            this.selectItem(this.filteredItems[this.selectedIndex]);
                        }
                        break;
                    case 'Escape':
                        event.preventDefault();
                        this.$emit('close');
                        break;
                    case 'Tab':
                        this.$emit('close');
                        break;
                }
            },
            reset() {
                this.selectedIndex = -1;
                this.inputValue = '';
            },
            scrollToSelected() {
                if(this.selectedIndex >= 0 && this.$refs.suggestion && this.$refs.suggestion[this.selectedIndex]) {
                    this.$refs.suggestion[this.selectedIndex].scrollIntoView({
                        block: 'nearest'
                    });
                }
            },
            selectItem(item) {
                this.inputValue = item;
                this.$emit('input', item);
                this.$emit('item-selected', item);
            }
        }
    };
</script>
