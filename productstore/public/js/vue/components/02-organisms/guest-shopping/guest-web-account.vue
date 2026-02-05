<template>
    <div>
        <!-- Title -->
        <h1 class="text-2xl md:text-3xl font-bold">{{ getLocalizationProp('Labels.TitleGuestWeb', 'Title') }}</h1>

        <!-- Guest Web Account Form - Story #53695/#53764 -->
        <form action="" method="post">
            <!-- Profile Section -->
            <o-create-account-profile
                :allow-referral="true"
                :cta-text="getLocalizationProp('Labels.CTA.CreateAccount', 'CreateAccount')"
                :has-username="true"
                :referral-is-optional="false"
                :is-cn="isCn"
                :is-guest="isGuest"
                :is-web-account="true"
                :localization="localization"
                @update-info="updateInfo"
                @validate-section="validateSection"
                @go-to-next="submit($event)" />
        </form>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OGuestWebAccount',
        mixins: [ localizationMixin ],
        props: {
            isCn: {
                type: Boolean,
                default: false
            },
            isGuest: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                // Object to receive input models
                fields: {},

                // Mark sections as not valid
                sections: {
                    profile: false,
                    aboutMLC: false
                }
            };
        },
        computed: {
            formIsValid() {
                const { profile, aboutMLC } = this.sections;

                return profile && aboutMLC;
            }
        },
        methods: {
            updateInfo(payload) {
                // Update model
                this.fields[payload.model] = payload.value;
            },
            submit(event) {
                event.preventDefault();

                if(this.formIsValid) {
                    // Call API
                }
            },
            validateSection(payload) {
                // Mark section as valid / not valid
                this.sections[payload.section] = payload.valid;
            }
        }
    };
</script>
