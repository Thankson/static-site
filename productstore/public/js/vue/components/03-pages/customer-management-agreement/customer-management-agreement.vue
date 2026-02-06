<template>
    <div class="p-customerManagementAgreement bg-gray-25">
        <slot v-if="step === 0" name="banner-form" />
        <slot v-if="step === 1" name="banner-backup-order" />

        <div class="max-w-contain mx-auto py-20 px-10 xl:px-0">
            <!-- Extra script id being passed below to child for data related specifically to the CheckoutPaymentFormCredit component -->
            <CustomerManagementAgreementForm
                v-if="step === 0"
                :address-form-labels="addressFormLabels"
                :address-suggestion-max-count="addressSuggestionMaxCount"
                :benefit-and-authorization-labels="
                    benefitAndAuthorizationLabels
                "
                :cancel-label="getLocalizationProp('Labels.Cancel')"
                :confirm-label="getLocalizationProp('Labels.Confirm')"
                :continue-label="getLocalizationProp('Labels.Continue')"
                :is-loading="isLoading"
                :membership-data="membershipData"
                :method-of-payment-labels="methodOfPaymentLabels"
                :prospective-customer-data="prospectiveCustomerData"
                :provinces-data="provincesData"
                script-id="dataCustomerManagementAgreementPaymentForm"
                :user-info-form-labels="userInfoFormLabels"
                @setFormData="setFormData"
            />
            <CustomerManagementAgreementBackupOrder
                v-if="step === 1"
                :commitment-value="commitmentValue"
                :is-loading="isLoading"
                :labels="backupOrderLabels"
                :img-data="backupOrderImgData"
                :sku-price="skuPrice"
                @createCustomerWithBackupOrder="createCustomerWithBackupOrder"
            />
            <div class="mt-20 italic">
                <p
                    v-if="step === 0"
                    v-html="
                        getLocalizationProp('Labels.IndicatesRequiredFields')
                    "
                ></p>
            </div>
        </div>
        <!-- Owing-Balance Modal -->
        <modal
            id="owing-balance"
            heading-class="font-bold text-2xl leading-initial"
            :prevent-close="true"
        >
            <template v-slot:heading>
                <span v-html="modalOwingBalanceTitle"></span>
            </template>

            <template v-slot:body>
                <p
                    class="text-gray-120"
                    v-html="modalOwingBalanceLabels.Text"
                ></p>
            </template>

            <template v-slot:footer>
                <v-button
                    :is-anchor="true"
                    class="px-24 py-12 text-left text-base"
                    :href="getLocalizationProp('Data.RedirectUrlOwingBalance')"
                    :type="null"
                >
                    {{ modalOwingBalanceLabels.PayNow }}
                </v-button>
            </template>
        </modal>
        <!-- Submit-Failed Modal -->
        <modal id="submit-failed" heading-class="font-bold text-2xl leading-initial">
            <template v-slot:heading>
                <span v-html="modalSubmitFailedLabels.Title"></span>
            </template>

            <template v-slot:body>
                <p
                    class="text-gray-120"
                    v-html="modalSubmitFailedLabels.Text"
                ></p>
            </template>

            <template v-slot:footer>
                <v-button
                    class="-green block mb-15 px-24 py-13 text-left text-base"
                    @click="$modal.hide()"
                >
                    {{ modalSubmitFailedLabels.Ok }}
                </v-button>
            </template>
        </modal>
        <!-- User-Inactive Modal -->
        <modal
            id="user-inactive"
            heading-class="font-bold text-2xl leading-initial"
            :prevent-click-outside-close="true"
        >
            <template v-slot:heading>
                <span v-html="modalUserInactiveLabels.Title"></span>
            </template>

            <template v-slot:body>
                <p class="text-gray-120" v-html="inactivityMessage"></p>
            </template>

            <template v-slot:footer>
                <v-button
                    class="-green block mb-15 px-24 py-13 text-left text-base"
                    @click="$modal.hide()"
                >
                    {{ modalUserInactiveLabels.ContinueAgreement }}
                </v-button>
            </template>
        </modal>

        <!-- Hidden sign in for auto-loggin -->
        <!-- Hide country selector to prevent popup culture from showing and calling for script-id -->
        <o-sign-in-card
            ref="sign-in-card"
            :action="action"
            :hide-country-selector="true"
            :redirect-url="returnUrl"
            :username="username"
            :password="passwordString"
            :stay-signed-in="staySignedIn"
            class="hidden" />
    </div>
