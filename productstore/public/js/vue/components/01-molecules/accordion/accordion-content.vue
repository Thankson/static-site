<template>
    <div class="m-accordionContent">
        <div v-if="content.ContentStatic" v-html="content.ContentStatic"></div>
        <div v-if="hasVideoData">
            <o-video-modal-button
                v-for="video in content.Videos"
                :id="video.Id || getVideo(video).MediaId"
                :key="video.Id"
                :localization="video"
                :video-data="getVideo(video)"
                class="block mt-20">
                <!-- thumbnail video link -->
                <div v-if="video.IsThumbnail" class="relative max-w-contain md:max-w-200">
                    <img :src="getVideo(video).ThumbnailImageUrl" :alt="getVideo(video).Title">
                    <span class="a-playCircle material-icons absolute -white -xl top-1_2" style="transform: translate(-50%, -50%)">play_circle_outline</span>
                    <span v-if="getVideo(video).RuntimeSeconds" class="a-runTime -play absolute " aria-hidden="true">
                        <span class="a-runTime__num">{{ getPlayTime(getVideo(video).RuntimeSeconds) }}</span>
                    </span>
                </div>
                <!-- text video link -->
                <div v-if="video.IsTextLink && video.VideoText" class="text-left text-green font-medium">
                    <span>{{ video.VideoText }}</span>
                    <span aria-hidden="true" class="a-arrow -sm -right -filled ml-3">
                        <span class="a-arrow__icon border-green"></span>
                    </span>
                </div>
            </o-video-modal-button>
        </div>
    </div>
</template>

<script>
    import getPlayTime from '../../../utils/get-play-time';
    export default {
        name: 'MAccordionContent',
        props: {
            content: {
                type: Object,
                required: true
            }
        },
        computed: {
            hasVideoData() {
                return this.content.Videos?.length > 0;
            }
        },
        methods: {
            getPlayTime,
            getVideo(video) {
                return video.Video?.VirtualVideo || {};
            }
        }
    };
</script>
