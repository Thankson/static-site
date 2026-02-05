<template>
    <div class="m-r3Upload">
        <div v-show="!postPhoto.isReady && !uploading" class="m-r3Upload__add" @click="selectFile">
            <a-icon class="m-r3Upload__iconAdd">add</a-icon>
            <input
                ref="inputRef"
                class="m-r3Upload__input"
                type="file"
                name="image_uploads"
                :accept="accept"
                :multiple="mutiple"
                @change="handleChange($event, postPhoto)"
            />
        </div>
        <a-loading-spinner
            v-show="uploading"
            :visible="uploading"
            class="m-r3Upload__loading"
            aria-hidden="true"
        >
        </a-loading-spinner>

        <div v-show="postPhoto.isReady" class="m-r3Upload__preview" @click="preview">
            <img class="m-r3Upload__pic noLazy" :src="postPhoto.url" alt="">
            <a-icon class="m-r3Upload__iconRemove -textXl" @click.native.stop="handleRemove(postPhoto)">close</a-icon>
        </div>

        <modal id="picPreview" width="570px">
            <template v-slot:content>
                <img class="m-r3Upload__pic" :src="postPhoto.url" alt="">
            </template>
        </modal>
    </div>
</template>

<script>
    export default {
        name: 'MR3Upload',
        props: {
            accept: {
                type: String,
                default: '.jpg, .jpeg, .png'
            },
            mutiple: {
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
