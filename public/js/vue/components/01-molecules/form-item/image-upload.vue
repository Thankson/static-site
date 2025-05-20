<template>
    <div class="m-imageUpload" :class="mods">
        <div v-show="!postPhoto.isReady && !uploading" class="m-imageUpload__add" @click="selectFile">
            <span class="m-imageUpload__iconAdd material-icons" :class="mods">add</span>
            <input
                ref="inputRef"
                class="m-imageUpload__input"
                type="file"
                name="image_uploads"
                :accept="accept"
                :multiple="multiple"
                @change="handleChange($event, postPhoto)"
            />
        </div>
        <a-loading-spinner
            v-show="uploading"
            :visible="uploading"
            class="m-imageUpload__loading"
            aria-hidden="true"
        >
        </a-loading-spinner>

        <div v-show="postPhoto.isReady" class="m-imageUpload__preview" @click="preview">
            <img class="m-imageUpload__pic noLazy" :src="postPhoto.url" alt="">
            <a-icon class="m-imageUpload__iconRemove -textXl" @click.native.stop="handleRemove(postPhoto)">close</a-icon>
        </div>

        <modal id="picPreview" width="570px">
            <template v-slot:content>
                <img class="m-imageUpload__pic" :src="postPhoto.url" alt="">
            </template>
        </modal>
    </div>
</template>

<script>
    export default {
        name: 'MImageUpload',
        props: {
            accept: {
                type: String,
                default: '.jpg, .jpeg, .png'
            },
            multiple: {
                type: Boolean,
                default: false
            },
            postPhoto: {
                type: Object,
                default: () => ({})
            },
            upload: {
                type: Function,
                default: null
            },
            remove: {
                type: Function,
                default: null
            },
            mods: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                uploading: false
            };
        },
        methods: {
            selectFile() {
                this.$refs.inputRef.value = null;
                this.$refs.inputRef.click();
            },
            async handleChange(e, postPhoto) {
                const files = e.target.files;

                if(!files) return;
                this.uploading = true;
                await this.upload(files, postPhoto);
                this.uploading = false;
            },
            preview() {
                this.$modal.show({id: 'picPreview'});
            },
            handleRemove(postPhoto) {
                this.remove(postPhoto);
            }
        }
    };
</script>
