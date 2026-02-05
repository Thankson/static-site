import 'jquery'; // Comment out if JQuery is not required
import 'jquery-validation';
import 'slick-carousel';

// Common Modules
import './../../../_common/source/js/module-imports';

// Site Specific Modules
import './build/module-imports.js';

/******************************************
    // Better jQuery = https://learn.jquery.com/code-organization/beware-anonymous-functions/
    var APP = {
        onReady: function() {
            console.log('ready!');
        },
    };

    $(function() {
        APP.onReady;
    });
*******************************************/

console.log(
    '%c -- loaded INIT PRODUCTSTORE -- ',
    'background-color:#3d9a4f; color:white; border-radius: 2px;'
);
