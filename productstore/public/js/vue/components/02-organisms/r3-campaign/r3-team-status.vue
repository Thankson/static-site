<template>
    <div class="o-r3TeamStatus">
        <div class="o-r3TeamStatus__content">
            <div class="absolute left-10 -top-13">
                <a-icon-text-badge
                    class="o-r3TeamStatus__iconTextBadge"
                    :badge-text="getLocalizationProp('Data.MyTeamSectionLabel.Label')"
                    :badge-image="getLocalizationProp('Data.MyTeamSectionLabel.Image', {})"
                ></a-icon-text-badge>
            </div>

            <div class="o-r3TeamStatus__teamInfo">
                <div class="inline-block mb-10">
                    <m-r3-logo
                        :image="getLocalizationProp('Data.CampaignLogo', {})"
                        :is-mid-logo="true"
                    ></m-r3-logo>
                </div>

                <div class="text-teal font-semibold">
                    <span>{{ getLocalizationProp('Labels.TeamName') }}: </span><span>{{ getLocalizationProp('Labels.TeamName') }}</span>
                </div>
                <div>
                    <span>{{ getLocalizationProp('Labels.TeamLeader') }}: </span><span>{{ getLocalizationProp('Labels.TeamLeader') }}</span>
                </div>
                <div>
                    <span>{{ getLocalizationProp('Labels.TeamId') }}: </span><span>{{ getLocalizationProp('Labels.TeamId') }}</span>
                </div>
                <div>
                    <span>{{ getLocalizationProp('Labels.TeamLeaderPhone') }}: </span><span>{{ getLocalizationProp('Labels.TeamLeaderPhone') }}</span>
                </div>
            </div>

            <div class="o-r3TeamStatus__memberInfo">
                <div class="o-r3TeamStatus__memberWrapper">
                    <div v-for="(member, index) in members" :key="`${member.name}-${index}`" class="o-r3TeamStatus__memberCard">
                        <div class="o-r3TeamStatus__memberCardTag">{{ member.Tag }}</div>

                        <div v-if="member.Name" class="o-r3TeamStatus__memberCardInfo">
                            <div class="o-r3TeamStatus__memberCardDelete">
                                <span
                                    class="o-r3TeamStatus__memberCardDeleteIcon material-icons"
                                >close</span>
                            </div>
                            <div class="text-lg font-semibold">{{ member.Name }}</div>
                            <div>{{ member.PhoneNumber }}</div>
                        </div>
                        <div
                            v-else
                            class="o-r3TeamStatus__memberCardNoMember"
                        >
                            {{ member.BlankText }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'OR3TeamStatus',
        mixins: [localizationMixin],
        computed: {
            members() {
                const teamMemberStr = this.getLocalizationProp('Labels.TeamMember');
                const toBeConfirmedStr = this.getLocalizationProp('Labels.ToBeConfirmed');
                return new Array(this.getLocalizationProp('Data.TeamMembers', 0))
                    .fill({
                        'BlankText': toBeConfirmedStr
                    })
                    .map((item, index) => ({
                        ...item,
                        Tag: `${teamMemberStr}${index + 1}`
                    }));
            }
        }
    };
</script>
