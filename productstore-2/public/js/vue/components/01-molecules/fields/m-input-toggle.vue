<template>
    <div class="m-inputToggle">
        <input
            :id="inputId"
            v-model="toggle"
            :name="inputName"
            :checked="toggle"
            :readonly="disabled"
            :aria-disabled="disabled"
            :disabled="disabled"
            type="checkbox"
            class="m-inputToggle__input"
            @change="emmitChange"
            @keypress="keyboardChange"
        />
        <label :for="inputId" class="m-inputToggle__label">
            <div class="m-inputToggle__description">
                <slot></slot>
            </div>
            <div class="m-inputToggle__toggler"></div>
        </label>
    </div>
</template>

<script>
    export default {
        name: 'MInputToggle',
        props: {
            disabled: {
                type: Boolean,
                default: false
            },
            gtmId: {
                type: Number,
                default: null
            },
            inputId: {
                type: String,
                default: ''
            },
            inputName: {
                type: String,
                default: ''
            },
            value: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                toggle: ''
            };
        },
        watch: {
            value(val, oldVal) {
                this.toggle = val;
            }
        },
        mounted() {
            // Necessary to fix IE, Edge and Safari problem with toggle
            setTimeout(() => {
                this.toggle = this.value;
            }, 100);
        },
        methods: {
            emmitChange(event) {
                this.$emit('changed', {
                    name: this.inputName,
                    value: this.toggle
                });
                if(this.gtmId) {
                    this.gtmTrackAction({id: this.gtmId, text: this.inputName}, event);
                }
            },
            keyboardChange(event) {
                this.toggle = !this.toggle;
                this.emmitChange(event);
            }
        }
    };
</script>
