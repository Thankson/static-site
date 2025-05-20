<template>
    <div class="o-videoRecording">
        <div class="text-base text-sky text-center mb-15 pt-20">
            <slot name="VideoRecordingTitle"></slot>
        </div>
        <div class="video-wrap h-90 bg-white w-full mb-12">
            <div class="video-container">
                <div>
                    <h3>实时预览</h3>
                    <video ref="liveVideo" autoplay muted playsinline></video>
                </div>
                <div v-show="isRecordingEnd">
                    <h3>录制回放</h3>
                    <video ref="recordedVideo" controls playsinline></video>
                </div>
            </div>
        </div>
        <div class="text-base text-gray-150 text-center mb-5">
            <slot name="PleaseRead"></slot>
        </div>
        <div class="text-base text-gray-120 text-center mb-5">
            <slot name="RandomMessage"></slot>
        </div>
        <m-iconTip script-id="" :text="description"></m-iconTip>
        <template v-if="!isRecording">
            <div class="record_btn_box">
                <span class="record-btn" :disabled="isRecording" @click="startRecording"></span>
            </div>
            <div class="text-base text-gray-150 text-center"><slot name="Record"></slot></div>
        </template>
        <template v-else>
            <div class="record_btn_box">
                <span class="pause-btn" :disabled="!isRecording" @click="stopRecording"></span>
            </div>
            <div class="text-base text-gray-150 text-center"><slot name="Stop"></slot></div>
        </template>
        <!-- demo
        <div class="controls">
            <button :disabled="isRecording" @click="startRecording">开始录制</button>
            <button :disabled="!isRecording" @click="stopRecording">停止录制</button>
            <button :disabled="!recordedChunks.length" @click="playRecordedVideo">播放录制</button>
            <button :disabled="!recordedChunks.length" @click="downloadVideo">下载视频</button>
        </div>
        -->
        <div id="status" class="status" :class="status.className">{{ status.message }}</div>
        <div id="status-flow" class="status-flow">
            <span class="console">
                Console
            </span>
            <div v-for="(log, index) in logs" :key="index" class="status" :class="log.className">{{ log.message }}</div>
        </div>
        <v-button
            class="bg-sky w-full a-button text-base font-medium py-12 px-40 my-10 inline-block -sky"
            type="button"
            @click="handleSubmit">
            <slot name="Submit"></slot>
        </v-button>
        <v-button
            class="bg-sky w-full a-button text-base font-medium py-12 px-40 my-10 inline-block -sky"
            type="button"
            @click="handleRecord">
            <slot name="RecordAgain"></slot>
        </v-button>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OVideoRecording',
        mixins: [ localizationMixin],
        props: {
            gtmId: {
                type: Number,
                default: 0
            },
            description: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                mediaStream: null,
                mediaRecorder: null,
                recordedChunks: [],
                config: {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: 2500000 // 2.5Mbps
                },
                isRecording: false,
                status: {
                    message: '',
                    className: ''
                },
                logs: [],
                isRecordingEnd: false,
                recordedVideoURL: ''
            };
        },
        mounted() {
            // Optional: Initialize camera on component mount
            // this.initCamera();
        },
        beforeDestroy() {
            if(this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }
            if(this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
            }
        },
        methods: {
            async initCamera() {
                try {
                    this.mediaStream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            frameRate: { ideal: 30 }
                        },
                        audio: true
                    });

                    await this.sleep(2000);

                    this.$refs.liveVideo.srcObject = this.mediaStream;
                    this.updateStatus('摄像头已开启，准备就绪', 'success');
                } catch (err) {
                    console.error('获取媒体设备失败:', err);
                    this.updateStatus(`错误: ${err.message}`, 'error');
                }
            },
            async startRecording() {
                await this.initCamera();

                if(!this.mediaStream) {
                    this.updateStatus('错误: 没有可用的媒体流', 'error');
                    return;
                }
                this.recordedChunks = [];
                try {
                    this.mediaRecorder = new MediaRecorder(this.mediaStream, this.config);
                } catch (e) {
                    this.mediaRecorder = new MediaRecorder(this.mediaStream);
                }
                this.mediaRecorder.ondataavailable = (event) => {
                    if(event.data.size > 0) {
                        this.recordedChunks.push(event.data);
                    }
                };
                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(this.recordedChunks, { type: this.getMimeType(this.config) });
                    const recordedVideoURL = URL.createObjectURL(blob);
                    this.$refs.recordedVideo.src = recordedVideoURL;

                    this.playRecordedBtnDisabled = false;
                    this.downloadBtnDisabled = false;
                    this.updateStatus('录制已完成', 'success');
                };
                this.mediaRecorder.start(100);
                this.updateStatus('正在录制...', 'recording');
                this.isRecording = true;
                this.startBtnDisabled = true;
                this.stopBtnDisabled = false;
            },
            stopRecording() {
                if(this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                    this.mediaRecorder.stop();
                    this.isRecording = false;
                    this.startBtnDisabled = false;
                    this.stopBtnDisabled = true;

                    console.log('录制已停止');
                    if(this.mediaStream) {
                        this.mediaStream.getTracks().forEach(track => track.stop());
                        this.$refs.liveVideo.srcObject = null;
                    }
                }
            },
            playRecordedVideo() {
                if(this.$refs.recordedVideo.src) {
                    this.$refs.recordedVideo.play();
                    this.updateStatus('正在播放录制的视频', 'success');
                }
            },
            downloadVideo() {
                if(this.recordedChunks.length === 0) {
                    this.updateStatus('没有可下载的视频', 'error');
                    return;
                }
                const blob = new Blob(this.recordedChunks, { type: this.getMimeType(this.config) });
                const url = URL.createObjectURL(blob);
                const ext = this.getFileExtension(this.getMimeType(this.config));
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `recording-${new Date().toISOString().slice(0, 19)}.${ext}`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                this.updateStatus('视频下载已开始', 'success');
            },
            updateStatus(message, className) {
                this.status.message = message;
                this.status.className = `status ${className}`;

                const clone = { ...this.status };
                this.logs.push(clone);
            },
            getMimeType(secondObject) {
                return this.mediaRecorder?.mimeType || secondObject.mimeType || 'video/webm';
            },
            getFileExtension(mimeType) {
                const mimeToExt = {
                    'video/webm': 'webm',
                    'video/webm;codecs=vp8': 'webm',
                    'video/webm;codecs=vp9': 'webm',
                    'video/mp4': 'mp4',
                    'video/x-matroska': 'mkv'
                };
                for (const [key, ext] of Object.entries(mimeToExt)) {
                    if(mimeType.includes(key.split(';')[0])) {
                        return ext;
                    }
                }
                return 'mp4'; // 默认
            },
            sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            },
            handleSubmit() {
                // ...
            },
            handleRecord() {
                // ...
            }
        }
    };
</script>
