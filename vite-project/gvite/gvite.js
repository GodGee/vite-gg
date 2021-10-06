// node 服务器，处理浏览器加载的各种资源请求
// 1.index.html
// 2.js
// 3.vue

const koa = require('koa')

const app = new koa()
const fs = require('fs')
const path = require('path')
const compilerSFC = require('@vue/compiler-sfc')
const complierDom = require('@vue/compiler-dom')

//中间件配置，处理路由
app.use(async ctx => {
    const { url, query } = ctx
    if (url === '/') {
        ctx.type = 'text/html'
        ctx.body = fs.readFileSync(path.join(__dirname, './index.html'), 'utf8')
    } else if (url.endsWith('.js')) {
        const p = path.join(__dirname, url)
        ctx.type = 'application/javascript'
        ctx.body = rewriteImport(fs.readFileSync(p, 'utf8'))
    } else if (url.startsWith('/@modules/')) {
        // 裸模块名称
        const moduleName = url.replace('/@modules/', "")
        // node_modules 目录中查找
        const prefix = path.join(__dirname, '../node_modules', moduleName)
        // package.json 中获取module字段
        const module = require(prefix + '/package.json').module
        const filePath = path.join(prefix, module)
        const ret = fs.readFileSync(filePath, 'utf8')
        ctx.type = 'application/javascript'
        ctx.body = rewriteImport(ret)
    } else if (url.indexOf('.vue') > -1) {
        // 获取加载文件的路径
        const p = path.join(__dirname, url.split('?')[0])//有可能带查询参数 ?type=template
        const ret = compilerSFC.parse(fs.readFileSync(p, 'utf8'))
        console.log(ret);
        if (!query.type) {
            // SFC请求
            // 读取vue文件，解析成js
            // 获取脚本部分的内容
            const scriptContent = ret.descriptor.script.content
            // 替换默认导出一个常量，方便后续修改
            const script = scriptContent.replace('export default ', 'const __script = ')
            ctx.type = 'application/javascript'
            // 重写路径，防止嵌套的地址导入出问题
            ctx.body = `
                    ${rewriteImport(script)}
                    // 解析tpl 需要另外的编译dom 变成url再发一次请求解析tpl
                    import {render as __render} from '${url}?type=template'
                    __script.render = __render
                    export default __script
        `
        } else if (query.type === 'template') {
            const tpl = ret.descriptor.template.content
            // 编译为render函数
            const render = complierDom.compile(tpl, { mode: 'module' }).code
            console.log('render', render);
            ctx.type = 'application/javascript'
            // 重写路径，防止嵌套的地址导入出问题
            ctx.body = rewriteImport(render)//render 函数
        }

    }

})
// 裸模块地址重写  import xx from 'vue -----> import xx from '/@modules/vue'
function rewriteImport(content) {
    return content.replace(/ from ['"](.*)['"]/g, function (s1, s2) {
        console.log('s1', s1);
        console.log('s2', s2);
        if (s2.startsWith('/') || s2.startsWith('./') || s2.startsWith('../')) {
            return s1;
        } else {
            return ` from '/@modules/${s2}'`
        }
    })
}

app.listen(3000, () => {
    console.log('starting……');
})