<template>
    <div
        class="o-audioPlayerControl"
        tabindex="1"
        @keydown.space.stop.prevent="playOrPause"
        @keydown.left.stop.prevent="$emit('playBackward')"
        @keydown.right.stop.prevent="$emit('playForward')"
        @keydown.up.stop.prevent="$emit('volumeUp')"
        @keydown.down.stop.prevent="$emit('volumeDown')"
    >
        <div class="o-audioPlayerControl__info">
            <div class="o-audioPlayerControl__title">
                <a-text-carousel
                    ref="textCarouselRef"
                    :key="audioComputed.currentAudio.Name"
                    :text="audioComputed.currentAudio.Name"
                ></a-text-carousel>
            </div>
            <div class="o-audioPlayerControl__infoCollection">
                <div class="o-audioPlayerControl__progressInfo">
                    <button ref="progress" class="o-audioPlayerControl__progressBar" @click.self="clickProgress">
                        <span class="o-audioPlayerControl__progressDot" :style="`left: ${audio.progress}%;`" @mousedown.self="thumbMouseDown" @touchstart.self="touchStart"></span>
                        <div class="o-audioPlayerControl__progressPlayed" :style="`width: ${audio.progress}%;`" @click.self="clickProgress"></div>
                    </button>
                    <div class="o-audioPlayerControl__time">
                        {{ audio.currentTime }}/{{ audio.duration }}
                    </div>
                </div>
            </div>
        </div>
        <div class="o-audioPlayerControl__control">
            <button
                class="o-audioPlayerControl__prev"
                :aria-label="labels.AriaLabels.PlayPrev"
                @click="$emit('playPrev')"
            >
                <span class="material-icons" aria-hidden="true">skip_previous</span>
            </button>
            <button
                class="o-audioPlayerControl__playOrPause"
                :aria-label="playOrPauseAriaLabel"
                @click="playOrPause"
            >
                <span v-show="audio.loadingAudioSnippets" class="material-icons -rotate" aria-hidden="true">sync</span>
                <span v-show="!audio.loadingAudioSnippets && audio.playing" class="material-icons" aria-hidden="true">pause</span>
                <span v-show="!audio.loadingAudioSnippets && !audio.playing" class="material-icons" aria-hidden="true">play_arrow</span>
            </button>
            <button
                class="o-audioPlayerControl__next"
                :aria-label="labels.AriaLabels.PlayNext"
                @click="$emit('playNext')"
            >
                <span class="material-icons" aria-hidden="true">skip_next</span>
            </button>
        </div>
        <div class="o-audioPlayerControl__tools">
            <div v-click-outside="closeRatePanel" class="o-audioPlayerControl__tool -rate">
                <button class="o-audioPlayerControl__toolIcon material-icons" :aria-label="labels.AriaLabels.ToggleRatePanel" @click="toggleRatePanel">speed</button>
                <span class="o-audioPlayerControl__toolText">
                    {{ labels.Speed }}
                </span>
                <div v-show="showRatePanel" ref="ratePanelRef" class="o-audioPlayerControl__panel" :class="{'-bottom': placeRateListBottom}">
                    <perfect-scrollbar>
                        <ul class="o-audioPlayerControl__panelList -rateList">
                            <li
                                v-for="(i, index) in audio.rateList"
                                :key="i"
                                class="o-audioPlayerControl__panelItem"
                                :class="{
                                    '-active': audioComputed.currentRateIndex === index
                                }"
                            >
                                <button @click="$emit('changeRate', i)">x{{ i }}</button>
                            </li>
                        </ul>
                    </perfect-scrollbar>
                </div>
            </div>
            <div v-click-outside="closePlaylistPanel" class="o-audioPlayerControl__tool -playlist">
                <button class="o-audioPlayerControl__toolIcon material-icons" :aria-label="labels.AriaLabels.TogglePlaylistPanel" @click="togglePlaylistPanel">queue_music</button>
                <span class="o-audioPlayerControl__toolText">
                    {{ labels.List }}
                </span>
                <div v-show="showPlaylistPanel" ref="playlistPanelRef" class="o-audioPlayerControl__panel -playlist" :class="{'-bottom': placePlaylistBottom}">
                    <button
                        class="o-audioPlayerControl__panelCloseIcon material-icons"
                        :aria-label="labels.AriaLabels.ClosePlayList"
                        @click="closePlaylistPanel"
                    >close</button>
                    <div class="o-audioPlayerControl__panelTitle">{{ labels.PlayList }}</div>
                    <perfect-scrollbar>
                        <ul class="o-audioPlayerControl__panelList -playList">
                            <li
                                v-for="(a, index) in audioComputed.audioList"
                                :key="`${a.Name}-${index}`"
                                class="o-audioPlayerControl__panelItem"
                                :class="{
                                    '-active': audioComputed.currentPlayingIndex === index
                                }"
                            >
                                <span
                                    v-if="audioComputed.currentPlayingIndex === index"
                                    class="o-audioPlayerControl__panelItemOrder material-icons"
                                    aria-hidden="true"
                                >graphic_eq</span>
                                <span v-else class="o-audioPlayerControl__panelItemOrder">{{ index + 1 }}. </span>
                                <button class="o-audioPlayerControl__panelItemName" @click="$emit('setCurrentAudioInfo', a, audio.playing)">
                                    {{ a.Name }}
                                </button>
                            </li>
                        </ul>
                    </perfect-scrollbar>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AudioPlayerControl',
        props: {
            isMainPlayer: {
                type: Boolean,
                default: false
            },
            audio: {
                type: Object,
                default: () => ({
                    progress: 0
                })
            },
            audioComputed: {
                type: Object,
                default: () => ({})
            },
            labels: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                showRatePanel: false,
                showPlaylistPanel: false,

                initClientX: null,
                initOffsetX: null,

                placeRateListBottom: false,
                placePlaylistBottom: false
            };
        },
        computed: {
            playOrPauseAriaLabel() {
                return this.audio.playing
                    ? this.labels.AriaLabels.Pause
                    : this.labels.AriaLabels.Play;
            }
        },
        methods: {
            closeRatePanel() {
                this.showRatePanel = false;
            },
            openRatePanel() {
                this.showRatePanel = true;
                this.hendleRatePanelDisplay();
            },
            toggleRatePanel() {
                this.showRatePanel = !this.showRatePanel;
                if(this.showRatePanel) {
                    this.hendleRatePanelDisplay();
                }
            },
            hendleRatePanelDisplay() {
                if(!this.isMainPlayer) return;
                // reset `placeRateListBottom` as initial value for caculate
                this.placeRateListBottom = false;
                this.$nextTick(() => {
                    const container = this.$refs.ratePanelRef;
                    const containerDistanceToTop = container.getBoundingClientRect().top;
                    this.placeRateListBottom = containerDistanceToTop < 0;
                });
            },
            closePlaylistPanel() {
                this.showPlaylistPanel = false;
            },
            openPlaylistPanel() {
                this.showPlaylistPanel = true;
                this.hendlePlayListPanelDisplay();
            },
            togglePlaylistPanel() {
                this.showPlaylistPanel = !this.showPlaylistPanel;
                if(this.showPlaylistPanel) {
                    this.hendlePlayListPanelDisplay();
                }
            },
            hendlePlayListPanelDisplay() {
                if(!this.isMainPlayer) return;
                // reset `placeRateListBottom` as initial value for caculate
                this.placePlaylistBottom = false;
                this.$nextTick(() => {
                    const container = this.$refs.playlistPanelRef;
                    const containerDistanceToTop = container.getBoundingClientRect().top;
                    this.placePlaylistBottom = containerDistanceToTop < 0;
                });
            },
            clickProgress(e) {
                const progress = e.offsetX / this.$refs.progress.clientWidth;
                this.$emit('setProgress', progress * 100, false);
                this.$emit('setCurrentTimeTransfer', progress * this.audio.originDuration, false);
                this.$emit('setCurrentTimeOrigin', this.audio.originDuration * progress);
            },

            thumbMouseDown(e) {
                this.initClientX = e.clientX;
                this.initOffsetX = (this.$refs.progress.clientWidth * this.audio.progress) / 100;

                e.stopImmediatePropagation();
                e.preventDefault();
                document.addEventListener('mousemove', this.thumbMouseMove, false);
                document.addEventListener('mouseup', this.thumbMouseUp, false);
            },
            thumbMouseMove(e) {
                let progress = (e.clientX - this.initClientX + this.initOffsetX) / this.$refs.progress.clientWidth;
                progress = progress <= 1 ? (progress >= 0 ? progress : 0) : 1;
                this.$emit('setProgress', progress * 100, true);
                this.$emit('setCurrentTimeTransfer', progress * this.audio.originDuration, true);
            },
            thumbMouseUp() {
                this.$emit('setCurrentTimeOrigin', (this.audio.originDuration * this.audio.progress) / 100);
                this.$emit('unlockChangeProgress');
                this.$emit('unlockChangeCurrentTime');
                document.removeEventListener('mousemove', this.thumbMouseMove, false);
                document.removeEventListener('mouseup', this.thumbMouseUp, false);
            },

            touchStart(e) {
                if(typeof e.targetTouches[0].pageX !== 'number') return;
                this.initClientX = e.targetTouches[0].pageX;
                this.initOffsetX = (this.$refs.progress.clientWidth * this.audio.progress) / 100;

                e.stopImmediatePropagation();
                e.preventDefault();
                document.addEventListener('touchmove', this.touchMove, false);
                document.addEventListener('touchend', this.touchEnd, false);
            },
            touchMove(e) {
                if(typeof e.targetTouches[0].pageX !== 'number') return;
                let progress = (e.targetTouches[0].pageX - this.initClientX + this.initOffsetX) / this.$refs.progress.clientWidth;
                progress = progress <= 1 ? (progress >= 0 ? progress : 0) : 1;
                this.$emit('setProgress', progress * 100, true);
                this.$emit('setCurrentTimeTransfer', progress * this.audio.originDuration, true);
            },
            touchEnd() {
                this.$emit('setCurrentTimeOrigin', (this.audio.originDuration * this.audio.progress) / 100);
                this.$emit('unlockChangeProgress');
                this.$emit('unlockChangeCurrentTime');

                document.removeEventListener('touchmove', this.touchMove, false);
                document.removeEventListener('touchend', this.touchEnd, false);
            },
            playOrPause() {
                this.$emit('playOrPause');
            }
        }
    };
</script>
