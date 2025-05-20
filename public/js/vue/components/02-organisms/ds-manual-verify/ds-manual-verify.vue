<template>
    <div class="o-dsManualVerify">
        <div class="o-dsManualVerify">
            <slot name="ManualVerificationTitle"></slot>
            <div class="container bg-white px-16 pb-25 mb-40">
                <!-- 1 -->
                <div class="subtitle text-sm text-gray-150 pt-15 mb-5">
                    <slot name="SubtitleUploadIDCard"></slot>
                </div>
                <m-iconTip script-id="" wrap-class="mb-8" :text="dsManualVerifyDataLabel.LeftImageDescription"></m-iconTip>
                <div class="flex">
                    <div class="flex-1 mr-10 preview_box">
                        <img :src="dsManualVerifyDataLabel.LeftImageSample" alt="" class="a-genImg__img w-full inline-block">
                    </div>
                    <div class="flex-1 upload_box"><m-image-upload></m-image-upload></div>
                </div>
                <m-iconTip
                    script-id=""
                    type="check_circle"
                    :text="dsManualVerifyDataLabel.SuccessUploadPhoto"
                    icon-class="text-base  text-green"
                    text-class="text-tiny text-gray-120"
                    wrap-class="py-8"
                >
                    <template v-slot:extendText>
                        <a><slot name="Modify"></slot></a>
                    </template>
                </m-iconTip>
                <!-- 2 -->
                <div class="subtitle text-sm text-gray-150 mt-15 mb-5">
                    <slot name="SubtitleRecordVideo"></slot>
                </div>
                <div class="flex">
                    <div class="flex-1 mr-10 preview_box">
                        <img :src="dsManualVerifyDataLabel.LeftVideoSample" alt="" class="a-genImg__img w-full inline-block">
                    </div>
                    <div class="flex-1 upload_box">
                        <div class="m-imageUpload">
                            <div class="m-imageUpload__add" @click="handleManualRecord">
                                <span class="m-imageUpload__iconAdd material-icons">add</span>
                            </div>
                        </div>
                    </div>
                </div>
                <m-iconTip
                    script-id=""
                    type="check_circle"
                    :text="dsManualVerifyDataLabel.SuccessUploadVideo"
                    icon-class="text-base text-green"
                    text-class="text-tiny text-gray-120"
                    wrap-class="py-8"
                >
                    <template v-slot:extendText>
                        <a><slot name="Modify"></slot></a>
                    </template>
                </m-iconTip>
                <div class="text-tiny text-gray-100 pt-10">
                    <slot name="LeftVideoFootnote"></slot>
                </div>
            </div>
            <div>
                <v-button class="a-button bg-sky w-full a-button text-base font-medium py-12 px-40 inline-block -sky" @click="handleStart">
                    <slot name="Submit"></slot>
                </v-button>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsManualVerify',
        mixins: [ localizationMixin],
        props: {
            gtmId: {
                type: Number,
                default: 0
            },
            dsManualVerifyDataLabel: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                LeftVideoSample: this.dsManualVerifyDataLabel.LeftVideoSample
            };
        },
        mounted() {
            console.log(this.dsManualVerifyDataLabel);
        },
        methods: {
            handleStart() {
                // ...
            },
            handleManualRecord() {
                alert(33);
                console.log(111);
                this.$emit('showMannualRecord', true);
            }
        }
    };
</script>
