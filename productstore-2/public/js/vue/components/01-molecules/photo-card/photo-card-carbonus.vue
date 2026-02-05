<template>
    <div class="m-photoCard">
        <h2 class="m-photoCard__title">{{ getLocalizationProp('Data.Title') }}</h2>
        <div class="m-photoCard__row">
            <div class="m-photoCard__col -carCta">
                <a
                    :href="hasCarBonusPhoto ? getLocalizationProp('Data.EditButton.Url') : getLocalizationProp('Data.SubmitButton.Url')"
                    class="a-button"
                    :class="ctaButtonStyles"
                    :target="hasCarBonusPhoto ? getLocalizationProp('Data.EditButton.Target') : getLocalizationProp('Data.SubmitButton.Target')"
                    @click="gtmTrackAction({id: 605, text: 'Car Bonus Submit Photo'}, $event)"
                >
                    {{ hasCarBonusPhoto ? getLocalizationProp('Data.EditButton.Text') : getLocalizationProp('Data.SubmitButton.Text') }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'MPhotoCardBonus',
        mixins: [ localizationMixin ],
        props: {
            ctaButtonStyles: {
                type: String,
                default: 'a-button -white block font-medium py-12 text-base text-center w-full md:inline-block md:px-60 md:w-auto'
            },
            hasCarBonusPhoto: {
                type: Boolean,
                default: false
            }
        }
    };
</script>
