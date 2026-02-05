<template>
    <div
        v-if="hasDropdownValues"
        class="m-selectInPageNavMenu"
        :class="[isShow ? '-isOpen' : '', getLocalizationProp('Data.HorizontalAlignmentMod'), getLocalizationProp('Data.VerticalAlignmentMod')]">
        <div
            class="m-selectInPageNavMenu__introText"
            :class="getLocalizationProp('Data.SpacingMod')"
            v-html="getLocalizationProp('Data.IntroText', '')"></div>
        <div
            tabindex="0"
            class="m-selectInPageNavMenu__field"
            :class="[getLocalizationProp('Data.BorderColorMod'), getLocalizationProp('Data.SpacingMod')]"
            :style="{minWidth: `${calcMaxWidth(categories)}px`}"
            @click="toggleMenu"
            @keydown="checkShow">
            <span
                class="font-bold"
                :class="getLocalizationProp('Data.MenuItemActiveMod')">{{ currentValue }}</span>
            <span
                aria-hidden="true"
                class="a-arrow -filled w-0 h-0 absolute top-1_2 right-30 pointer-events-none">
                <i
                    v-show="arrowDirection === 'down'"
                    class="font-material"
                    :class="getLocalizationProp('Data.ArrowMod')"
                    aria-hidden="true"
                >
                    arrow_drop_down
                </i>
                <i
                    v-show="arrowDirection === 'up'"
                    class="font-material"
                    :class="getLocalizationProp('Data.ArrowMod')" aria-hidden="true">
                    arrow_drop_up
                </i>
            </span>
            <transition name="dropdown-fade">
                <ul
                    v-show="isShow"
                    ref="dropdown"
                    class="m-selectInPageNavMenu__option"
                    :class="getLocalizationProp('Data.BorderColorMod')"
                    tabindex="0"
                    role="listbox">
                    <li
                        v-for="category in categories"
                        ref="dropdownItem"
                        :key="category.Text"
                        class="m-selectInPageNavMenu__item"
                        :class="categoryClassMod(category.Text)"
                        :aria-selected="category.Text === currentValue"
                        role="option"
                        @click.stop="selectCategory(category)"
                        @keydown.exact="setCategory(category)">
                        <a
                            class="block py-12 pl-25"
                            :href="category.Url"
                            :target="category.Target"
                            @click="evaluateLink(category.Url)">
                            {{ category.Text }}
                        </a>
                    </li>
                </ul>
            </transition>
        </div>
    </div>
    <div v-else class="m-selectInPageNavMenu__option -empty">
        {{ getLocalizationProp('Label.EmptyListText', 'No options available') }}
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import keyCodes from '@common/source/js/utils/key-codes';
    import IS_PAGE_EDITOR from '@common/source/js/utils/check-ee';

    export default {
        name: 'MSelectInPageNavMenu',
        mixins: [localizationMixin],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                isShow: false,
                arrowDirection: 'down',
                currentValue: '',
                focusedIndex: 0,
                selectedValue: this.currentValue
            };
        },
        computed: {
            categories: function() {
                return this.getLocalizationProp('Data.DropDownValues', []);
            },
            hasDropdownValues: function() {
                return this.categories && this.categories.length > 0;
            },
            isEditorMode() {
                return IS_PAGE_EDITOR();
            }
        },
        mounted() {
            const pathName = window.location.pathname;
            const currentPath = this.categories.find(category => category.Url === pathName);
            this.currentValue = currentPath?.Text || this.categories[0].Text;
        },
        methods: {
            toggleMenu() {
                if(this.isShow) {
                    this.isShow = false;
                    this.arrowDirection = 'down';
                } else {
                    this.isShow = true;
                    this.arrowDirection = 'up';
                }
            },
            showMenu() {
                this.isShow = true;
                this.arrowDirection = 'up';
                this.$refs.dropdown.focus();
            },
            closeMenu() {
                this.isShow = false;
                this.arrowDirection = 'down';
            },
            checkShow(event) {
                const key = event.which || event.keyCode;

                switch (key) {
                    case keyCodes.UP:
                    case keyCodes.DOWN:
                        this.showMenu();
                        this.checkKeyDown(event);
                        break;
                    case keyCodes.ENTER:
                        this.checkKeyDown(event);
                        this.closeMenu();
                        break;
                    case keyCodes.ESC:
                        this.closeMenu();
                        break;
                }
            },
            checkKeyDown(event) {
                const key = event.which || event.keyCode;
                const selectedItemIndex = this.categories.findIndex(category => category.Text === this.selectedValue);
                let nextItem = selectedItemIndex ? this.$refs.dropdownItem[selectedItemIndex] : this.$refs.dropdownItem[0];

                switch (key) {
                    case keyCodes.UP: {
                        if(selectedItemIndex - 1 >= 0) {
                            nextItem = this.$refs.dropdownItem[selectedItemIndex - 1];
                        }
                        if(nextItem) {
                            nextItem.focus();
                            this.selectedValue = nextItem.textContent.trim();
                        }
                        break;
                    }
                    case keyCodes.DOWN: {
                        if(selectedItemIndex + 1 <= this.categories.length) {
                            nextItem = this.$refs.dropdownItem[selectedItemIndex + 1];
                        }
                        if(nextItem) {
                            nextItem.focus();
                            this.selectedValue = nextItem.textContent.trim();
                        }
                        break;
                    }
                    case keyCodes.ENTER:
                        this.currentValue = this.selectedValue;
                        window.location.href = nextItem.firstChild.href;
                        break;
                }
            },
            selectCategory(newCategory) {
                this.currentValue = newCategory.Text;
                this.arrowDirection = 'down';
                this.isShow = false;
            },
            setCategory(category) {
                this.currentValue = category.Text;
            },
            calcMaxWidth(categories) {
                const textLenArr = categories.map(category => category.Text.length);
                const maxTextLen = Math.max(...textLenArr);

                // For arrays max text length greater than 7, the width of the menu is calculated by the formula: (maxTextLen * 8) + 60, otherwise min width is 125px
                const maxWidth = maxTextLen > 7 ? maxTextLen * 8 + 50 : 125;

                return maxWidth;
            },
            evaluateLink(hash) {
                const targetElement = document.getElementById(hash);
                if(targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            },
            categoryClassMod: function(categoryText) {
                const classMod = [];

                if(categoryText === this.currentValue) {
                    classMod.push(this.getLocalizationProp('Data.MenuItemActiveMod'));
                } else {
                    classMod.push(this.getLocalizationProp('Data.MenuItemsMod'));
                }

                if(categoryText === this.selectedValue) {
                    classMod.push(this.getLocalizationProp('Data.MenuItemSelectedMod'));
                }

                classMod.push(this.getLocalizationProp('Data.MenuItemHoverMod'));

                return classMod;
            }
        }
    };
</script>
