<template>
    <div class="m-r3PostPhotoes">
        <m-r3-upload
            v-for="postPhoto in postPhotoes"
            :key="postPhoto.key"
            class="mr-10"
            :post-photo="postPhoto"
            :accept="accept"
            :upload="handleUpload"
            :remove="handleRemove"
        ></m-r3-upload>
    </div>
</template>

<script>
    import api from '@api/routes/r3campaigns/getsasurl';

    export default {
        name: 'MR3PostPhotoes',
        props: {
            value: {
                type: Array,
                default: () => ([])
            },
            accept: {
                type: String,
                default: '.jpg, .jpeg, .png'
            },
            // MB
            photoMin: {
                type: Number,
                default: 0.0001
            },
            // MB
            photoMax: {
                type: Number,
                default: 20
            },
            payload: {
                type: Object,
                default: () => ({})
            }
        },
        computed: {
            postPhotoes: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            }
        },
        methods: {
            async getSasUrl(uploadFile) {
                const response = await api.query({
                    filename: uploadFile.name
                });
                const success = response.success && response.data?.Success;
                return {
                    sasSuccess: success,
                    sasResponse: response
                };
            },
            genReaderResult(uploadFile) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsArrayBuffer(uploadFile);
                    reader.onload = () => {
                        resolve(reader.result);
                    };
                });
            },
            async savePic(uploadFile, uploadInfo) {
                const {Headers = {}, SasUrl} = uploadInfo;
                let extraHeader = {};
                try {
                    if(!this.payload.isPhoneNumberError) {
                        const extraHeaderList = [
                            ['Mobile', this.payload.phoneNumber]
                        ];
                        extraHeader = {
                            'x-ms-tags': extraHeaderList.map(i => `${encodeURIComponent(i[0])}=${encodeURIComponent(i[1])}`).join('&')
                        };
                    }
                } catch (error) {
                    console.log(error);
                }
                const readerResult = await this.genReaderResult(uploadFile);
                const res = await fetch(SasUrl, {
                    method: 'PUT',
                    headers: {
                        ...Headers,
                        ...extraHeader
                    },
                    mode: 'cors',
                    redirect: 'follow',
                    body: readerResult
                });
                return res.ok;
            },
            async doUpload(uploadFile) {
                let res = {
                    success: false,
                    url: ''
                };
                const {sasSuccess, sasResponse} = await this.getSasUrl(uploadFile);
                if(sasSuccess) {
                    const {Url: url, ...uploadInfo} = sasResponse?.data?.Data || {};
                    try {
                        const saveOk = await this.savePic(uploadFile, uploadInfo);
                        if(saveOk) {
                            res = {
                                success: true,
                                url
                            };
                        }
                    } catch (error) {
                        console.log('Upload photo failed', error);
                    }
                }
                return res;
            },
            updateValue(newInfo, postPhoto) {
                const newPostPhotoInfo = {
                    ...postPhoto,
                    ...newInfo
                };
                const updateIndex = this.postPhotoes.findIndex(pp => pp.key === postPhoto.key);
                this.postPhotoes.splice(updateIndex, 1, newPostPhotoInfo);
                this.postPhotoes = [...this.postPhotoes];
            },
            updateCurrentUploadFileSize(fileSizeMB, postPhoto) {
                const updateIndex = this.postPhotoes.findIndex(pp => pp.key === postPhoto.key);
                this.postPhotoes = this.postPhotoes.map((pp, index) => {
                    const invalidSize = updateIndex === index ? fileSizeMB : null;
                    return {
                        ...pp,
                        invalidSize
                    };
                });
            },
            async handleUpload(files, postPhoto) {
                if(!(files && files.length)) return;
                const uploadFile = files[0];

                const fileSizeMB = (uploadFile.size / 1048576).toFixed(4);
                if(!(fileSizeMB >= this.photoMin && fileSizeMB <= this.photoMax)) {
                    this.updateValue({
                        isReady: false,
                        url: '',
                        size: null,
                        invalidSize: true,
                        uploadError: false
                    }, postPhoto);
                    return;
                }

                let success = false;
                let url = '';
                try {
                    const uploadRes = await this.doUpload(uploadFile);
                    success = uploadRes.success;
                    url = uploadRes.url;
                } catch (error) {
                    console.log('🔥error💥 ', error);
                }
                if(success) {
                    this.updateValue({
                        isReady: true,
                        url,
                        size: fileSizeMB,
                        invalidSize: false,
                        uploadError: false
                    }, postPhoto);
                } else {
                    this.updateValue({
                        isReady: false,
                        url: '',
                        size: null,
                        invalidSize: false,
                        uploadError: true //
                    }, postPhoto);
                }
            },
            handleRemove(postPhoto) {
                this.updateValue({
                    isReady: false,
                    url: '',
                    size: null,
                    invalidSize: false,
                    uploadError: false
                }, postPhoto);
            }
        }
    };
</script>
