<template>
    <div
        ref="popup-culture"
        class="m-popUpCulture" :class="{'hidden' : isCn}">
        <button
            v-if="selectedCulture"
            class="m-popUpCulture__action"
            :aria-pressed="isVisible ? 'true' : 'false'"
            v-on:click.stop.prevent="togglePopUp('cultures', { id: 111, eL: 'Cultures' })"
        >
            <span class="m-popUpCulture__culture">
                <img class="m-popUpCulture__img" :src="selectedCulture.Img.Url" :alt="selectedCulture.Img.Alt">
                <span class="m-popUpCulture__text -abbrv">{{ selectedCulture.CultureAbbrv }}</span>
            </span>
            <arrow
                direction="-down"
                size="-sm"
                tailwind-color="white"
                other-mods="m-popUpCulture__arrow ml-5 mb-3"
            ></arrow>
        </button>
        <popup
            ref="cultures"
            mods="md:right-30"
            mod-content="pl-24 pr-20 -culture"
            arrow-mods="-filled -shadow absolute -top-13 left-40 md:left-auto md:right-40"
            header-mods="border-0 pb-9"
            :header-title="labels && labels.HeaderText"
            header-title-mods="text-xl font-medium pt-9 px-0"
            :header-visible="true"
            body-mods="px-0"
            :footer-visible="false"
            v-on:visibility="checkVisibility"
        >
            <perfect-scrollbar ref="culture-list">
                <ul class="m-popUpCulture__list">
                    <li
                        v-for="(culture, index) in cultures"
                        :key="`${culture.CultureAbbrv}-${index}`"
                        :class="{'-isSelected': culture.IsSelected}"
                        class="m-popUpCulture__listItem">
                        <a
                            :href="culture.Link.Url"
                            :target="culture.Link.Target"
                            class="m-popUpCulture__link">
                            <img class="m-popUpCulture__img -list" :src="culture.Img.Url" :alt="culture.Img.Alt">
                            <span class="m-popUpCulture__text -culture">{{ culture.Text }}</span>
                        </a>
                    </li>
                </ul>
            </perfect-scrollbar>
        </popup>
    </div>
</template>

<script>
    import togglePopUpMixin from '../../../mixins/toggle-popup';
    import localization from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'PopupCulture',

        mixins: [ togglePopUpMixin, localization ],

        data: function() {
            return {
                isLoaded: true,
                isVisible: false
            };
        },
        computed: {
            cultures() {
                return this.localization?.Data?.Cultures;
            },
            labels() {
                return this.localization?.Labels;
            },
            selectedCulture() {
                const culture = this.cultures && this.cultures.filter((culture) => culture.IsSelected);
                return culture ? culture[0] : null;
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        methods: {
            checkVisibility: function(val) {
                this.visible = val;
                if(val) {
                    this.$nextTick(() => {
                        this.$refs['culture-list'].update();
                    });
                }
            }
        }
    };
</script>
