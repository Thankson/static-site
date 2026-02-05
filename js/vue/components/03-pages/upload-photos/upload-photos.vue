<template>
    <article class="p-uploadPhotos">
        <div v-if="loading" class="p-uploadPhotos__loader">
            <a-loading-spinner :visible="loading" size="sm" />
        </div>
        <div v-else-if="getLocalizationProp('Data')" class="p-uploadPhotos__row">
            <div class="p-uploadPhotos__col -left">
                <o-my-photo-details
                    :car-bonus="!!getLocalizationProp('Data.CarBonusPhoto')"
                    :params-pl="getLocalizationProp('Data.ParamsPl', {})"
                    :labels="getLocalizationProp('Data.MyPhoto', {})"
                    :photo-id="data.PhotoId"
                    :photo-status="data.PhotoStatusType"
                ></o-my-photo-details>
            </div>
            <div class="p-uploadPhotos__col -right">
                <o-my-photo-upload
                    v-if="getLocalizationProp('Data.RecognitionPhoto')"
                    :data="{...getLocalizationProp('Data.RecognitionPhoto', {}), ...data}"
                ></o-my-photo-upload>
                <m-car-bonus
                    v-else
                    :data="getLocalizationProp('Data.CarBonusPhoto', {})"
                ></m-car-bonus>
            </div>
        </div>
        <!-- Slot for Photo Examples Snippets -->
        <footer v-if="$slots['photo-examples']" class="p-uploadPhotos__row -examples">
            <slot name="photo-examples" />
        </footer>
    </article>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/account/recognitions';
    export default {
        name: 'PUploadPhotos',
        mixins: [ localizationMixin ],
        data() {
            return {
                data: {},
                loading: false
            };
        },
        mounted() {
            if(this.getLocalizationProp('Data.RecognitionPhoto')) {
                this.getData(this.getLocalizationProp('Data.ParamsPl', {}));
            }
        },
        methods: {
            getData: async function(params) {
                this.loading = true;
                const response = await api.query(params);
                if(response.success) {
                    this.data = response.data.Data;
                    this.loading = false;
                }
            }
        }
    };
</script>
