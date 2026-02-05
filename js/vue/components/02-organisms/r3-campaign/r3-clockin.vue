<template>
    <div class="o-r3Clockin">
        <div class="o-r3Clockin__form mt-15">
            <p class="o-r3Clockin__tip">
                <span class="o-r3Clockin__tipIcon">
                    error_outline
                </span>
                <span>
                    {{ getLocalizationProp('Labels.Tip') }}{{ getLocalizationProp('Labels.FormTip') }}
                </span>
            </p>

            <div>
                <label class="o-r3Clockin__formLabel" for="name">{{ getLocalizationProp('Labels.Name') }}</label>
                <input
                    id="name"
                    class="o-r3Clockin__formInput mb-5"
                    type="text"
                    :placeholder="getLocalizationProp('Labels.NamePlaceholder')"
                />
            </div>
            <div>
                <label class="o-r3Clockin__formLabel" for="phoneNumber">{{ getLocalizationProp('Labels.PhoneNumber') }}</label>
                <input
                    id="phoneNumber"
                    class="o-r3Clockin__formInput mb-5"
                    type="text"
                    :placeholder="getLocalizationProp('Labels.PhoneNumberPlaceholder')"
                />
            </div>
            <div>
                <label class="o-r3Clockin__formLabel" for="weight">{{ getLocalizationProp('Labels.Weight') }}</label>
                <input
                    id="weight"
                    class="o-r3Clockin__formInput mb-5"
                    type="text"
                    :placeholder="getLocalizationProp('Labels.WeightPlaceholder')"
                />
            </div>

            <label class="mt-15 inline-block" for="uploadPhotos">{{ getLocalizationProp('Labels.UploadPhotos') }}</label>
            <div id="uploadPhotos" class="mt-5 flex">
                <div class="o-r3Clockin__uploadPhotos">
                    <span class="font-material text-5xl text-gray-120">
                        add
                    </span>
                </div>
                <div class="o-r3Clockin__uploadPhotos">
                    <span class="font-material text-5xl text-gray-120">
                        add
                    </span>
                </div>
            </div>

            <p class="o-r3Clockin__tip">
                <span class="o-r3Clockin__tipIcon">
                    error_outline
                </span>
                <span>
                    {{ getLocalizationProp('Labels.Tip') }}{{ getLocalizationProp('Labels.UploadPhotosTip') }}
                </span>
            </p>

            <p class="mt-25">{{ getLocalizationProp('Labels.PersonalInfo') }}</p>
            <div class="-ml-5">
                <div v-for="(item) in terms" :key="item.Name">
                    <m-r3-term
                        :name="item.Name"
                        :checkbox-label="item.Content"
                        :checkbox-label-extend="item.Modals"
                    ></m-r3-term>
                </div>
            </div>

            <div class="mt-10">
                <v-button class="o-r3Clockin__submitButton">
                    {{ getLocalizationProp('Labels.Submit') }}
                </v-button>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import r3TermInfoMixin from '../../../mixins/r3-term-info';

    export default {
        name: 'OR3Clockin',
        mixins: [localizationMixin, r3TermInfoMixin]
    };
</script>
