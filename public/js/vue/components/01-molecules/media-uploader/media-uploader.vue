<template>
    <div class="m-mediaUploader">
        <slot
            :slot-props="slotProps"
            :media-info="mediaInfo"
            :base64-url="base64Url"
            :uploading="uploading"
            :file="file"
            :reset="reset"
            :handle-trigger="handleTrigger"
        />
        <slot name="trigger" :slot-props="slotProps">
        </slot>
        <slot name="preview" :slot-props="slotProps">
        </slot>
        <slot name="spinner" :slot-props="slotProps">
        </slot>

        <div v-if="showUploadOptions && uploadOptions.length" class="m-mediaUploader__optionPanel">
            <div class="m-mediaUploader__options">
                <label v-for="o in uploadOptions" :key="o.label" :for="o.mediaSource" class="m-mediaUploader__option">
                    <span class="m-mediaUploader__optionLabel">{{ o.label }}</span>
                    <span class="m-mediaUploader__optionIcon">{{ o.icon }}</span>
                </label>
            </div>

            <input id="fileInput" type="file" :accept="fileInputAccept" class="hidden" @change="handleFileSelect($event, false)" />
            <input id="cameraInput" type="file" accept="image/*" capture="camera" class="hidden" @change="handleFileSelect($event, false)" />
            <input id="videoInput" type="file" accept="video/*" capture="camcorder" class="hidden" @change="handleFileSelect($event, true)" />
        </div>
    </div>
</template>

