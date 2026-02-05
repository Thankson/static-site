<template>
    <article class="o-myPhotoUpload">
        <form v-if="data.Form" class="o-myPhotoUpload__form" @submit="submit">
            <label class="o-myPhotoUpload__label" for="firstPersonName">{{ data.Form.FirstPersonName }}</label>
            <input-basic
                id="firstPersonName"
                ref="firstPersonName"
                name="firstPersonName"
                :placeholder="data.Form.FirstPersonPlaceholder"
                :value="firstPersonName"
                :tailwind-mods="`bg-clear ${error.email ? '-isInvalid': ''}`"
                @keyup="error.firstPersonName = undefined"
                @input="setValue('firstPersonName', $event)"
            />

            <label class="o-myPhotoUpload__label" for="firstPersonOccupation">{{ data.Form.FirstPersonOccupation }}</label>
            <input-basic
                id="firstPersonOccupation"
                ref="firstPersonOccupation"
                name="firstPersonOccupation"
                :value="firstPersonOccupation"
                :tailwind-mods="`bg-clear ${error.email ? '-isInvalid': ''}`"
                @keyup="error.firstPersonOccupation = undefined"
                @input="setValue('firstPersonOccupation', $event)"
            />

            <label class="o-myPhotoUpload__label" for="secondPersonName">
                {{ data.Form.SecondPersonName }}
                <span class="o-myPhotoUpload__optionalLabel">{{ data.Form.Optional }}</span>
            </label>
            <input-basic
                id="secondPersonName"
                ref="secondPersonName"
                name="secondPersonName"
                :value="secondPersonName"
                :placeholder="data.Form.SecondPersonPlaceholder"
                :tailwind-mods="`bg-clear ${error.email ? '-isInvalid': ''}`"
                @keyup="error.secondPersonName = undefined"
                @input="setValue('secondPersonName', $event)"
            />

            <label class="o-myPhotoUpload__label" for="secondPersonOccupation">
                {{ data.Form.SecondPersonOccupation }}
                <span class="o-myPhotoUpload__optionalLabel">{{ data.Form.Optional }}</span>
            </label>
            <input-basic
                id="secondPersonOccupation"
                ref="secondPersonOccupation"
                name="secondPersonOccupation"
                :value="secondPersonOccupation"
                :tailwind-mods="`bg-clear ${error.email ? '-isInvalid': ''}`"
                @keyup="error.secondPersonOccupation = undefined"
                @input="setValue('secondPersonOccupation', $event)"
            />

            <div class="o-myPhotoUpload__photoSection" aria-live="polite">
                <input
                    id="photoUpload"
                    name="photoUpload"
                    type="file"
                    :aria-label="data.Form.PhotoAriaLabel"
                    class="o-myPhotoUpload__uploadButton -input"
                    :accept="data.Form.FileType"
                    @change="[processFile($event), gtmTrackAction({ id: 170, text: data.Form.UploadButton }, $event)]"
                />
                <label class="o-myPhotoUpload__uploadButton -label" for="photoUpload">
                    {{ data.Form.UploadButton }}
                </label>
                <p v-if="error.image" class="o-myPhotoUpload__text -error" role="alert">
                    <a-icon size="inherit" class="mr-4">info</a-icon>
                    {{ error.image }}
                </p>
                <p v-else class="o-myPhotoUpload__text">{{ image.name || data.Form.EmptyImage }}</p>
            </div>
            <div class="o-myPhotoUpload__wrapper">
                <span class="o-myPhotoUpload__label">{{ data.Form.RadioBoxLabel }}</span>
                <div v-for="(radio, index) in data.Form.PhotoLicense" :key="index" class="o-myPhotoUpload__radio">
                    <m-radio
                        v-model="ownsPhotoRights"
                        :name="radio.Name"
                        :input-value="radio.Value"
                        mods="w-auto"
                        @input="gtmTrackAction({id: 171, text: radio.Label}, $event)">
                        <span>{{ radio.Label }}</span>
                    </m-radio>
                </div>
                <div v-if="!ownsPhotoRights" class="o-myPhotoUpload__photoRights">
                    <p class="o-myPhotoUpload__title -rights">{{ data.PhotoRights.Label }}</p>
                    <span class="o-myPhotoUpload__label -rights">{{ data.PhotoRights.InputLabel }}</span>
                    <div class="o-myPhotoUpload__photoSection -rights">
                        <input
                            id="photoRightsUpload"
                            name="photoRightsUpload"
                            type="file"
                            :aria-label="data.Form.LicenseAriaLabel"
                            class="o-myPhotoUpload__uploadButton -input"
                            :accept="data.PhotoRights.FileType"
                            @change="[processRightsPhotoFile($event), gtmTrackAction({ id: 170, text: data.PhotoRights.UploadButton }, $event)]"
                        />
                        <label class="o-myPhotoUpload__uploadButton -label -photoRights" for="photoRightsUpload">
                            {{ data.PhotoRights.UploadButton }}
                        </label>
                        <p class="o-myPhotoUpload__text">{{ photographerRelease.name || data.PhotoRights.EmptyImage }}</p>
                    </div>
                    <p class="o-myPhotoUpload__text -rights">
                        <span class="o-myPhotoUpload__label -rights">{{ data.PhotoRights.EmailLabel }}</span>
                        <span class="o-myPhotoUpload__text -email">{{ data.PhotoRights.EmailText }}</span>
                    </p>
                    <p class="o-myPhotoUpload__text -rights">
                        <span class="o-myPhotoUpload__label -rights">{{ data.PhotoRights.FaxLabel }}</span>
                        <span>{{ data.PhotoRights.FaxText }}</span>
                    </p>
                    <p class="o-myPhotoUpload__text -rights">
                        <span class="o-myPhotoUpload__label -rights">{{ data.PhotoRights.MailLabel }}</span>
                        <span v-html="data.PhotoRights.MailText"></span>
                    </p>
                </div>
            </div>
            <v-button
                class="-submit w-full md:w-auto block"
                :aria-label="data.Form.SubmitAriaLabel"
                :disabled="disabled"
                type="submit"
                @click="gtmTrackAction({ id: 170, text: data.Form.SubmitText }, $event)"
            >
                {{ data.Form.SubmitText }}
            </v-button>
            <a-loading-spinner :visible="loading" size="sm" />
            <p v-if="error.form" class="o-myPhotoUpload__text -error" role="alert">
                <a-icon size="inherit" class="mr-4">info</a-icon>
                {{ error.form }}
            </p>
        </form>
        <p class="o-myPhotoUpload__caption" v-html="data.Caption"></p>
    </article>
