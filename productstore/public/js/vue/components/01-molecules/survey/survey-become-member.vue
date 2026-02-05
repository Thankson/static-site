<template>
    <div class="m-surveyBecomeMember">
        <div class="m-surveyBecomeMember__content">
            <div class="m-surveyBecomeMember__left">
                <!-- Images -->
                <img
                    v-for="(image, index) in images"
                    :key="index"
                    :src="image.Url"
                    :alt="image.Alt"
                    class="m-surveyBecomeMember__image" />
            </div>
            <div class="m-surveyBecomeMember__right">
                <!-- RTE -->
                <div class="m-surveyBecomeMember__text" role="text" v-html="getLocalizationProp('Data.Description')"></div>

                <!-- CTA -->
                <a
                    :href="cta.url"
                    :aria-label="cta.text"
                    class="m-surveyBecomeMember__link">
                    {{ cta.text }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MSurveyBecomeMember',
        mixins: [ localizationMixin ],
        computed: {
            cta() {
                // Authenticated direct customers: Become Member Page
                // Authenticated guests / unauthenticated visitors and guest shopping DISABLE: Become Member Page
                let cta = {
                    url: this.getLocalizationProp('Data.BecomeMemberPage.Url', '#'),
                    text: this.getLocalizationProp('Data.BecomeMemberPage.Text', 'BecomeMember')
                };

                // Authenticated guests / unauthenticated visitors and guest shopping ENABLED: Online Enrollment Page
                if((this.userFlags?.IsAuthenticated && this.userFlags?.IsGuest) || !this.userFlags?.IsAuthenticated) {
                    if(this.userFlags?.IsGuestShoppingEnabled) {
                        cta = {
                            url: this.getLocalizationProp('Data.OnlineEnrollmentPage.Url', '#'),
                            text: this.getLocalizationProp('Data.OnlineEnrollmentPage.Text', 'OnlineEnrollment')
                        };
                    }
                }

                return cta;
            },
            images() {
                let images = [];

                if(this.localization?.Data) {
                    for (let i = 1; i <= 3; i++) {
                        const img = this.localization.Data[`Image${i}`] || null;

                        if(img?.Url) {
                            images.push(img);
                        }
                    }
                }

                return images;
            },
            userFlags() {
                return this.localization?.Data?.UserFlags || {};
            }
        }
    };
</script>
