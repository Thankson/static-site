<template>
    <footer class="m-printTemplate__footer">
        <div class="m-printTemplate__row -footer">
            <div class="m-printTemplate__col -footer">
                <div class="m-printTemplate__text" v-html="address"></div>
            </div>
            <div class="m-printTemplate__col -footer">
                <div class="m-printTemplate__text -contact" v-html="contact"></div>
            </div>
        </div>
    </footer>
</template>

<script>
    export default {
        name: 'MFooterPrint',
        props: {
            address: {
                type: String,
                default: '<p>Melaleuca Inc.<br />4609 West 65th South,<br />Idaho Falls, ID 83402</p>'
            },
            contact: {
                type: String,
                default: '<p>(208) 522-0700 <br />info@melaleuca.com</p>'
            }
        }
    };
</script>