</template>
<script>
    import api from '@api/routes/account/recognitions';
    export default {
        name: 'OMyPhotoUpload',
        props: {
            data: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                base64Img: '',
                base64PhotographerRelease: '',
                error: {
                    image: null
                },
                firstPersonName: undefined,
                firstPersonOccupation: undefined,
                image: {},
                loading: false,
                ownsPhotoRights: true,
                photographerRelease: {},
                secondPersonName: undefined,
                secondPersonOccupation: undefined
            };
        },
        computed: {
            disabled() {
                return !(this.firstPersonName && this.firstPersonOccupation && this.validatePhotoLicense && this.image.name && this.base64Img);
            },
            validatePhotoLicense() {
                return this.ownsPhotoRights ? true : !!this.base64PhotographerRelease;
            }
        },
        mounted() {
            this.firstPersonName = this.data?.NameOfFirstPerson;
            this.firstPersonOccupation = this.data?.OccupationOfFirstPerson;
            this.secondPersonName = this.data?.NameOfSecondPerson;
            this.secondPersonOccupation = this.data?.OccupationOfSecondPerson;
            this.ownsPhotoRights = this.data?.OwnsPhotoRights;
        },
        methods: {
            processFile: function(event) {
                this.error.image = null;
                this.image = event.target.files[0];
                var reader = new FileReader();
                reader.readAsDataURL(this.image);
                reader.onload = (e) => {
                    this.base64Img = e.target.result;
                };
            },
            processRightsPhotoFile: function(event) {
                this.photographerRelease = event.target.files[0];
                var reader = new FileReader();
                reader.readAsDataURL(this.photographerRelease);
                reader.onload = (e) => {
                    this.base64PhotographerRelease = e.target.result;
                };
            },
            getBase64Image: function() {
                var reader = new FileReader();
                reader.readAsDataURL(this.image);
                reader.onload = (e) => {
                    this.base64Img = e.target.result;
                };
            },
            setValue: function (data, value) {
                this[data] = value;
            },
            submit: async function(event) {
                event.preventDefault();
                if(this.disabled) {
                    return;
                }
                this.error.form = null;
                if(!this.data?.Form?.FileType.includes(this.image.type)) {
                    this.error.image = this.data.FileTypeError;
                    return;
                }
                const imageSizeInMb = (this.image.size / (1024 * 1024)).toFixed(2);
                if(imageSizeInMb < this.data.ImageMinSizeInMb || imageSizeInMb > this.data.ImageMaxSizeInMb) {
                    this.error.image = this.data.FileSizeError;
                    return;
                }
                const data = {
                    NameOfFirstPerson: this.firstPersonName,
                    OccupationOfFirstPerson: this.firstPersonOccupation,
                    NameOfSecondPerson: this.secondPersonName,
                    OccupationOfSecondPerson: this.secondPersonOccupation,
                    OwnsPhotoRights: this.ownsPhotoRights,
                    PhotoData: this.base64Img.split('base64,').pop()
                };
                if(!this.ownsPhotoRights) data.PhotoReleaseData = this.base64PhotographerRelease.split('base64,').pop();

                this.loading = true;
                if(!this.data.PhotoStatusType) {
                    const response = await api.post(JSON.stringify(data));
                    if(response.success) {
                        this.loading = false;
                        window.location.href = this.data.RedirectUrl.Url;
                    } else {
                        this.error.form = response.data?.ErrorMessages[0]?.Translation;
                    }
                    return;
                }

                const response = await api.put(JSON.stringify(data));
                if(response.success) {
                    this.loading = false;
                    window.location.href = this.data.RedirectUrl.Url;
                } else {
                    this.error.form = response.data?.ErrorMessages[0]?.Translation;
                }
            }
        }
    };
</script>
