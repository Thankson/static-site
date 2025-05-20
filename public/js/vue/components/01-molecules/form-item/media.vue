<template>
    <m-media-uploader
        v-model="mediaInfo"
        class="m-media"
        :application="application"
        :el-name="elName"
        :image="image"
        :video="video"
        :component-show="componentShow"
        :media-min="mediaMin"
        :media-max="mediaMax"
        :ocr="ocr"
    >
        <template v-slot:default="{ mediaInfo: mediaInfoSlot, uploading, base64Url, file, reset, handleTrigger }">
            <m-media-upload
                :mods="mods"
                :media-info="mediaInfoSlot"
                :uploading="uploading"
                :base64-url="base64Url"
                :file="file"
                :reset="reset"
                :handle-trigger="handleTrigger"
            ></m-media-upload>
        </template>
    </m-media-uploader>
</template>

<script>
    export default {
        name: 'MMedia',
        props: {
            value: {
                type: Object,
                default: () => ({})
            },
            image: {
                type: Boolean,
                default: true
            },
            video: {
                type: Boolean,
                default: true
            },
            application: {
                type: String,
                default: ''
            },
            mods: {
                type: String,
                default: ''
            },
            elName: {
                type: String,
                required: true
            },
            componentShow: {
                type: Boolean,
                default: false
            },
            // MB
            mediaMin: {
                type: Number,
                default: 0.0001
            },
            // MB
            mediaMax: {
                type: Number,
                default: 20
            },
            ocr: {
                type: Function,
                default: null,
                required: false
            }
        },
        computed: {
            mediaInfo: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            }
        }
    };
</script>
