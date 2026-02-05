<template>
    <div class="o-lvipJourney">
        <div class="o-lvipJourney__container">
            <div class="o-lvipJourney__content">
                <canvas id="lvipJourneyCanvas" ref="lvipJourneyCanvas" width="926" height="128" class="o-lvipJourney__canvas">
                </canvas>
                <!-- Note that for most cultures, the text uses the Steps.Title for the text under the icon and Steps.Description for the text above the "start shopping" button.
                However, Korea uses a separate StepText property to replace Steps.Title in certain cases -->
                <ul class="o-lvipJourney__list">
                    <li v-for="(item, index) in steps" :key="index" class="o-lvipJourney__listItem" :class="[index === currentSteps ? '-currentListItem' : '', index < currentSteps ? '-activeListItem' : '', stepsTotalClass]">
                        <div class="o-lvipJourney__item" :class="item.IconType === 'number' && index != currentSteps ? '-hasNumber' : ''">
                            <!--  Icons -->
                            <span
                                v-if="item.IconType === 'location' && showLocation(index, item)" aria-hidden="true"
                                :class="placeActiveClass(index)"
                                class="o-lvipJourney__place a-icon material-icons -lg">place</span>
                            <span v-if="item.IconType === 'number' && index !== currentSteps" class="o-lvipJourney__number" :class="getNumbersClass(index)">{{ index }}</span>
                            <div v-if="showHereIcon(index,item)" class="o-lvipJourney__current">
                                <span aria-hidden="true" class="o-lvipJourney__place a-icon material-icons -lg -active">place</span>
                                <span class="o-lvipJourney__here" :class="hereTextPadding" v-html="getLocalizationProp('Labels.Here')"></span>
                                <span v-if="item.IconType === 'number'" class="o-lvipJourney__index">{{ index }}</span>
                            </div>

                            <!--  Text -->
                            <p v-if="isCn" class="o-lvipJourney__description">{{ item.Title }}</p>
                            <template v-else>
                                <!-- Title for less than 8 steps, eg China, KR and NA -->
                                <p v-if="showStepText(index) && steps.length !== 8" class="o-lvipJourney__description">{{ getLocalizationProp('Labels.StepText') }}  </p>
                                <p v-else-if="showDescriptionText(index)" class="o-lvipJourney__description">{{ item.Description }} </p>
                                <!-- Title for 8 steps, eg Japan -->
                                <p v-if="index !== steps.length - 2 || showTitleText(index)" class="o-lvipJourney__description">{{ item.Title }}</p>
                            </template>
                        </div>
                    </li>
                </ul>
            </div>

            <!-- Shopping Link styling different for 8 steps -->
            <div class="o-lvipJourney__shoppingLink" :class="is8Steps ? '-is8Steps' : ''">
                <p v-html="description"></p>
                <a
                    :href="getLocalizationProp('Data.Shopping.Link')"
                    class="a-button -white -lvip">
                    {{ getLocalizationProp('Data.Shopping.Label', 'Shopping') }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OLvipJourney',
        mixins: [localizationMixin],
        data() {
            return {
                steps: [],
                currentSteps: 0,
                description: '',
                chartCoordObj: {
                    5: [
                        {
                            'moveTo': [0, 128],
                            'quadratic': [100, 28, 216, 44]
                        },
                        {
                            'moveTo': [216, 44],
                            'quadratic': [380, 90, 429, 87]
                        },
                        {
                            'moveTo': [430, 87],
                            'quadratic': [555, 90, 665, 53]
                        },
                        {
                            'moveTo': [670, 53],
                            'quadratic': [860, 0, 900, 10]
                        }
                    ],
                    6: [
                        {
                            'moveTo': [0, 128],
                            'quadratic': [70, 60, 200, 50]
                        },
                        {
                            'moveTo': [200, 50],
                            'quadratic': [300, 40, 400, 100]
                        },
                        {
                            'moveTo': [400, 100],
                            'quadratic': [525, 130, 575, 110]
                        },
                        {
                            'moveTo': [575, 110],
                            'quadratic': [700, 20, 750, 20]
                        },
                        {
                            'moveTo': [750, 20],
                            'quadratic': [850, 0, 900, 30]
                        }
                    ],
                    7: [
                        {
                            'moveTo': [0, 128],
                            'quadratic': [70, 60, 150, 50]
                        },
                        {
                            'moveTo': [150, 50],
                            'quadratic': [240, 50, 290, 95]
                        },
                        {
                            'moveTo': [290, 95],
                            'quadratic': [370, 135, 435, 120]
                        },
                        {
                            'moveTo': [440, 120],
                            'quadratic': [450, 120, 600, 75]
                        },
                        {
                            'moveTo': [600, 75],
                            'quadratic': [580, 80, 780, 20]
                        },
                        {
                            'moveTo': [780, 20],
                            'quadratic': [850, 0, 926, 0]
                        }

                    ],
                    8: [
                        {
                            'moveTo': [0, 128],
                            'quadratic': [70, 60, 150, 50]
                        },
                        {
                            'moveTo': [150, 50],
                            'quadratic': [240, 50, 290, 95]
                        },
                        {
                            'moveTo': [290, 95],
                            'quadratic': [320, 110, 410, 120]
                        },
                        {
                            'moveTo': [410, 120],
                            'quadratic': [420, 135, 560, 98]
                        },
                        {
                            'moveTo': [560, 95],
                            'quadratic': [545, 110, 680, 50]
                        },
                        {
                            'moveTo': [680, 50],
                            'quadratic': [700, 30, 800, 10]
                        },
                        {
                            'moveTo': [800, 10],
                            'quadratic': [850, 0, 926, 15 ]
                        }
                    ]
                }
            };
        },
        computed: {
            hasGoldStatus() {
                return this.getLocalizationProp('Data.NextLVIPStatus') === 'Platinum';
            },
            // If no Here Text, show Place icon instead of You are Here icon
            hasHereText() {
                return this.getLocalizationProp('Labels.Here');
            },
            hereTextPadding() {
                const textLength = this.getLocalizationProp('Labels.Here').length;
                return textLength > 2 ? '-longText' : '-shortText';
            },
            is8Steps() {
                return this.steps.length === 8;
            },
            isVip: function () {
                return this.$custInfo?.lvipStatus;
            },
            isCn: function () {
                return this.$env?.IsCn || false;
            },
            stepsLength() {
                return this.steps.length;
            },

            stepsTotalClass() {
                const stepLength = this.stepsLength;

                if(stepLength === 5) {
                    return '-fiveSteps';
                } else if(stepLength === 6) {
                    return '-sixSteps';
                } else if(stepLength === 7) {
                    return '-sevenSteps';
                } else if(stepLength === 8) {
                    return '-eightSteps';
                } else {
                    return '';
                }
            }
        },
        mounted() {
            this.steps = this.getLocalizationProp('Data.Steps');
            let currentSteps = this.getLocalizationProp('Data.CurrentSteps');
            this.hasStepText = !!this.getLocalizationProp('Labels.StepText');
            let monthToReachNextLVIPStatus = this.getLocalizationProp('Data.MonthToReachNextLVIPStatus');
            // Note that currentSteps refers to the current step, not the current step index
            this.currentSteps = currentSteps;
            this.description = this.steps[this.currentSteps].Description;
            let c = document.getElementById('lvipJourneyCanvas');
            let stepNum = this.stepsLength;

            let chartObj = this.chartCoordObj;
            let ctx = [];

            // Line is generated for each step in the journey. Points are generated through CSS.
            this.steps.forEach(function(item, index) {
                item.Title = item.Title.replace('{0}', monthToReachNextLVIPStatus);
                ctx[index] = c.getContext('2d');
                ctx[index].beginPath();
                ctx[index].lineWidth = 4;
                ctx[index].setLineDash([18, 6]);

                // Use chartObj based on index and number of steps
                const currentChart = chartObj[stepNum][index];
                if(currentChart) {
                    ctx[index].moveTo(...(currentChart.moveTo));
                    ctx[index].quadraticCurveTo(...(currentChart.quadratic));
                }

                if(index < currentSteps) {
                    ctx[index].strokeStyle = '#15AEBA';
                } else {
                    ctx[index].strokeStyle = '#E8ECF7';
                }
                ctx[index].stroke();
            });
        },
        methods: {
            getNumbersClass(index) {
                return index < this.currentSteps ? '-active' : '';
            },
            isReplaceLocation(index, item) {
                // Cn is 5 step and need to show here Icon for all current steps except its first one
                if(this.isCn && this.showHereIcon(index, item)) {
                    return false;
                }
                return true;
            },
            placeActiveClass(index) {
                const isCnActive = ((index === this.currentSteps && this.currentSteps === 0) || index < this.currentSteps) ? '-active' : '';
                const nonCnActive = (index === 0 || index <= this.currentSteps || ((index === this.currentSteps && this.currentSteps === 0)) || ((index === this.stepsLength - 2 && this.hasGoldStatus)) ? '-active' : '');
                return this.isCn ? isCnActive : nonCnActive;
            },
            showHereIcon(index, item) {
                // Show for all current steps except if its last or second last
                // Exception - Needs to be shown for second last step incase of TW
                // TW is 7 step and should have second last icon as 'number'
                // Cn is 5 step and need to show here Icon for all current steps except its first one
                if(this.isCn) {
                    return index === this.currentSteps && this.currentSteps !== 0 && this.hasHereText;
                }
                return index === this.currentSteps && this.currentSteps !== 0 && (this.currentSteps < this.stepsLength - 2 || (this.currentSteps === this.stepsLength - 2 && this.stepsLength > 6)) && this.hasHereText && item.IconType !== 'location';
            },
            showLocation(index, item) {
                let checkCurrentSteps = this.currentSteps === 0 || index !== this.currentSteps || (index === this.currentSteps && index >= this.stepsLength - 2);
                let isShowLocation = this.isReplaceLocation(index, item);
                if(this.isCn) {
                    checkCurrentSteps = checkCurrentSteps && isShowLocation;
                }
                if(this.stepsLength < 8) {
                    return checkCurrentSteps;
                } else {
                    return checkCurrentSteps || (!this.hasHereText && index > 5);
                }
            },

            // FOR CULTURES OTHER THAN JAPAN
            // Note that Korea uses stepText, unlike other cultures
            showStepText(index) {
                const checkVipAndSteps = index === this.stepsLength - 2 && this.isVip && this.hasStepText;
                if(this.stepsLength < 8) {
                    return this.currentSteps > 2 && checkVipAndSteps;
                }
            },

            showDescriptionText(index) {
                return (index === this.stepsLength - 2) && (this.currentSteps !== this.stepsLength - 2) && (this.currentSteps !== this.stepsLength - 1) && !this.showTitleText(index);
            },

            // FOR JAPAN ONLY (CURRENTLY)
            // Always show Title Text for Japan
            showTitleText(index) {
                return (this.stepsLength === 8 && this.steps[index].Title);
            }
        }
    };
</script>
