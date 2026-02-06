<template>
    <div class="o-r3TeamDetail">

        <div class="o-r3TeamDetail__header">
            <div class="absolute left-10 -top-13">
                <a-icon-text-badge
                    class="o-r3TeamDetail__iconTextBadge"
                    :badge-text="getLocalizationProp('Data.MyTeamSectionLabel.Label')"
                    :badge-image="getLocalizationProp('Data.MyTeamSectionLabel.Icon', {})"
                ></a-icon-text-badge>
            </div>

            <div class="text-center">
                <div class="inline-block mb-10">
                    <m-r3-logo
                        :image="getLocalizationProp('Data.CampaignLogo', {})"
                        :is-mid-logo="false"
                    ></m-r3-logo>
                </div>

                <div class="text-teal font-semibold">
                    <span>{{ getLocalizationProp('Labels.TeamNameLabel') }}: </span><span>{{ getLocalizationProp('Labels.TeamNameLabel') }}</span>
                </div>
                <div>
                    <span>{{ getLocalizationProp('Labels.TeamLeaderLabel') }}: </span><span>{{ getLocalizationProp('Labels.TeamLeaderLabel') }}</span>
                </div>
                <div>
                    <span>{{ getLocalizationProp('Labels.TeamNumberLabel') }}: </span><span>{{ getLocalizationProp('Labels.TeamNumberLabel') }}</span>
                </div>
                <div>
                    <span>{{ getLocalizationProp('Labels.TeamLeaderPhoneLabel') }}: </span><span>{{ getLocalizationProp('Labels.TeamLeaderPhoneLabel') }}</span>
                </div>
            </div>
        </div>

        <div class="o-r3TeamDetail__chart">
            <div class="o-r3TeamDetail__chartBadge">
                <a-icon-text-badge
                    class="o-r3TeamDetail__iconTextBadge"
                    :badge-text="getLocalizationProp('Data.CheckInSectionLabel.Label')"
                    :badge-image="getLocalizationProp('Data.CheckInSectionLabel.Icon', {})"
                ></a-icon-text-badge>
            </div>
            <div class="o-r3TeamDetail__chartInfo">
                <div class="o-r3TeamDetail__chartScale">100</div>
                <div class="o-r3TeamDetail__chartScale">50</div>
                <div class="o-r3TeamDetail__chartScale relative">
                    0
                    <div class="o-r3TeamDetail__chartTime">
                        <span>1st</span>
                        <span>2nd</span>
                        <span>3rd</span>
                        <span class="font-bold">4th</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="o-r3TeamDetail__summary">
            <div class="o-r3TeamDetail__summaryBadge">
                <a-icon-text-badge
                    class="o-r3TeamDetail__iconTextBadge"
                    :badge-text="getLocalizationProp('Data.TeamStatusSectionLabel.Label')"
                    :badge-image="getLocalizationProp('Data.TeamStatusSectionLabel.Icon', {})"
                ></a-icon-text-badge>
            </div>

            <div class="o-r3TeamDetail__summaryInfo">
                <div v-for="member in members" :key="member.Name" class="o-r3TeamDetail__summaryItem">
                    <div class="o-r3TeamDetail__summaryItemTag">{{ member.Tag }}</div>

                    <div class="o-r3TeamDetail__summaryContent">
                        <div class="o-r3TeamDetail__summaryContentMilestone">
                            <div class="text-xs mb-5">
                                <span>{{ member.Name }}</span>
                                <span class="text-gray-50">{{ member.PhoneNumber }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="o-r3TeamDetail__summaryClockinIcon material-icons">calendar_today</span>
                                <span class="o-r3TeamDetail__summaryClockinLine"></span>
                                <span class="o-r3TeamDetail__summaryClockinIcon material-icons">calendar_today</span>
                                <span class="o-r3TeamDetail__summaryClockinLine"></span>
                                <span class="o-r3TeamDetail__summaryClockinIcon material-icons -noclockin">close</span>
                                <span class="o-r3TeamDetail__summaryClockinLine"></span>
                                <span class="o-r3TeamDetail__summaryClockinIcon material-icons">calendar_today</span>
                            </div>
                        </div>
                        <div class="o-r3TeamDetail__summaryCount">
                            <div class="font-semibold">
                                <span class="text-sm">{{ member.LosingCnt }}</span><span class="text-tiny">{{ getLocalizationProp('Labels.KgLabel') }}</span>
                            </div>
                            <div class="text-tiny font-thin">{{ getLocalizationProp('Labels.WeightLosingLabel') }}</div>
                        </div>
                        <div class="o-r3TeamDetail__summaryCount -percent">
                            <div class="font-semibold">
                                <span class="text-sm">{{ member.LosingPercent }}</span><span class="text-tiny">{{ getLocalizationProp('Labels.PercentLable') }}</span>
                            </div>
                            <div class="text-tiny font-thin">{{ getLocalizationProp('Labels.WeightLosingPercentLabel') }}</div>
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
        name: 'OR3TeamDetail',
        mixins: [localizationMixin],
        data() {
            return {
                membersMock: [{}, {}, {}]
            };
        },
        computed: {
            orderMap() {
                const {TeamMember1stLabel, TeamMember2ndLabel, TeamMember3rdLabel, TeamMember4thLabel} = this.getLocalizationProp('Labels', {});
                return [
                    TeamMember1stLabel, TeamMember2ndLabel, TeamMember3rdLabel, TeamMember4thLabel
                ];
            },
            members() {
                return this.membersMock.map((item, index) => ({
                    ...item,
                    'Tag': this.orderMap[index],
                    'Name': `Member ${index + 1}`,
                    'PhoneNumber': '1234XXX8888',
                    'LosingCnt': 5.5 - index,
                    'LosingPercent': 6.6 - index
                }));
            }
        }
    };
</script>
