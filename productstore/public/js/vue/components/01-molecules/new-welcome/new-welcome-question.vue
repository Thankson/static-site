<template>
    <div class="m-newWelcomeQuestion">
        <h2 class="m-newWelcomeQuestion__question">
            {{ componentData.Question }}
        </h2>
        <p class="m-newWelcomeQuestion__instructions">
            {{ componentData.Instructions }}
        </p>
        <ul
            v-if="componentData.Type === 'checkbox'"
            :id="componentData.Id"
            class="m-newWelcomeQuestion__checkboxList"
        >
            <li
                v-for="answer in componentData.Answers"
                :key="uniqid(answer.Id)"
                class="m-newWelcomeQuestion__checkboxItem"
            >
                <img
                    class="n-newWelcomeQuestion__image"
                    :src="answer.Image.Url"
                    :alt="answer.Image.Alt"
                />
                <m-checkbox
                    :id="answer.Id"
                    :input-value="answer.Id"
                    :label="answer.Text"
                    label-mods="-new-welcome -items-start"
                    mod-class="-facet"
                    :value="checkedList"
                    @input="handleCheckboxInput"
                />
            </li>
        </ul>
        <div
            v-if="componentData.Type === 'radio'"
            :id="componentData.Id"
            class="m-newWelcomeQuestion__radiosContainer"
        >
            <div>
                <m-radio
                    v-for="answer in componentData.Answers"
                    :id="answer.Id"
                    :key="uniqid(answer.Id)"
                    :input-value="answer.Id"
                    :label="answer.Text"
                    :value="radioValue"
                    @input="handleRadioInput"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import uniqid from 'uniqid';

    export default {
        name: 'MNewWelcomeQuestion',
        props: {
            componentData: {
                type: Object,
                required: true
            },
            radioValue: {
                type: String,
                default: ''
            },
            userAnswersObject: {
                type: Object,
                default: () => {}
            }
        },
        computed: {
            checkedList() {
                return this.userAnswersObject[this.componentData.Id];
            }
        },
        methods: {
            handleCheckboxInput(currentVal, event) {
                this.$emit('checkboxInput', currentVal, event);
            },
            handleRadioInput(inputVal) {
                this.$emit('radioInput', inputVal);
            },
            uniqid(id) {
                return `${id}-${uniqid()}`;
            }
        }
    };
</script>
