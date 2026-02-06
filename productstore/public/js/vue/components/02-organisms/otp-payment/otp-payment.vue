<template>
    <div class="o-otp">
        <!-- // Code to get DfReferenceId (data.SessionId need to be set to DfReferenceId of Checkout Request) -->
        <iframe name="myframe" class="o-otp__collection-form">test</iframe>
        <form
            ref="collectionForm"
            name="devicedata"
            method="POST"
            :action="otp_requestUrl"
            target="myframe"
        >
            <input id="Bin" name="Bin" type="hidden" :value="otp_BinNumber" />
            <input id="JWT" name="JWT" type="hidden" :value="otp_JWTToken" />
        </form>

        <modal
            id="otp-modal"
            ref="otpModal"
            class="o-otp__modal"
        >
            <template #content>
                <!-- Iframe container for displaying the 3DS authentication challenge -->
                <div v-if="isVisible && payInfo" class="o-otp__iframe-content">
                    <iframe
                        name="threeDSFrame"
                        class="o-otp__iframe"
                    ></iframe>
                    <form
                        id="threeDSChallengeForm"
                        ref="otpForm"
                        method="POST"
                        :action="payInfo.StepUpUrl"
                        target="threeDSFrame"
                    >
                        <input type="hidden" name="JWT" :value="payInfo.ThreeDSChallengeToken" />
                    </form>
                </div>
            </template>
            <template #footer>
                <button
                    class="m-checkboxModal__cta"
                    @click="closeModal()"
                >
                </button>
            </template>
        </modal>
    </div>
</template>
<script>
    export default {
        name: 'OOtpPayment',
        props: {
            isVisible: {
                type: Boolean,
                default: false
            },
            payInfo: {
                type: Object,
                default: () =>
                    ({
                        IsDSVerificationRequired: false,
                        ThreeDSChallengeToken: '',
                        ThreeDSTransactionId: '',
                        StepUpUrl: ''
                    })
            },
            tokenInfo: {
                type: Object,
                default: () =>
                    ({
                        jWTToken: '',
                        binNumber: '',
                        requestUrl: '',
                        listenUrl: ''
                    })
            },
            headingVisible: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                showPopUp: false,
                isMessageListenerAdded: false,
                SessionId: null
            };
        },
        computed: {
            otp_BinNumber() {
                return this.tokenInfo?.binNumber;
            },
            otp_JWTToken() {
                return this.tokenInfo?.jWTToken.replace('"', '');
            },
            otp_requestUrl() {
                return this.tokenInfo?.requestUrl;
            },
            otp_listenUrl() {
                return this.tokenInfo?.listenUrl;
            }
        },
        methods: {
            async submitForm() {
                if(this.payInfo?.IsDSVerificationRequired) {
                    // Show the modal
                    this.showModal();
                }

                // Wait for the next tick to ensure that the modal is fully shown
                await this.$nextTick();

                try {
                    if(this.$refs.otpForm) {
                        await this.$refs.otpForm.submit();
                    } else {
                        console.error('Error: otpForm is not available');
                    }
                } catch (error) {
                    console.error('Error submitting the form:', error);
                }
            },
            async submitToken() {
                if(this.tokenInfo?.jWTToken && this.otp_listenUrl) {
                    // Submit the first form
                    await this.$refs.collectionForm.submit();

                    // Handle messages received from the `otp_listenUrl` domain
                    // Check if the message is from the expected domain
                    const handleSessionId = event => {
                        if(event.origin === this.otp_listenUrl) {
                            const data = JSON.parse(event.data);
                            console.warn('Merchant received a message:', data);

                            if(data?.SessionId) {
                                // Set the `sessionId` property of the current object to the received value
                                this.sessionId = data.SessionId;
                                this.$emit('sessionIdAvailable', this.sessionId);
                            }
                        }
                    };

                    window.addEventListener('message', handleSessionId, false);

                    // Add a hook to remove the message event listener when the component is destroyed
                    this.$once('hook:beforeDestroy', () => window.removeEventListener('message', handleSessionId));
                }
            },
            closeModal() {
                if(this.redirectUrl && this.redirectUrl.length > 0) {
                    // Redirect to the specified URL if available
                    window.location.href = this.redirectUrl;
                } else {
                    // Close the popup if no URL is specified
                    this.$modal.hide();
                }
            },
            async showModal() {
                this.$modal.show({id: 'otp-modal'});
            }
        }
    };
</script>
