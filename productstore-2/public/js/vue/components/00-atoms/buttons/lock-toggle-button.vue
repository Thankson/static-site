<template>
    <div class="a-lockToggleButton">
        <input
            :id="inputId"
            v-model="toggle"
            :name="inputName"
            :checked="toggle"
            :aria-disabled="isLockedOrDisabled"
            :disabled="isLockedOrDisabled"
            type="checkbox"
            class="a-lockToggleButton__input"
            @change="emitChange"
            @keypress="keyboardChange"
        />
        <label :for="inputId" class="a-lockToggleButton__label">
            <div :class="[`a-lockToggleButton__toggler`, isLocked && '-locked']" />
            <div class="a-lockToggleButton__description">
                <slot />
            </div>
        </label>
    </div>
</template>

<script>
    export default {
        name: 'ALockToggleButton',
        props: {
            disabled: {
                type: Boolean,
                default: false
            },
            gtmId: {
                type: Number,
                default: null
            },
            inputName: {
                type: String,
                default: ''
            },
            inputId: {
                type: String,
                default: ''
            },
            isLocked: {
                type: Boolean,
                default: false
            },
            value: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                toggle: false
            };
        },
        computed: {
            isLockedOrDisabled() {
                return this.isLocked || this.disabled;
            }
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
            emitChange(event) {
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
                this.emitChange(event);
            }
        }
    };
</script>