<script>
    import { isEmpty } from 'lodash';
    import uploadUrlApi from '@api/routes/dsibo/mediastorage/uploadurl';
    import downloadUrlApi from '@api/routes/dsibo/mediastorage/downloadurl';
    import eventBus from '@common/source/js/vue/mixins/event-bus';

    export default {
        name: 'MMediaUploader',
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
        data() {
            return {
                showUploadOptions: false,
                uploadOptions: [
                    {
                        label: '照片图库',
                        icon: 'icon1',
                        mediaSource: 'fileInput'
                    },
                    {
                        label: '拍照',
                        icon: 'icon2',
                        mediaSource: 'cameraInput'
                    },
                    {
                        label: '录视频',
                        icon: 'icon3',
                        mediaSource: 'videoInput'
                    }
                ],
                file: null,
                base64Url: '',
                mediaDownloaded: false,

                uploading: false
            };
        },
        computed: {
            slotProps({mediaInfo, file, uploading, reset, handleTrigger}) {
                return {mediaInfo, file, uploading, reset, handleTrigger};
            },
            fileInputAccept() {
                const fileInputAcceptArr = [];
                if(this.image) fileInputAcceptArr.push('image/*');
                if(this.video) fileInputAcceptArr.push('video/*');
                return fileInputAcceptArr.join(',');
            },
            mediaInfo: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            needDownloadMedia() {
                return this.componentShow && this.mediaInfo.ready && !this.mediaDownloaded;
            }
        },
        watch: {
            needDownloadMedia: {
                async handler(newValue, oldValue) {
                    if(newValue) {
                        const path = this.mediaInfo.path;
                        const response = await this.downloadUrl({path});
                        if(response.success && response.data?.Success) {
                            this.mediaInfo = {
                                ...this.mediaInfo,
                                url: response.data?.Data
                            };
                            this.mediaDownloaded = true;
                        }
                    }
                },
                immediate: true
            }
        },
        mounted () {
            this.$nextTick(() => {
                // if not ready, clear error only
                if(!this.mediaInfo.ready && !isEmpty(this.mediaInfo.error)) {
                    this.mediaInfo = {
                        ...this.mediaInfo,
                        error: null
                    };
                }
            });
        },
        methods: {
            handleTrigger() {
                this.showUploadOptions = true;
            },
            resetInfo(payload) {
                this.file = null;
                this.base64Url = '';
                this.mediaInfo = {
                    ...this.mediaInfo, // with key attr, if want to refresh this placeholder, then generate a new `uniqid`
                    ready: false,
                    error: null,
                    path: '',
                    url: '',
                    chooseType: '', // 'image' | 'video'
                    fileSizeMB: 0,

                    remove: false,
                    ...payload
                };
                this.mediaDownloaded = false;
                eventBus.$emit('mediaChanged', this.elName, this.mediaInfo);
            },
            async handleFileSelect(event, isVideoType) {
                const file = event.target.files[0];
                if(!file) return;

                this.uploading = true;
                this.showUploadOptions = false;

                // // 1. reset info
                // this.resetInfo();

                const fileSizeMB = Number((file.size / 1048576).toFixed(4));
                // TODO whether validate media size
                // if(!(fileSizeMB >= this.mediaMin && fileSizeMB <= this.mediaMax)) {
                //     this.resetInfo({
                //         ready: false,
                //         error: 'fileSizeError',
                //         fileSizeMB
                //     });
                //     return;
                // }

                let chooseType = '';
                if(file.type.startsWith('image/')) {
                    chooseType = 'image';
                } else if(file.type.startsWith('video/')) {
                    chooseType = 'video';
                }

                // orc check
                if(this.ocr) {
                    const ocrResult = await this.ocr(file);
                    const {ocrSuccess, base64Url, ...ocrRest} = ocrResult;
                    if(!ocrSuccess) {
                        this.resetInfo({
                            chooseType,
                            fileSizeMB,
                            ...ocrRest // maybe only include `error` info
                        });
                        this.base64Url = base64Url;
                        this.uploading = false;
                        return;
                    }
                }

                // 显示预览
                try {
                    const fileBinary = await this.convertImageToBinary(file);
                    const fileName = file.name || '';
                    const lastDotIndex = fileName.lastIndexOf('.');
                    let fileExt = lastDotIndex === -1 ? '' : fileName.substring(lastDotIndex + 1).toLowerCase();
                    const params = {
                        contentType: chooseType,
                        application: this.application,
                        key: this.elName,
                        suffix: `.${fileExt}`
                    };
                    const res = await this.upload(params, fileBinary);

                    if(res.ready) {
                        this.resetInfo({
                            chooseType,
                            // file,
                            fileSizeMB,
                            ...res // include `ready error path url`
                        });
                        this.base64Url = '';
                        this.file = file;
                    } else {
                        this.resetInfo(res);
                    }
                } catch (error) {
                    // do nothing
                    // this.resetInfo();
                    console.error(error.message);
                }
                this.uploading = false;
            },
            convertImageToBinary(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);

                    reader.readAsArrayBuffer(file);
                });
            },
            reset() {
                this.resetInfo({
                    remove: true
                });
            },

            async upload(params, readerResult) {
                // const result = {};

                // const response1 = await this.uploadUrl(params);
                // if(!(response1.success && response1.data?.Success)) {
                //     result.ready = false;
                //     result.error = response1.success && !response1.data?.Success
                //         ? response1.data?.ErrorMessages.map(i => i.Translation)
                //         : response1.error;
                //     return result;
                // }
                // const path = response1.data?.Data?.path;
                // const uploadUrl = response1.data?.Data?.url;

                // const response2 = await this.uploadMedial(uploadUrl, readerResult);
                // if(!response2.ok) {
                //     result.ready = false;
                //     return result;
                // }

                // const response3 = await this.downloadUrl({path});
                // if(!(response3.success && response3.data?.Success)) {
                //     result.ready = false;
                //     result.error = response3.success && !response3.data?.Success
                //         ? response3.data?.ErrorMessages.map(i => i.Translation)
                //         : response3.error;
                //     return result;
                // }
                // this.mediaDownloaded = true;

                // result.ready = true;
                // result.error = null;
                // result.path = path;
                // result.url = response3.data?.Data;

                // return result;
                // TODO remove below
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({
                            ready: true,
                            error: null,
                            path: 'images/610191989/IBO/BusinessLicense_9c516fec-0460-42da-a8ab-3d2e3dfd63db.jpg',
                            url: 'https://placehold.co/70x70.png'
                        });
                    }, 1000);
                });
            },
            async uploadUrl(params) {
                const response = await uploadUrlApi.query(params);
                return response;
            },
            async uploadMedial(uploadUrl, readerResult) {
                const response = await fetch(uploadUrl, {
                    method: 'PUT',
                    mode: 'cors',
                    redirect: 'follow',
                    body: readerResult
                });
                return response;
            },
            async downloadUrl(params) {
                const response = await downloadUrlApi.query(params);
                return response;
            }
        }
    };
</script>
