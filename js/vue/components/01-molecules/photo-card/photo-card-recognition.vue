<template>
    <div v-if="data" class="m-photoCard">
        <h2 class="m-photoCard__title">{{ getLocalizationProp('Labels.Title') }}</h2>
        <div class="m-photoCard__row">
            <div class="m-photoCard__col -img">
                <img class="m-photoCard__img" :src="data.PhotoStatusType === 'Approved' ? `data:image/png;base64,${data.PhotoData}` : imageSrc" :alt="getLocalizationProp('Data.Img.AltText')" />
            </div>
            <div class="m-photoCard__col -cta">
                <p v-if="data.PhotoStatusType === 'Rejected'" class="m-photoCard__error m-rte" role="text" v-html="getLocalizationProp('Labels.Error.Rejected')"></p>
                <a
                    :href="buttonUrl"
                    class="a-button"
                    :class="ctaButtonStyles"
                    :target="buttonTarget"
                    @click="gtmTrackAction({id: 170, text: buttonLabel}, $event)"
                >
                    {{ buttonLabel }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/account/recognitions';
    export default {
        name: 'MPhotoCardRecognition',
        mixins: [ localizationMixin ],
        props: {
            ctaButtonStyles: {
                type: String,
                default: 'a-button -white block font-medium py-12 text-base text-center w-full md:inline-block md:px-60 md:w-auto'
            }
        },
        data() {
            return {
                data: {}
            };
        },
        computed: {
            imageSrc() {
                if(this.data.PhotoStatusType === 'Rejected') {
                    return this.getLocalizationProp('Data.Img.Rejected');
                } return this.getLocalizationProp('Data.Img.Placeholder');
            },
            buttonLabel() {
                if(this.data.PhotoStatusType === 'Approved') {
                    return this.getLocalizationProp('Labels.Button.Edit');
                } return this.getLocalizationProp('Labels.Button.Submit');
            },
            buttonTarget() {
                if(this.data.PhotoStatusType === 'Approved') {
                    return this.getLocalizationProp('Data.EditButton.Target');
                } return this.getLocalizationProp('Data.SubmitButton.Target');
            },
            buttonUrl() {
                if(this.data.PhotoStatusType === 'Approved') {
                    return this.getLocalizationProp('Data.EditButton.Url');
                } return this.getLocalizationProp('Data.SubmitButton.Url');
            }

        },
        mounted() {
            this.getPhotoData(this.getLocalizationProp('Data.ParamsPl', {}));
        },
        methods: {
            getPhotoData: async function(params) {
                const response = await api.query(params);
                if(response.success) {
                    this.data = response.data.Data;
                }
            }
        }
    };
</script>
