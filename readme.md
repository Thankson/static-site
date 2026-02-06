eg:
cd fe-library/magazines/
npx webpack --mode=production --env mockserver --env production --env cimode=deploy
cp fe-library/magazines/public static-site/magazines
visit https://thankson.github.io/static-site/magazines/public/index.html

if productstore
1. 修改 fe-library\productstore\source\_meta\_foot.mustache ， 添加如下：   【注意如下 productstore-2 为工程目录 】
<script src="/static-site/productstore-2/public/js/runtime.js?{{cacheBuster}}"></script>
<script src="/static-site/productstore-2/public/js/vue-main.js?{{cacheBuster}}"></script>
<script src="/static-site/productstore-2/public/js/vendor.js?{{cacheBuster}}"></script>
<script src="/static-site/productstore-2/public/js/index.js?{{cacheBuster}}"></script>
2. 执行 npx webpack --mode=production --env mockserver --env production --env cimode=deploy   （OR： npm run build:mockserver）
3. cp fe-library/productstore/public static-site/productstore-2
4. visit: https://thankson.github.io/static-site/productstore-2/public/index.html


https://thankson.github.io/static-site/public/patterns/pages-form-ibo-form-ibo/pages-form-ibo-form-ibo.rendered.html

https://thankson.github.io/static-site/public/index.html