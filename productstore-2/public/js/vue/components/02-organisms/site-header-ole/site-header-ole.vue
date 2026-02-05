<template>
    <header class="o-siteHeaderOle bg-green">
        <div class="relative flex items-center justify-between max-w-contain mx-auto py-12 px-8">
            <picture class="w-20 md:w-120">
                <source
                    media="(min-width: 768px)"
                    :srcset="getLocalizationProp('Data.DesktopLogoImg.Url')"
                />
                <img
                    :alt="getLocalizationProp('Data.DesktopLogoImg.Alt')"
                    :src="getLocalizationProp('Data.MobileLogoImg.Url')"
                />
            </picture>
            <button
                ref="open"
                type="button"
                :aria-label="getLocalizationProp('Labels.OpenAriaLabel')"
                @click="handleOpenPopupClick"
            >
                <p class="flex items-center ml-20 text-white text-sm leading-base">
                    <span>{{ getLocalizationProp('Labels.HaveAQuestion') }}</span>
                    <span class="material-icons ml-4 text-sm leading-base">help</span>
                </p>
            </button>
            <div class="absolute top-50 right-0 z-2">
                <div
                    v-show="isPopupOpen"
                    class="o-siteHeaderOle__popupContainer relative mx-8 pt-40 pr-60 pb-40 pl-40 bg-white rounded-md"
                >
                    <button
                        ref="close"
                        type="button"
                        class="absolute top-10 right-10 w-30"
                        :aria-label="getLocalizationProp('Labels.CloseAriaLabel')"
                        @click="handleClosePopupClick"
                    >
                        <img
                            :alt="getLocalizationProp('Data.CloseImg.Alt')"
                            :src="getLocalizationProp('Data.CloseImg.Url')"
                        />
                    </button>
                    <h1 class="mb-6 text-2xl font-bold leading-base">
                        {{ getLocalizationProp('Labels.Heading') }}
                    </h1>
                    <p class="text-sm text-gray-120 leading-tight">
                        {{ popupBodyText }}
                    </p>
                </div>
            </div>
        </div>
    </header>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OSiteHeaderOle',
        mixins: [localizationMixin],
        data() {
            return {
                isPopupOpen: false
            };
        },
        computed: {
            popupBodyText() {
                return this.localization?.Labels?.Body
                    .replace('{0}', this.localization.Labels?.EnrollerName)
                    .replace('{1}', this.localization.Labels?.EnrollerPhoneNumber) || '';
            }
        },
        methods: {
            handleClosePopupClick() {
                this.isPopupOpen = false;
                this.$refs['open'].focus();
            },
            handleOpenPopupClick() {
                this.isPopupOpen = true;
                this.$nextTick(() => {
                    this.$refs['close'].focus();
                });
            }
        }
    };
</script>
