<template>
    <div class="m-faceVerifyResult pt-25">
        <div class="text-center text-sky mb-16">{{ labels.FaceIDTitle }}</div>
        <div class="text-center mb-50">
            <div class="inline-block relative">
                <img :src="data.IconLeftTop" alt="" class="face_img_lt absoulte">
                <img :src="imgSrc" alt="" class="a-genImg__img w-200 inline-block face_img">
                <img :src="data.IconRightBottom" alt="" class="face_img_rb absoulte" @click="handleStepBtn('refresh')">
            </div>
        </div>
        <div v-html="resultData"></div>
        <v-button
            v-if="statu=='fail'"
            :cta="data.CTA && data.CTA.Text"
            class="bg-sky w-full a-button text-sm font-medium py-16 px-40 inline-block -sky my-25"
            type="button"
            @click="handleStepBtn('jump')">
        </v-button>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MFaceVerifyResult',
        mixins: [ localizationMixin],
        props: {
            gtmId: {
                type: Number,
                default: 0
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            verifyResultkey: {
                type: String,
                default: 'sucess'
            },
            imgSrc: {
                type: String,
                default: ''
            },
            resultData: {
                type: String,
                default: ''
            },
            data: {
                type: Object,
                default: () => ({})
            },
            statu: {
                type: String,
                default: ''
            }
        },
        methods: {
            handleStepBtn(type) {
                this.$emit('stepEvent', type);
            }
        }
    };
</script>
