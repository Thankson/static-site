<template>
    <div class="m-createAccountSection">
        <h2
            v-if="!hideTitle"
            class="m-createAccountSection__title">
            {{ getLabels(localization, 'Labels.ReferredSection.Title', 'Title is missing') }}
        </h2>

        <!-- Name -->
        <div class="m-createAccountSection__row pb-5">
            <span class="text-gray-120">{{ referrerNameValue }}</span>
        </div>

        <!-- Phone -->
        <div class="m-createAccountSection__row pb-5">
            <span class="text-gray-120">{{ referrerPhoneValue }}</span>
        </div>

        <!-- Email -->
        <div class="m-createAccountSection__row">
            <span class="text-gray-120">{{ referrerEmailValue }}</span>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';

    export default {
        name: 'MCreateAccountReferred',
        mixins: [ labels ],
        props: {
            hideTitle: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default: () => {}
            },
            referrerName: {
                type: String,
                default: null
            },
            referrerPhone: {
                type: String,
                default: null
            },
            referrerEmail: {
                type: String,
                default: null
            }
        },
        computed: {
            ...mapState('guest', ['storedGuest']),

            referrerNameValue() {
                return this.storedGuest?.Referrer?.Name || this.referrerName;
            },
            referrerPhoneValue() {
                return this.storedGuest?.Referrer?.Phone || this.referrerPhone;
            },
            referrerEmailValue() {
                return this.storedGuest?.Referrer?.Email || this.referrerEmail;
            }
        }
    };
</script>
