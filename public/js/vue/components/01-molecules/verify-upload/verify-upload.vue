<template>
    <div class="m-verifyUpload">
        {{ getLocalizationProp('Data.Text') }}
        <div class="custom-upload">
            <!-- 图片模式 -->
            <div
                v-if="mode === 'image'"
                class="image-uploader"
                @click="triggerFileInput">
                <div class="preview-container">
                    <img
                        v-if="previewUrl"
                        :src="previewUrl"
                        class="preview-image" />
                    <div v-else class="placeholder">
                        <span class="icon">+</span>
                        <span class="text">点击上传</span>
                    </div>
                </div>
                <input
                    ref="fileInput"
                    type="file"
                    :accept="acceptTypes"
                    hidden
                    @change="handleFileChange"
                />
            </div>

            <!-- 通用按钮模式 -->
            <button
                v-else
                class="upload-button"
                @click="triggerFileInput">
                <slot name="button">
                    {{ buttonText || '选择文件' }}
                </slot>
            </button>

            <!-- 验证提示 -->
            <div v-if="errorMessage" class="error-tip">
                {{ errorMessage }}
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MVerifyUpload',
        mixins: [ localizationMixin],
        props: {
            mode: {
                type: String,
                default: 'button', // image | button
                validator: val => ['image', 'button'].includes(val)
            },
            allowedTypes: {
                type: Array,
                default: () => ['image/*', 'video/*']
            },
            maxSize: { // 单位 MB
                type: Number,
                default: 10
            },
            buttonText: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                previewUrl: '',
                errorMessage: ''
            };
        },
        computed: {
            acceptTypes() {
                return this.allowedTypes.join(',');
            }
        },
        methods: {
            triggerFileInput() {
                console.log(this.$refs);
                if(this.$refs.fileInput) {
                    this.$refs.fileInput.click();
                }
            },

            handleFileChange(event) {
                const file = event.target.files[0];
                if(!file) return;

                if(!this.validateFile(file)) return;

                this.generatePreview(file);
                this.$emit('change', file);
            },
            validateFile(file) {
                // 类型验证
                const typeValid = this.allowedTypes.some(type => {
                    if(type.includes('*')) {
                        const category = type.split('/')[0];
                        return file.type.startsWith(category);
                    }
                    return file.type === type;
                });

                if(!typeValid) {
                    this.errorMessage = `仅支持 ${this.allowedTypes.join('、')} 格式`;
                    return false;
                }

                // 大小验证
                const sizeValid = file.size <= this.maxSize * 1024 * 1024;
                if(!sizeValid) {
                    this.errorMessage = `文件大小不能超过 ${this.maxSize}MB`;
                    return false;
                }

                this.errorMessage = '';
                return true;
            },
            generatePreview(file) {
                if(!file) {
                    this.previewUrl = '';
                    return;
                }

                if(file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = e => {
                        console.log(1111);
                        this.previewUrl = e.target.result;
                    };
                    reader.readAsDataURL(file);
                } else if(file.type.startsWith('video/')) {
                    // this.previewUrl = require('');// 默认视频缩略图 @/assets/video-thumbnail.png
                }
            }
        }
    };
</script>
