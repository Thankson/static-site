<template>
    <div v-if="audios.length" class="o-audioPlayer">
        <audio
            ref="audio"
            :src="currentAudio.Src"
            @play="onPlay"
            @pause="onPause"
            @ended="onEnded"
            @loadedmetadata="handleLoadedmetadata"
            @timeupdate="handleTimeupdate"
            @canplay="handleCanplay"
        >
        </audio>
        <div ref="audioPlayerMain" class="o-audioPlayer__main">
            <audio-player-control
                :audio="audio"
                :audio-computed="audioComputed"
                :labels="labels"
                :is-main-player="true"
                @playPrev="playPrev"
                @playNext="playNext"
                @playOrPause="playOrPause"
                @playBackward="playBackward"
                @playForward="playForward"
                @volumeUp="volumeUp"
                @volumeDown="volumeDown"
                @changeRate="changeRate"
                @setCurrentAudioInfo="setCurrentAudioInfo"
                @setProgress="setProgress"
                @setCurrentTimeTransfer="setCurrentTimeTransfer"
                @setCurrentTimeOrigin="setCurrentTimeOrigin"
                @unlockChangeProgress="unlockChangeProgress"
                @unlockChangeCurrentTime="unlockChangeCurrentTime"
            ></audio-player-control>
        </div>
        <div v-show="!isMainInView" class="o-audioPlayer__aix">
            <audio-player-control
                ref="aixControlRef"
                :audio="audio"
                :audio-computed="audioComputed"
                :labels="labels"
                :is-main-player="false"
                @playPrev="playPrev"
                @playNext="playNext"
                @playOrPause="playOrPause"
                @playBackward="playBackward"
                @playForward="playForward"
                @volumeUp="volumeUp"
                @volumeDown="volumeDown"
                @changeRate="changeRate"
                @setCurrentAudioInfo="setCurrentAudioInfo"
                @setProgress="setProgress"
                @setCurrentTimeTransfer="setCurrentTimeTransfer"
                @setCurrentTimeOrigin="setCurrentTimeOrigin"
                @unlockChangeProgress="unlockChangeProgress"
                @unlockChangeCurrentTime="unlockChangeCurrentTime"
            ></audio-player-control>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import AudioPlayerControl from './audio-player-control.vue';
    import { browserDetect } from '@common/source/js/utils/browser-type';

    export default {
        name: 'AudioPlayer',
        components: {
            AudioPlayerControl
        },
        mixins: [ localizationMixin],
        data() {
            return {
                findCurrent: {},
                findCurrentFlag: 0,
                elCurrentTime: 0,

                isMounted: false,
                isMainInView: true,
                isAixFoldUp: false,

                changeProgressLocked: false,
                changeCurrentTimeLocked: false,

                audioList: [],
                currentAudio: {},
                currentRate: 1,
                audio: {
                    loadingAudioSnippets: false,
                    playing: false,
                    currentTime: '00:00',
                    duration: '00:00',
                    originDuration: 0,
                    progress: 0,
                    rateList: [0.75, 1.0, 1.5, 2.0]
                },
                // ios not support well
                useAudioLoadingFeatureFlag: false
            };
        },
        computed: {
            audioEl() {
                return this.$refs.audio;
            },
            audioComputed() {
                return {
                    currentAudio: this.currentAudio,
                    audioList: this.audioList,
                    currentRateIndex: this.currentRateIndex,
                    currentPlayingIndex: this.currentPlayingIndex
                };
            },
            audios() {
                return this.getLocalizationProp('Data.Audios', []);
            },
            currentRateIndex() {
                return this.audio.rateList.findIndex(i => i === this.currentRate);
            },
            currentPlayingIndex() {
                return this.audioList.findIndex(i => i === this.currentAudio);
            },
            isIos() {
                return browserDetect() === 'ios';
            },
            labels() {
                return this.getLocalizationProp('Labels', {});
            },
            supportCanplay() {
                return 'oncanplay' in this.audioEl;
            },
            useAudioLoadingFeature() {
                // need support `canplay` event well
                return this.supportCanplay &&
                    this.useAudioLoadingFeatureFlag;
            }
        },
        mounted () {
            // use nextTick, is wait for the localizition data prepared
            this.$nextTick(() => this.initAudioPlayer());
        },
        methods: {
            transTime(value) {
                let time = '';
                const h = parseInt(`${value / 3600}`);
                value %= 3600;
                const m = parseInt(`${value / 60}`);
                const s = parseInt(`${value % 60}`);
                if(h > 0) {
                    time = this.formatTime(h + ':' + m + ':' + s);
                } else {
                    time = this.formatTime(m + ':' + s);
                }

                return time;
            },
            formatTime(value) {
                let time = '';
                const s = value.split(':');
                let i = 0;
                for (; i < s.length - 1; i++) {
                    time += s[i].length === 1 ? '0' + s[i] : s[i];
                    time += ':';
                }
                time += s[i].length === 1 ? '0' + s[i] : s[i];

                return time;
            },
            lockChangeProgress() {
                this.changeProgressLocked = true;
            },
            unlockChangeProgress() {
                this.changeProgressLocked = false;
            },
            setProgress(progress, isChangeProgressByThumbMouseMove) {
                if(isChangeProgressByThumbMouseMove) {
                    this.lockChangeProgress();
                }
                if(isChangeProgressByThumbMouseMove || !this.changeProgressLocked) {
                    this.audio.progress = progress;
                }
            },
            lockChangeCurrentTime() {
                this.changeCurrentTimeLocked = true;
            },
            unlockChangeCurrentTime() {
                this.changeCurrentTimeLocked = false;
            },
            setCurrentTimeTransfer(currentTime, isChangeCurrentTimeByThumbMouseMove) {
                if(isChangeCurrentTimeByThumbMouseMove) {
                    this.lockChangeCurrentTime();
                }
                if(isChangeCurrentTimeByThumbMouseMove || !this.changeCurrentTimeLocked) {
                    this.audio.currentTime = this.transTime(currentTime);
                }
            },

            setAudioLoading() {
                if(!this.useAudioLoadingFeature) return;
                if(!this.supportCanplay) return;

                this.audio.loadingAudioSnippets = true;
            },
            handleCanplay() {
                this.audio.loadingAudioSnippets = false;
            },
            adjustRealCurrentTime(realCurrentTime) {
                // last adjust corret currentTime
                const value = realCurrentTime / this.audioEl.duration;
                this.setProgress(value * 100, false);
                this.setCurrentTimeTransfer(realCurrentTime, false);
            },
            setCurrentTimeOrigin(currentTime) {
                /**
                 * On non-ios devices, you can jump directly to any time point to play.
                 * But on ios devices, you can only jump to the loaded part to play.
                 *  - Here, we will first determine whether the time point to jump to has been loaded.
                 *  - Only when it is loaded here can we jump to that time point.
                 */
                if(this.isIos) {
                    let findCurrent = null;
                    for (let i = 0; i < this.audioEl.buffered.length; i++) {
                        const eachStart = this.audioEl.buffered.start(i);
                        const eachEnd = this.audioEl.buffered.end(i);
                        if(eachStart <= currentTime && currentTime <= eachEnd) {
                            findCurrent = {eachStart, eachEnd};
                            break;
                        }
                    }
                    if(findCurrent) {
                        this.audioEl.currentTime = currentTime;
                    }
                } else {
                    this.audioEl.currentTime = currentTime;
                }

                this.setAudioLoading();
            },
            initAudioPlayer() {
                this.audioList = this.audios;
                this.setCurrentAudioInfo(this.audioList[0], false);
                this.sniffAudioPlayer();
            },
            onAixControlShow() {
                this.$nextTick(() => {
                    this.$refs.aixControlRef.$refs.textCarouselRef.checkScrollLeft();
                });
            },
            sniffAudioPlayer() {
                const target = this.$refs.audioPlayerMain;
                const options = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0
                };

                const callback = (entries, observer) => {
                    entries.forEach((entry) => {
                        this.isMainInView = entry.isIntersecting;
                        !this.isMainInView && this.onAixControlShow();
                        this.isAixFoldUp = true;
                    });
                };
                const observer = new IntersectionObserver(callback, options);
                observer.observe(target);
            },
            handleLoadedmetadata(e) {
                const duration = this.transTime(e.target.duration);
                this.audio.duration = duration;
                this.audio.originDuration = e.target.duration;
                this.audio.progress = this.audio.progress > 0 ? this.audio.progress : 0;
                this.setAudioLoading();
            },
            handleTimeupdate(e) {
                this.adjustRealCurrentTime(e.target.currentTime);
            },
            setCurrentAudioInfo(info, isPlay = true) {
                this.setAudioLoading();
                this.currentAudio = info;

                this.$nextTick(() => {
                    if(this.isIos) {
                        // ios need this to load the media
                        this.load();
                        this.adjustRealCurrentTime(this.audioEl.currentTime);
                    }
                    // `isPlay`, if before is playing, then after switch the audio, make sure it will also play.
                    if(isPlay) {
                        this.play();
                    }
                });
            },
            playOrPause() {
                if(this.audio.loadingAudioSnippets) return;
                this.audio.playing ? this.pause() : this.play();
            },
            load() {
                this.audioEl.load();
            },
            play() {
                this.changeAudioRate();
                this.audioEl.play();

                // GA
                window.dataLayer && window.dataLayer.push({
                    'event': 'user_event',
                    'eC': 'Audio Data',
                    'eA': 'Play',
                    'eL': this.currentAudio?.Name
                });
            },
            pause() {
                this.audioEl.pause();

                // GA
                window.dataLayer && window.dataLayer.push({
                    'event': 'user_event',
                    'eC': 'Audio Data',
                    'eA': 'Pause',
                    'eL': this.currentAudio?.Name
                });
            },
            changeRate(rate) {
                this.currentRate = rate;
                this.changeAudioRate();
            },
            changeAudioRate() {
                this.audioEl.playbackRate = this.currentRate;
            },
            onPlay() {
                this.audio.playing = true;
            },
            onPause() {
                this.audio.playing = false;
            },
            onEnded() {
                // GA
                window.dataLayer && window.dataLayer.push({
                    'event': 'user_event',
                    'eC': 'Audio Data',
                    'eA': '100%',
                    'eL': this.currentAudio?.Name
                });

                // TAG as is end, it was playing before
                this.playNext(true);
            },
            playNext(playing) {
                const isPlaying = typeof playing === 'boolean' ? playing : this.audio.playing;
                const nextIndex = this.currentPlayingIndex >= this.audioList.length - 1 ? 0 : this.currentPlayingIndex + 1;
                const next = this.audioList[nextIndex];
                this.setCurrentAudioInfo(next, isPlaying);
            },
            playPrev(playing) {
                const isPlaying = typeof playing === 'boolean' ? playing : this.audio.playing;
                const prevIndex = this.currentPlayingIndex <= 0 ? this.audioList.length - 1 : this.currentPlayingIndex - 1;
                const prev = this.audioList[prevIndex];
                this.setCurrentAudioInfo(prev, isPlaying);
            },
            playBackward(seconds = 5) {
                this.setCurrentTimeOrigin(this.audioEl.currentTime - seconds);
            },
            playForward(seconds = 5) {
                this.setCurrentTimeOrigin(this.audioEl.currentTime + seconds);
            },
            volumeUp(step = 0.1) {
                let calcVolumeValue = this.audioEl.volume + step;
                calcVolumeValue = calcVolumeValue >= 1 ? 1 : calcVolumeValue;
                this.audioEl.volume = calcVolumeValue;
            },
            volumeDown(step = 0.1) {
                let calcVolumeValue = this.audioEl.volume - step;
                calcVolumeValue = calcVolumeValue <= 0 ? 0 : calcVolumeValue;
                this.audioEl.volume = calcVolumeValue;
            }
        }
    };
</script>
