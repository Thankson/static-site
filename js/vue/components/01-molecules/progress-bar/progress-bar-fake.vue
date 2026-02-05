<template>
    <div class="m-progressBar -fake">
        <ol class="m-progressBar__nav" :class="{'-restrictMobileWidth': steps.length < 4}">
            <li
                v-for="(step, i) in steps"
                :key="i"
                class="m-progressBar__item"
            >

                <div class="m-progressBar__inner">
                    <span class="m-progressBar__progress">
                        <span class="m-progressBar__line">
                            <span class="m-progressBar__icon">
                                <a-bullet
                                    :complete="step.IsChecked"
                                    :class="!step.IsChecked ? '-active' : ''" />
                            </span>
                        </span>
                    </span>

                    <span class="m-progressBar__title">
                        {{ step.Title }}
                    </span>
                </div>
            </li>
        </ol>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'MProgressBarFake',
        mixins: [
            localizationMixin
        ],
        computed: {
            steps() {
                return this.getLocalizationProp('Data.Steps');
            }
        }
    };
</script>
