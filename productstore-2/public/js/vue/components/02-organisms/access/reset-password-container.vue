<template>
    <div class="o-resetPasswordContainer">
        <div v-if="showComponent">
            <h1 class="o-resetPasswordContainer__title md:text-4xl to-md:px-10 to-md:pt-20">
                {{ getLocalizationProp('Labels.Title', 'Reset Password') }}
            </h1>

            <div class="o-resetPasswordContainer__resetPassword md:mb-20 md:px-40 md:rounded">
                <m-reset-password :script-id="scriptId" :customer-id="customerId" :email="email" :validation-access-code="accessCode"></m-reset-password>
            </div>
        </div>

        <div v-if="isLoading" class="o-resetPasswordContainer__loading">
            <a-loading-spinner :visible="isLoading" />
        </div>
    </div>
</template>

<script>
    /**
     * This component is container for reset-password.vue component.
     *
     * When it's accessed via reset-password email, we call an API to determine if the clicked url has a valid accessCode before rending reset-password.vue.
     */
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import MResetPassword from '../../01-molecules/my-account/reset-password.vue';
    import verifyAccessCodeApi from '@api/routes/resetpassword/verifyaccesscode';

    export default {
        name: 'OResetPasswordContainer',
        components: {
            MResetPassword
        },
        mixins: [ localizationMixin ],
        props: {
            scriptId: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                showComponent: false,
                isLoading: true,
                accessCode: null,
                customerId: '',
                email: ''
            };
        },
        mounted() {
            // n.b. this needs to be lowercase:
            this.accessCode = new URLSearchParams(window.location.search).get('accesscode');

            // if an accesscode is provided, we validate it and show the reset-password component if it's valid, or redirect to error page if invalid:
            if(this.accessCode) {
                this.verifyAccessCode();
            // if an accesscode is NOT provided, we show the component (because the user can already be logged in; and thus, already have a customerid:
            } else {
                this.showComponent = true;
            }
            this.isLoading = false;

            // TODO: for force-password-reset we might want to check `window.dataLayer?.[0].userLogged`, in which case, we will render the component;
            // right now, we always render the component (unless the verification access is invalid)
        },
        methods: {
            /**
             * Validates the `accessCode` to determine if we show the reset-password component or redirect user to error page.
             */
            async verifyAccessCode() {
                // n.b. this is camel-case, unlike the query param we parsed onmount:
                const response = await verifyAccessCodeApi.get(`?accessCode=${this.accessCode}`);
                const data = response.data;

                // if valid accessCode and customerId !== 0, then link is valid:
                if(response.success && data.customerId) {
                    this.customerId = data.customerId;
                    this.showComponent = true;
                    this.email = data.email;
                // redirect to failure page if: accessCode is missing/invalid, OR api returns error, OR if customerId is 0:
                } else {
                    window.location.href = data.redirectUrl;
                }
            }
        }
    };
</script>
