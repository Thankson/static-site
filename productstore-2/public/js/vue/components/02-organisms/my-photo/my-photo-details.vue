<template>
    <article v-if="carBonus || labels.Image" class="o-myPhotoDetails">
        <p v-if="photoStatus === 'Rejected'" class="o-myPhotoDetails__error" v-html="labels.ErrorMessage"></p>
        <span v-if="!carBonus" class="o-myPhotoDetails__label">{{ labels.ImageLabel }}</span>
        <div v-if="!carBonus" class="o-myPhotoDetails__imageWrapper">
            <img class="o-myPhotoDetails__image" :src="imageSrc" :alt="imageAlt">
            <div v-if="photoStatus !== 'Approved'" class="o-myPhotoDetails__imageLayover" :class="`-${photoStatus}`">
                <p class="o-myPhotoDetails__text -imageLayover">
                    {{ photoStatus === 'Processing' ? labels.ProcessingImage.Alt : photoStatus === 'Rejected' ? labels.RejectedImage.Alt : '' }}
                </p>
            </div>
        </div>
        <div class="o-myPhotoDetails__requirements">
            <h2 class="o-myPhotoDetails__title">{{ labels.RequirementsTitle }}</h2>
            <ul class="o-myPhotoDetails__list">
                <li v-for="(requirement, idx) in labels.Requirements" :key="idx" class="o-myPhotoDetails__text -requirements">
                    <a-icon class="o-myPhotoDetails__icon -requirements">done</a-icon>
                    {{ requirement }}
                </li>
            </ul>
            <a v-if="labels.Link && labels.Link.Url" class="o-myPhotoDetails__link" :href="labels.Link.Url" :target="labels.Link.Target">
                <a-icon class="o-myPhotoDetails__icon -link">description</a-icon>
                {{ labels.Link.Text }}
            </a>
        </div>
    </article>
</template>
<script>
    import api from '@api/routes/account/recognitions/photo';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    export default {
        name: 'OMyPhotoDetails',
        mixins: [ safeId ],
        safeIds: [
            'carouselId'
        ],
        props: {
            carBonus: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => {}
            },
            paramsPl: {
                type: Object,
                default: () => {}
            },
            photoId: {
                type: [String, Number],
                default: null
            },
            photoStatus: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                image: '',
                carouselId: '',
                pluginSettings: { // Default settings (used if settings prop is null)
                    arrows: false,
                    dots: true,
                    infinite: false,
                    speed: 500,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    variableWidth: false,
                    responsive: [
                        {
                            breakpoint: 768,
                            settings: {
                                infinite: false,
                                slidesToShow: 1,
                                slidesToScroll: 1,
                                variableWidth: false
                            }
                        },
                        {
                            breakpoint: 320,
                            settings: {
                                infinite: false,
                                slidesToShow: 1,
                                slidesToScroll: 1,
                                variableWidth: false
                            }
                        }
                    ]
                }
            };
        },
        computed: {
            imageAlt() {
                if(this.photoStatus === 'Processing') {
                    return this.labels?.ProcessingImage?.Alt;
                }
                if(this.photoStatus === 'Rejected') {
                    return this.labels?.RejectedImage?.Alt;
                }
                if(this.photoStatus === 'Approved') {
                    return this.labels?.ApprovedImage?.Alt;
                }
                return this.labels?.Image?.Alt;
            },
            imageSrc() {
                if(this.photoStatus === 'Processing') {
                    return this.labels?.ProcessingImage?.Url;
                }
                if(this.photoStatus === 'Rejected') {
                    return this.labels?.RejectedImage?.Url;
                }
                return this.image;
            }
        },
        mounted() {
            this.image = this.labels?.Image?.Url;
            if(this.photoStatus === 'Approved') {
                this.getData();
            }
        },
        methods: {
            getData: async function() {
                let params = {pictureApprovalQueueId: this.photoId};
                const response = await api.query(params);
                if(response.success && response.data?.Data) {
                    this.image = `data:image/png;base64,${response?.data?.Data}`;
                    return;
                }
                console.warning('bad request to get photo, try again later.');
            }
        }
    };
</script>
