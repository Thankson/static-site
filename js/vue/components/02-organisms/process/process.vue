<template>
    <div class="o-process">
        <h1 class="o-process__heading">
            {{ getLocalizationProp('Data.Title') }}
        </h1>

        <div class="o-process__bar">
            <ol class="o-process__nav">
                <!-- TODO below click event not needed -->
                <li v-for="(process, index) in progressBar" :key="process.ProcessID" class="o-process__item" @click="setActiveStepProcessId(process.ProcessID)">
                    <div class="o-process__iconWrapper">
                        <span class="o-process__icon" :class="{'-active': process.ProcessID === activeStepProcessId, '-notLast': index !== totalSteps - 1}">
                            <img class="o-process__iconImg" :src="getStepIcon(process, index).Url" :alt="getStepIcon(process, index).Alt" />
                        </span>
                    </div>
                    <span class="o-process__title" :class="{'-active': process.ProcessID === activeStepProcessId}">{{ process.ProcessName }}</span>
                </li>
            </ol>
        </div>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OProcess',
        mixins: [ localizationMixin],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
            };
        },
        computed: {
            ...mapState('access', ['activeStepProcessId', 'progressBar']),
            // progressBar() {
            //     return this.getLocalizationProp('Data.ProgressBar', []);
            // },
            totalSteps() {
                return this.progressBar.length;
            },
            activeStepIndex() {
                return this.progressBar.findIndex(item => item.ProcessID === this.activeStepProcessId);
            }
        },
        mounted () {
            this.SET_PROGRESS_BAR(this.getLocalizationProp('Data.ProgressBar', []));
            this.setActiveStepProcessId();
        },
        methods: {
            ...mapMutations('access', ['SET_PROGRESS_BAR']),
            ...mapActions('access', ['setActiveStepProcessId']),
            getStepIcon(process, currentStepIndex) {
                if(this.activeStepIndex > currentStepIndex) {
                    return process.UndoIcon;
                } else if(this.activeStepIndex === currentStepIndex) {
                    return process.DoingIcon;
                } else if(this.activeStepIndex < currentStepIndex) {
                    return process.CompleteIcon;
                }
                return process.UndoIcon;
            }
        }
    };
</script>
