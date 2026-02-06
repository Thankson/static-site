<template>
    <div class="o-r3CampaignSignupLeader">
        <template v-if="!getLocalizationProp('Data.ShowOnDevices.WebDesktop')"></template>
        <div v-else class="w-full lg:w-1_2 lg:mx-auto relative">
            <div v-if="showSpinner" class="o-r3CampaignSignupLeader__loading">
                <a-loading-spinner :visible="true" aria-hidden="true">
                </a-loading-spinner>
            </div>

            <div class="o-r3CampaignSignupLeader__card">
                <div
                    v-if="isBuildSuccess"
                    v-html="getLocalizationProp('Data.SuccessMessage')"
                >
                </div>
                <div class="o-r3CampaignSignupLeader__field">
                    <span class="o-r3CampaignSignupLeader__label">
                        {{ getLocalizationProp('Labels.TeamLeader') }}
                    </span>
                    <span class="o-r3CampaignSignupLeader__value">
                        {{ customerName }}
                    </span>
                </div>
                <template v-if="hasNeverBuilt">
                    <p v-if="!phoneNumber" class=" flex text-sm leading-tight text-red">
                        <span class="font-material text-xs mr-3 mt-2 leading-base" aria-hidden="true">
                            error_outline
                        </span>
                        <span role="text">
                            {{ phoneNumberNotExist }}
                        </span>
                    </p>
                    <div class="o-r3CampaignSignupLeader__declare mt-10">
                        {{ getLocalizationProp('Labels.CreateTip') }}
                    </div>
                    <div v-for="(item, index) in terms" :key="`${item.Name}-${index}`">
                        <m-r3-term
                            v-model="$v.terms.$each[index].$model.term"
                            :name="item.Name"
                            :checkbox-label="item.Content"
                            :checkbox-label-extend="item.Modals"
                            :field-error="$v.terms.$each[index].$error"
                            :field-error-msg="getLocalizationProp('Labels.PrivacyRequired')"
                        ></m-r3-term>
                    </div>
                    <v-button
                        class="o-r3CampaignSignupLeader__confirmCreate -outline w-full mt-10 inline-block text-center "
                        :class="{
                            '-disabled': !phoneNumber
                        }"
                        :disabled="!phoneNumber"
                        @click="createTeam"
                    >
                        {{ getLocalizationProp('Labels.ConfirmCreate') }}
                    </v-button>
                    <m-r3-error-messages :err-msgs="restErrors"></m-r3-error-messages>
                </template>
                <template v-if="isBuilding || isBuildSuccess">
                    <div class="o-r3CampaignSignupLeader__field">
                        <span class="o-r3CampaignSignupLeader__label">
                            {{ getLocalizationProp('Labels.TeamId') }}
                        </span>
                        <span class="o-r3CampaignSignupLeader__value">
                            {{ teamNumber }}
                        </span>
                    </div>
                    <v-button v-if="!isBuildSuccess" class="-outline w-full mt-10 inline-block text-center" @click="shareAndInvite">
                        {{ getLocalizationProp('Labels.ShareAndInvite') }}
                    </v-button>
                </template>
            </div>

            <div v-if="isBuilding || isBuildSuccess" class="o-r3CampaignSignupLeader__card">
                <div class="o-r3CampaignSignupLeader__summary mb-10">
                    {{ getLocalizationProp('Labels.JoinedMembers') }}
                    <span class="o-r3CampaignSignupLeader__summary--status text-green-100">
                        {{ membersInvited.length }} / {{ teamMembers }}
                    </span>
                </div>
                <div class="o-r3CampaignSignupLeader__members">
                    <div
                        v-for="(member, index) in members" :key="`${member && member.PhoneNumber}-${index}`"
                        class="o-r3CampaignSignupLeader__member"
                    >
                        <span class="o-r3CampaignSignupLeader__member-left">
                            <a-icon class="o-r3CampaignSignupLeader__memberIcon -textXl" :class="member ? 'bg-green': 'bg-gray'">person</a-icon>
                            <span class="o-r3CampaignSignupLeader__memberLabel">{{ getLocalizationProp('Labels.TeamMember') }}{{ index + 1 }}</span>
                        </span>
                        <span class="o-r3CampaignSignupLeader__member-right">
                            <template v-if="member">
                                <span class="o-r3CampaignSignupLeader__memberName">{{ member.CustomerName }}</span>
                                <span class="o-r3CampaignSignupLeader__memberPhonenumber">{{ member.PhoneNumber }}</span>
                            </template>
                            <template v-else>
                                {{ getLocalizationProp('Labels.ToBeConfirmed') }}
                            </template>
                        </span>

                    </div>
                </div>
                <p class=" flex text-sm leading-tight text-gray my-10">
                    <span
                        class="font-material text-xs mr-3 mt-2 leading-base"
                        aria-hidden="true"
                    >
                        error_outline
                    </span>
                    <span role="text">
                        {{ nonMemberTip }}
                    </span>
                </p>
            </div>

        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    import apiGetteaminfo from '@api/routes/r3campaigns/getteaminfo';
    import apiCreateteam from '@api/routes/r3campaigns/createteam';
    import r3TermInfoMixin from '../../../mixins/r3-term-info';

    export default {
        name: 'OR3CampaignSignupLeader',
        mixins: [localizationMixin, validationMixin, r3TermInfoMixin],
        data() {
            return {
                hasNeverBuilt: false,
                isBuilding: false,
                isBuildSuccess: false,

                showSpinner: false,
                restErrors: [],

                teamId: '',
                teamNumber: '',
                membersInvited: []
            };
        },
        computed: {
            phoneNumberNotExist() {
                return this.getLocalizationProp('Labels.PhoneNumberNotExist');
            },
            campaignId() {
                return this.getLocalizationProp('Data.CampaignId');
            },
            customerName() {
                return this.getLocalizationProp('Data.TeamLeaderInfo.CustomerName');
            },
            phoneNumber() {
                return this.getLocalizationProp('Data.TeamLeaderInfo.PhoneNumber');
            },
            teamMembers() {
                return this.getLocalizationProp('Data.TeamMembers');
            },
            members() {
                const membersInvitedCnt = this.membersInvited?.length || 0;
                const membersLeftCnt = this.teamMembers - membersInvitedCnt;
                if(membersLeftCnt <= 0) {
                    return this.membersInvited;
                }
                const left = Array(membersLeftCnt).fill(undefined);
                return this.membersInvited.concat(left);
            },
            nonMemberTip() {
                return this.getLocalizationProp('Labels.NonMemberTip')
                    .replace('{0}', this.getLocalizationProp('Data.NeedNonMembers'));
            }
        },
        validations() {
            return {
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
        mounted () {
            this.getTeamInfo();
        },
        methods: {
            async getTeamInfo() {
                if(!this.campaignId || !this.phoneNumber) {
                    this.hasNeverBuilt = true;
                    return;
                }
                const response = await apiGetteaminfo.query({
                    campaignId: this.campaignId,
                    phoneNumber: this.phoneNumber
                });
                if(response.success && response.data.Success) {
                    if(!response.data.Data) {
                        this.hasNeverBuilt = true;
                    } else {
                        const {
                            IsBuildSuccess = false,
                            TeamId,
                            TeamNumber = '',
                            Members = []
                        } = response.data.Data;
                        this.isBuilding = !IsBuildSuccess;
                        this.isBuildSuccess = IsBuildSuccess;
                        this.teamId = TeamId;
                        this.teamNumber = TeamNumber;
                        this.membersInvited = Members.filter(m => m.RoleType === 'TeamMember');
                    }
                }
            },
            async createTeam() {
                this.$v.$touch();
                if(!this.$v.$invalid) {
                    this.showSpinner = true;
                    const response = await apiCreateteam.post(
                        {
                            campaignId: this.campaignId,
                            customerName: this.customerName,
                            phoneNumber: this.phoneNumber
                        }
                    );
                    this.showSpinner = false;
                    if(response.success) {
                        if(response.data.Success) {
                            window.location.reload();
                        } else {
                            this.restErrors = (response.data.ErrorMessages || [])
                                .map(e => e.Translation);
                        }
                    }
                }
            },
            async shareAndInvite() {
                try {
                    const shareAndInviteUrl = `${document.location.origin}${this.getLocalizationProp('Data.SharedCardUrl')}?teamId=${this.teamId}`;
                    await navigator.clipboard.writeText(shareAndInviteUrl);
                    console.log('Copied');
                } catch (error) {
                    console.log('Not copy', error);
                }
            }
        }
    };
</script>