</template>

<script>
    import CustomerManagementAgreementBackupOrder from '@productstore/source/js/vue/components/02-organisms/customer-management-agreement/customer-management-agreement-backup-order.vue';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import CustomerManagementAgreementForm from '../../02-organisms/customer-management-agreement/customer-management-agreement-form.vue';
    import submitEnrollerData from '@api/routes/customer/submitEnrollerData';

    const MEMBERSHIP_TYPE_PREFERRED = 'preferred';
    const MEMBERSHIP_TYPE_RIVERBENDRANCH = 'riverbendranchonly';

    export default {
        name: 'PCustomerManagementAgreement',
        components: {
            CustomerManagementAgreementBackupOrder,
            CustomerManagementAgreementForm
        },
        mixins: [localizationMixin],
        data() {
            return {
                step: 0,
                timer: 0,
                enrollerData: {},
                inActivityDuration: null,
                initialTime: null,
                isLoading: false,
                // invisible sign in form bindings
                action: '',
                // Pass redirectUrl to submitEnrollerData api
                redirectUrl: '',
                // Pass return url to sign in form
                returnUrl: '',
                username: '',
                passwordString: '',
                staySignedIn: false
            };
        },
        computed: {
            addressFormLabels() {
                return this.localization?.Labels?.Shipping || {};
            },
            addressSuggestionMaxCount() {
                return this.localization?.Data?.AddressSuggestionMaxCount || undefined;
            },
            benefitAndAuthorizationLabels() {
                return this.localization?.Labels?.BenefitAndAuthorization || {};
            },
            backupOrderImgData() {
                return this.localization?.Data?.BackupOrderImg || {};
            },
            backupOrderLabels() {
                return this.localization?.Labels?.BackupOrder || {};
            },
            commitmentValue() {
                return (
                    this.localization?.Data?.BackupOrderSkuData?.CommitmentValue ||
                    ''
                );
            },
            inactivityMessage() {
                return this.localization?.Labels?.ModalUserInactive?.Text.replace(
                    '{0}',
                    this.formatTimeLeft(this.timer)
                );
            },
            invitationCode() {
                return this.localization?.Data?.InvitationCode;
            },
            isOwingBalance() {
                return this.localization?.Data?.IsOwingBalance;
            },
            membershipData() {
                return this.localization?.Data?.MembershipData || {};
            },
            methodOfPaymentLabels() {
                return this.localization?.Labels?.MethodOfPayment || {};
            },
            modalSubmitFailedLabels() {
                return this.localization?.Labels?.ModalSubmitFailed || {};
            },
            modalOwingBalanceLabels() {
                return this.localization?.Labels?.ModalOwingBalance || {};
            },
            modalOwingBalanceTitle() {
                return this.modalOwingBalanceLabels?.Title.replace(
                    '{0}',
                    `${this.prospectiveCustomerData?.FirstName} ${this.prospectiveCustomerData?.SecondLastName ?? ''} ${this.prospectiveCustomerData?.LastName}`
                );
            },
            modalUserInactiveLabels() {
                return this.localization?.Labels?.ModalUserInactive || {};
            },
            prospectiveCustomerData() {
                return this.localization?.Data?.ProspectiveCustomerData || {};
            },
            provincesData() {
                return this.localization?.Data?.Provinces || [];
            },
            skuPrice() {
                return this.localization?.Data?.BackupOrderSkuData?.SkuPrice || '';
            },
            userInfoFormLabels() {
                return this.localization?.Labels?.UserInfoForm || {};
            }
        },
        mounted() {
            if(this.isOwingBalance) {
                this.$modal.show({ id: 'owing-balance' });
            }
            this.resetInActivityDuration();
            ['mousemove', 'mousedown', 'click', 'scroll', 'keypress'].forEach(
                event => {
                    window.addEventListener(event, this.resetInActivityDuration);
                }
            );
        },
        beforeDestroy() {
            clearTimeout(this.inActivityDuration);
            clearInterval(this.countdown);
            ['mousemove', 'mousedown', 'click', 'scroll', 'keypress'].forEach(
                event => {
                    window.removeEventListener(event, this.resetInActivityDuration);
                }
            );
        },
        methods: {
            createCustomerWithBackupOrder() {
                if(!this.isLoading) this.submitEnrollerData();
            },
            formatTimeLeft(seconds) {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `<span class='font-bold'>${minutes}:${
                    remainingSeconds < 10 ? '0' : ''
                }${remainingSeconds}</span>`;
            },
            resetInActivityDuration() {
                clearTimeout(this.inActivityDuration);
                // After 60 minutes inactivity, start 5 minute counter
                this.inActivityDuration = setTimeout(() => {
                    this.$modal.show({ id: 'user-inactive' });

                    if(this.timer <= 0) this.startFiveMinutesTimer();
                }, 3600000);
            },
            startFiveMinutesTimer() {
                const timeAmount = 300;
                this.timer = timeAmount;
                this.initialTime = Date.now();

                clearInterval(this.countdown);
                this.countdown = setInterval(() => {
                    // Countdown for 5 minutes and reload window at 0
                    if(this.getCurrentTimeCount(this.initialTime) <= timeAmount) {
                        this.timer = timeAmount - this.getCurrentTimeCount(this.initialTime);
                    } else {
                        clearInterval(this.countdown);
                        window.location.reload();
                    }
                }, 1000);
            },
            getCurrentTimeCount(initialTime) {
                const currentTime = Date.now();
                const timeDifferenceInSeconds = Math.floor((currentTime - initialTime) / 1000);
                return timeDifferenceInSeconds;
            },
            setFormData(formData) {
                const customerStatus = formData?.CustomerStatus?.toLowerCase();
                this.redirectUrl = customerStatus === MEMBERSHIP_TYPE_RIVERBENDRANCH
                    ? this.localization?.Data?.RedirectUrlRiverbend
                    : this.localization?.Data?.RedirectUrl;

                this.enrollerData = {
                    ...this.enrollerData,
                    ...formData,
                    ...(customerStatus === MEMBERSHIP_TYPE_PREFERRED && {
                        BackupOrderType:
                            this.localization?.Data?.BackupOrderSkuData
                                ?.BackupOrderType || '',
                        CommitmentValue:
                            this.localization?.Data?.BackupOrderSkuData
                                ?.CommitmentValue || '',
                        CommitmentType: this.localization?.Data?.BackupOrderSkuData
                            ?.CommitmentType || ''
                    }),
                    InvitationCode: this.invitationCode,
                    RedirectUrl: this.redirectUrl
                };

                if(customerStatus === MEMBERSHIP_TYPE_PREFERRED) {
                    this.step = 1;
                } else {
                    if(!this.isLoading) this.submitEnrollerData();
                }
            },
            async submitEnrollerData() {
                if(this.isLoading) return;
                this.isLoading = true;
                // Add redirectUrl to submitEnrollerData
                const response = await submitEnrollerData.post(this.enrollerData);

                if(response?.success && response?.data?.Success) {
                    // Set authentication data based on response
                    this.action = response?.data?.Data?.Action;
                    this.username = response?.data?.Data?.Username;
                    this.passwordString = this.enrollerData.Password;
                    this.returnUrl = response?.data?.Data?.ReturnUrl;
                    this.staySignedIn = response?.data?.Data?.KeepMeSignedin;

                    // Use nextTick to ensure form is updated with data, then submit sign in form
                    this.$nextTick(() => {
                        this.$refs['sign-in-card'].$emit('submit');
                    });
                } else {
                    this.isLoading = false;
                    console.error('Error in saving data:', response?.error);
                    this.$modal.show({ id: 'submit-failed' });
                }
            }
        }
    };
</script>
