<template>
    <article class="m-mainCategory">
        <div
            class="m-mainCategory__left"
            :class="{'-noImg': !article.ThumbnailImageSrc}"
        >
            <div class="m-mainCategory__wrapper">
                <p class="m-mainCategory__word">{{ article.HighlightedTheme }}</p>
                <h2 class="m-mainCategory__title">{{ article.Title }}</h2>
                <div class="m-mainCategory__desc" v-html="article.Description"></div>
            </div>
            <div class="m-mainCategory__infos">
                <div class="m-mainCategory__infosLeft">
                    <div class="m-mainCategory__publishDate">
                        <span class="m-mainCategory__iconDate material-icons" aria-hidden="true">schedule</span>
                        <span class="m-mainCategory__textDate">
                            {{ article.ReleaseDate }}
                        </span>
                    </div>
                    <div v-if="isValidEstimatedReadingTime" class="m-mainCategory__estimatedReadingTime">
                        <span class="m-mainCategory__iconReadingTime material-icons" aria-hidden="true">import_contacts</span>
                        <span class="m-mainCategory__textReadingTime">
                            {{ estimatedReadingTime }}
                        </span>
                    </div>
                </div>
                <div class="m-mainCategory__infosRight">
                    <a class="m-mainCategory__learnMore" :href="article.DetailPageUrl">
                        <span class="m-mainCategory__textMore" :aria-label="article.Title">
                            {{ labels.LearnMore }}
                        </span>
                        <span class="m-mainCategory__iconMore material-icons" aria-hidden="true">arrow_forward_ios</span>
                    </a>
                </div>
            </div>
        </div>

        <div v-if="article.ThumbnailImageSrc" class="m-mainCategory__right">
            <img :src="article.ThumbnailImageSrc" :alt="article.Title">
        </div>
    </article>
</template>

<script>
    export default {
        name: 'MMainCategory',
        props: {
            labels: {
                type: Object,
                default: () => ({})
            },
            article: {
                type: Object,
                default: () => ({
                    HighlightedTheme: '',
                    Title: '',
                    Description: '',
                    ReleaseDate: '',
                    EstimatedReadingTime: '',
                    ThumbnailImageSrc: '',
                    DetailPageUrl: ''
                })
            }
        },
        computed: {
            estimatedReadingTime() {
                return this.labels?.EstimatedReadingTime.replace('{0}', this.article.EstimatedReadingTime);
            },
            isValidEstimatedReadingTime() {
                return !isNaN(Number(this.article.EstimatedReadingTime));
            }
        }
    };
</script>
