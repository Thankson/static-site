<template>
    <div class="m-mediaUpload" :class="{[mods]: true, '-ready': displayMedia}">
        <div v-show="!displayMedia && !uploading" class="m-mediaUpload__add" @click="handleTrigger">
            <span class="m-mediaUpload__iconAdd material-icons" :class="mods">add</span>
        </div>
        <a-loading-spinner
            v-show="uploading"
            :visible="uploading"
            class="m-mediaUpload__loading"
            aria-hidden="true"
        >
        </a-loading-spinner>

        <div v-show="displayMedia || base64Url" class="m-mediaUpload__preview" @click="preview">
            <img v-if="mediaInfo.chooseType === 'image'" class="m-mediaUpload__pic noLazy" :class="mods" :src="base64Url || mediaInfo.url" :alt="file?.name" />
            <video v-if="mediaInfo.chooseType === 'video'" :src="mediaInfo.url" controls></video>
            <a-icon class="m-mediaUpload__iconRemove -textXl" @click.native.stop="reset">close</a-icon>
        </div>

        <modal id="picPreview">
            <template v-slot:content>
                <img class="m-mediaUpload__pic" :src="mediaInfo.url" :alt="file?.name" />
            </template>
        </modal>
    </div>
</template>

<script>

    export default {
        name: 'MMediaUpload',
        props: {
            mediaInfo: {
                type: Object,
                default: () => ({})
            },
            uploading: {
                type: Boolean,
                default: false
            },
            base64Url: {
                type: String,
                default: ''
            },
            file: {
                type: [Object, File],
                default: null
            },
            reset: {
                type: Function,
                default: () => {}
            },
            handleTrigger: {
                type: Function,
                default: () => {}
            },
            mods: {
                type: String,
                default: ''
            }
        },
        computed: {
            displayMedia() {
                return this.mediaInfo.ready || this.base64Url;
            }
        },
        methods: {
            preview() {
                this.$modal.show({id: 'picPreview'});
            }
        }
    };
</script>
