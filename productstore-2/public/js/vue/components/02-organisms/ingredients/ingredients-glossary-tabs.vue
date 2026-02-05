<template>
    <div class="o-ingredGlossTabs">
        <!-- Icon = Legend -->
        <ul class="o-ingredGlossTabs__legend">
            <li v-for="(icon, index) in icons" :key="index" class="o-ingredGlossTabs__definition">
                <img :src="icon.Url" :alt="icon.AltText" class="o-ingredGlossTabs__icon">
                <span>{{ icon.Definition }}</span>
            </li>
        </ul>

        <!-- Tabs -->
        <o-tabs
            ref="ingredglosstab"
            class="-ingredGloss"
            :tabs="getLocalizationProp('Data.Tabs', [])"
            @set-active="setActiveTab">
        </o-tabs>

        <!-- Total Results -->
        <p class="o-ingredGlossTabs__total" v-html="total"></p>

        <!-- Alphabet -->
        <ul v-if="alphabet && alphabet.length" class="o-ingredGlossTabs__alphabet">
            <li v-for="(char, index) in alphabet" :key="index" class="o-ingredGlossTabs__char">
                <button
                    class="o-ingredGlossTabs__button a-button"
                    role="tab"
                    :aria-selected="setAriaSelected(char)"
                    :class="setMod(char)"
                    :disabled="!char.active"
                    @click="[setActiveChar(char, index), gtmTrackAction({id: 460, text: char.label}, $event)]">
                    {{ char.label }}
                </button>
            </li>
        </ul>

        <!-- Ingredients from Active Tab -->
        <ul v-if="ingredients && ingredients.length" class="o-ingredGlossTabs__ingredients">
            <li v-for="(ingredient, index) in ingredients" :key="index" class="o-ingredGlossTabs__item">
                <!-- Title -->
                <h3 class="o-ingredGlossTabs__title" :class="{'-isCn' : isCn}">
                    {{ ingredient.Title }} <span v-if="isCn" class="o-ingredGlossTabs__name">{{ ingredient.Name }}</span>
                </h3>

                <!-- RTE -->
                <div class="o-ingredGlossTabs__description m-rte" v-html="ingredient.RTE"></div>

                <!-- Icon -->
                <ul v-if="ingredient.Icons && ingredient.Icons.length" class="o-ingredGlossTabs__legend -ingredient" :class="{'-isCn' : isCn}">
                    <li
                        v-for="(icon, i) in ingredient.Icons" :key="i"
                        class="o-ingredGlossTabs__definition"
                    >
                        <img :src="icon.Url" :alt="icon.AltText" class="o-ingredGlossTabs__icon">
                        <span class="sr-only">{{ icon.Definition }}</span>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import { intersection } from 'lodash';

    export default {
        name: 'OIngredGlossTabs',
        mixins: [ localizationMixin ],
        data() {
            return {
                activeTab: 0,
                activeChar: null,
                activeCharIndex: null
            };
        },
        computed: {
            alphabet() {
                const alphabet = [];
                const str = String.fromCharCode(...Array(91).keys()).slice(65);
                const ingredients = this.tabs[this.activeTab]?.Ingredients || [];

                if(ingredients && ingredients.length) {
                    for (let i = 0; i <= 25; i++) {
                        alphabet.push({
                            label: str[i],
                            active: ingredients.some(item => item.Title && item.Title[0].toUpperCase() === str[i])
                        });
                    }
                }

                return alphabet;
            },
            icons() {
                // All legend icons
                let iconsLegend = [];
                const icons = this.localization?.Data?.Icons;
                if(icons) {
                    this.localization.Data.Icons.forEach(item => {
                        if(item.Url) iconsLegend.push(item.Url);
                    });
                }

                // All tabs icons
                let iconsTabs = [];
                const tabs = this.localization?.Data?.Tabs;
                if(tabs) {
                    this.localization.Data.Tabs.forEach(tab => {
                        tab.Ingredients.forEach(item => {
                            if(item.Icons && item.Icons.length) {
                                item.Icons.forEach(icon => {
                                    if(icon.Url) iconsTabs.push(icon.Url);
                                });
                            }
                        });
                    });
                }

                // Check if there is a match
                const iconsImgs = intersection(iconsTabs, iconsLegend);
                let iconsFinal = [];
                if(icons) {
                    icons.some(icon => {
                        if(iconsImgs.includes(icon.Url)) iconsFinal.push(icon);
                    });
                }

                // return only the icons that exist on the tabs
                return iconsFinal || [];
            },
            ingredients() {
                let ingredients = [];
                const char = this.activeChar;

                if(this.tabs[this.activeTab]?.Ingredients) {
                    ingredients = this.tabs[this.activeTab]?.Ingredients.filter(i => i.Title && i.Title[0].toUpperCase() === char);
                }

                return ingredients;
            },
            tabs() {
                let tabs = this.localization?.Data?.Tabs || [];

                if(tabs && tabs.length) {
                    tabs.map(tab => {
                        tab.Title += this.isCn ? ` (${tab.Ingredients ? tab.Ingredients.length : 0} 结果) ` : ` (${tab.Ingredients ? tab.Ingredients.length : 0}) `;
                    });
                }

                return tabs;
            },
            total() {
                let total = 0;

                if(this.tabs[this.activeTab]?.Ingredients) {
                    total = this.tabs[this.activeTab].Ingredients.length;
                }

                return this.replaceToken(this.localization?.Labels?.ShowingResults, '<span class="font-bold">' + total + '</span>');
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        mounted() {
            this.initActiveChar();
        },
        methods: {
            replaceToken,
            initActiveChar() {
                // Search for first active char
                let charIndex = null;
                const char = this.alphabet.find((item, index) => {
                    if(item.active) {
                        charIndex = index;
                    }

                    return item.active;
                });

                // Set active char
                if(char) {
                    this.activeChar = char.label;
                    this.activeCharIndex = charIndex;
                }
            },
            setActiveTab(active) {
                this.activeTab = active;

                this.initActiveChar();
            },
            setActiveChar(char, index) {
                if(char.active) {
                    this.activeChar = char.label;
                    this.activeCharIndex = index;
                }
            },
            setAriaSelected(char) {
                return char.active && this.activeChar === char.label;
            },
            setMod(char) {
                if(!char.active) return '-empty';
                else {
                    if(char.active && this.activeChar !== char.label) return '-white';
                    else return '-green';
                }
            }
        }
    };
</script>
