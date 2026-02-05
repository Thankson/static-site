<template>
    <div class="o-r3CampaignSignupMember">
        <template v-if="!getLocalizationProp('Data.ShowOnDevices.WebDesktop')"></template>
        <div v-else-if="jointeamSuccess" v-html="getLocalizationProp('Data.SuccessMessage')"></div>
        <div v-else class="w-full lg:w-1_2 lg:mx-auto relative">
            <div v-if="showSpinner" class="o-r3CampaignSignupMember__loading">
                <a-loading-spinner :visible="true" aria-hidden="true">
                </a-loading-spinner>
            </div>

            <div class="o-r3CampaignSignupMember__card">
                <div class="o-r3CampaignSignupMember__title mb-10" v-html="title">
                </div>
                <div class="o-r3CampaignSignupMember__field">
                    <label class="o-r3CampaignSignupMember__label">
                        {{ getLocalizationProp('Labels.TeamId') }}
                    </label>
                    <span class="o-r3CampaignSignupMember__value">{{ teamNumber }}</span>
                </div>
                <div class="o-r3CampaignSignupMember__title mt-10 mb-10">
                    {{ getLocalizationProp('Labels.FillYourInformation', 'Please fill in your information.') }}
                </div>
                <form
                    class="o-r3CampaignSignupMember__form"
                    @submit.enter.prevent
                    @keyup.enter.prevent
                    @keydown.enter.prevent
                >
                    <!-- name -->
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label"
                            :for="name"
                            v-html="
                                getLocalizationProp(
                                    'Labels.Name',
                                    'Name'
                                )
                            "
                        >
                        </label>
                        <input-basic
                            :id="name"
                            ref="nameRef"
                            v-model.trim="$v.form.name.$model"
                            name="name"
                            :tailwind-mods="
                                isFieldError($v.form, 'name') ? '-isInvalid' : null
                            "
                            :placeholder="
                                getLocalizationProp(
                                    'Labels.NamePlaceholder',
                                    'Please fill in your name'
                                )
                            "
                        >
                        </input-basic>
                        <m-r3-error-messages :err-msgs="getFieldErrorMsgs($v.form, 'name')"></m-r3-error-messages>
                    </div>

                    <!-- phoneNumber -->
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label"
                            :for="phoneNumber"
                            v-html="
                                getLocalizationProp(
                                    'Labels.PhoneNumber',
                                    'Phone Number'
                                )
                            "
                        >
                        </label>
                        <input-basic
                            :id="phoneNumber"
                            ref="phoneNumberRef"
                            v-model.trim="$v.form.phoneNumber.$model"
                            name="phoneNumber"
                            :tailwind-mods="
                                isFieldError($v.form, 'phoneNumber') ? '-isInvalid' : null
                            "
                            :placeholder="
                                getLocalizationProp(
                                    'Labels.PhoneNumberPlaceholder',
                                    'Please fill in your frequently used phone number'
                                )
                            "
                        >
                        </input-basic>
                        <p class=" flex text-sm leading-tight text-gray mt-5">
                            <span
                                class="font-material text-xs mr-3 mt-2 leading-base"
                                aria-hidden="true"
                            >
                                error_outline
                            </span>
                            <span role="text">
                                {{ getLocalizationProp('Labels.NeedChangePhoneNumber') }}
                            </span>
                        </p>
                        <m-r3-error-messages :err-msgs="getFieldErrorMsgs($v.form, 'phoneNumber')"></m-r3-error-messages>
                    </div>

                    <div v-for="(item, index) in terms" :key="item.Name">
                        <m-r3-term
                            v-model="$v.terms.$each[index].$model.term"
                            :name="item.Name"
                            :checkbox-label="item.Content"
                            :checkbox-label-extend="item.Modals"
                            :field-error="$v.terms.$each[index].$error"
                            :field-error-msg="getLocalizationProp('Labels.PrivacyRequired')"
                        ></m-r3-term>
                    </div>

                    <v-button class="-outline w-full mt-10 inline-block text-center" @click.native="joinTeam">
                        {{ getLocalizationProp('Labels.Submit', 'Join Team') }}
                    </v-button>

                    <m-r3-error-messages :err-msgs="getFieldErrorMsgs($v.form, 'rest')"></m-r3-error-messages>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import apiGetteaminfo from '@api/routes/r3campaigns/getteaminfo';
    import apiJointeam from '@api/routes/r3campaigns/jointeam';
    import r3TermInfoMixin from '../../../mixins/r3-term-info';

    function checkFieldNotValid(fieldInfo, field) {
        // eslint-disable-next-line no-prototype-builtins
        return fieldInfo.$dirty && fieldInfo.hasOwnProperty(field) && !fieldInfo[field];
    }

    export default {
        name: 'OR3CampaignSignupMember',
        mixins: [localizationMixin, validationMixin, safeId, r3TermInfoMixin],
        safeIds: ['name', 'phoneNumber'],
        validations() {
            return {
                form: {
                    name: {
                        required,
                        isName: formHelper.isValidCnName

                    },
                    phoneNumber: {
                        required,
                        isPhoneNumber: formHelper.isValidCnPhoneNumber
                    }
                },
                terms: {
                    $each: {
                        term: {
                            required: (val, data) => {
                                const {Required} = data;
                                if(Required) {
                                    return val;
                                }
                                return true;
                            }
                        }
                    }
                }
            };
        },
        data() {
            return {
                teamId: '',
                teamNumber: '',
                teamLeader: '',
                leaderPhoneNumber: '',

                name: '',
                phoneNumber: '',
                form: {
                    name: '',
                    phoneNumber: ''
                },

                showSpinner: false,
                apiErrors: {
                    name: [],
                    phoneNumber: [],
                    rest: []
                },

                jointeamSuccess: false
            };
        },
        computed: {
            errorMap() {
                const {
                    FormatError,
                    NameRequired,
                    PhoneNumberRequired
                } = this.getLocalizationProp('Labels', {});
                return {
                    name: {
                        required: NameRequired,
                        isName: FormatError
                    },
                    phoneNumber: {
                        required: PhoneNumberRequired,
                        isPhoneNumber: FormatError
                    }
                };
            },
            campaignId() {
                return this.getLocalizationProp('Data.CampaignId');
            },
            title() {
                return this.getLocalizationProp('Labels.Title')
                    .replace('{0}', this.teamLeader);
            }
        },
        mounted () {
            this.teamId = this.getQueryFieldValue('teamId');
            this.getTeamInfo();
        },
        methods: {
            resetApiError() {
                this.apiErrors = {};
            },
            getQueryFieldValue(field) {
                const query = new URLSearchParams(window.location.search);
                return query.get(field) || '';
            },
            async getTeamInfo() {
                const response = await apiGetteaminfo.query({
                    campaignId: this.campaignId,
                    teamId: this.teamId
                });
                if(response.success && response.data.Success) {
                    if(response.data.Data) {
                        const {
                            TeamNumber = '',
                            Members = []
                        } = response.data.Data;
                        this.teamNumber = TeamNumber;
                        const leader = Members.filter(m => m.RoleType === 'TeamLeader')[0];
                        this.teamLeader = leader.CustomerName;
                    }
                }
            },
            isFieldError(info, field) {
                const fieldInfo = info[field];
                return fieldInfo.$error;
            },
            getPlaceholderErrorInfo(param, fieldInfo) {
                let res;
                switch (param) {
                    case 'minLength':
                        res = {
                            '{0}': fieldInfo.$params.minLength.min
                        };
                        break;
                    case 'maxLength':
                        res = {
                            '{0}': fieldInfo.$params.maxLength.max
                        };
                        break;
                    default:
                        break;
                }
                return res;
            },
            getFieldErrorMsgs(info, field) {
                let res = [];
                if(field !== 'rest' && this.$v.$invalid) {
                    const fieldInfo = info[field];
                    for (let p of Object.keys(fieldInfo.$params)) {
                        if(checkFieldNotValid(fieldInfo, p)) {
                            const placeholderInfo = this.getPlaceholderErrorInfo(p, fieldInfo);
                            let errorMsg = this.errorMap[field][p];
                            if(placeholderInfo) {
                                Object.keys(placeholderInfo).forEach((placeholder) => {
                                    errorMsg = errorMsg.replace(placeholder, placeholderInfo[placeholder]);
                                });
                            }
                            res.push(errorMsg);
                        }
                    }
                }
                // show api error
                if(this.apiErrors && this.apiErrors[field]) {
                    res = [].concat(res, this.apiErrors[field]);
                }
                return res;
            },
            async joinTeam() {
                this.$v.$touch();
                this.resetApiError();
                if(!this.$v.$invalid) {
                    this.showSpinner = true;
                    const response = await apiJointeam.post(
                        {
                            campaignId: this.campaignId,
                            teamId: this.teamId,
                            customerName: this.form.name,
                            phoneNumber: this.form.phoneNumber
                        }
                    );
                    this.showSpinner = false;
                    if(response.success) {
                        if(response.data.Success) {
                            this.jointeamSuccess = true;
                        } else {
                            const restErrors = (response.data.ErrorMessages || [])
                                .map(e => e.Translation);
                            this.apiErrors = {
                                name: [],
                                phoneNumber: [],
                                rest: restErrors
                            };
                        }
                    }
                }
            }
        }
    };
</script>
