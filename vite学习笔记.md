

#### vite学习笔记

##### 1.目录结构

- index.html 不在public目录下

  ![image-20211006163848213](C:\Users\GodGee\Desktop\vite-gg\image-20211006163848213.png)

- 在index.html文件中，通过module引入，好处是可以通过es的方式进行编写和组织，不需要打包

![](C:\Users\GodGee\Desktop\vite-gg\image-20211006163550727.png)

##### 2.按需引入

- 嵌套引入

  ![image-20211006164804973](C:\Users\GodGee\Desktop\vite-gg\image-20211006164804973.png)

- 地址引入（浏览器只支持相对地址）

![image-20211006163738959](C:\Users\GodGee\Desktop\vite-gg\image-20211006163738959.png)



##### 3.文件解析

- 裸模块地址改变（vue------> /node_modules/.vite/vue.js?v=2411bbac)

- 预打包 （引入的vue变成node_modules下的文件）

  ```
   import { createApp } from '/node_modules/.vite/vue.js?v=2411bbac'
  ```

  

![image-20211006164104116](C:\Users\GodGee\Desktop\vite-gg\image-20211006164104116.png)

- 浏览器无法识别.vue 文件（vite 解析转换成 .js .html .css 浏览器可以识别的文件）

![image-20211006165110023](C:\Users\GodGee\Desktop\vite-gg\image-20211006165110023.png)

##### 4.手写vite

- 裸模块替换

- 解析.vue文件

  ```undefined
        npm i koa -S
        npm i nodemon -g
  ```

```
// node 服务器，处理浏览器加载的各种资源请求
// 1.index.html
// 2.js
// 3.vue

const koa = require('koa')

const app = new koa()
const fs = require('fs')
const path = require('path')

//中间件配置，处理路由
app.use(async ctx => {
    const { url } = ctx
    if (url === '/') {
        ctx.type = 'text/html'
        ctx.body = fs.readFileSync('./index.html', 'utf8')
    } else if  (url.endsWith('.js')) {
        const p = path.join(__dirname,url)
        ctx.type = 'application/javascript'
        ctx.body = fs.readFileSync(p, 'utf8')
    }

})

app.listen(3000, () => {
    console.log('starting……');
})
```

- 浏览器无法解析vue

![image-20211006200315832](C:\Users\GodGee\Desktop\vite-gg\image-20211006200315832.png)

![image-20211006200405802](C:\Users\GodGee\Desktop\vite-gg\image-20211006200405802.png)

- 路径的重写，转换成发送相对路径的请求（官方es6打包）

  

```
import { createApp } from "/@modules/vue";  替换@modules为node_modules 下面的路径
```

![image-20211006200928911](C:\Users\GodGee\Desktop\vite-gg\image-20211006200928911.png)



- SFC请求 （ 读取vue文件，解析成js）

```
  const compilerSFC = require('@vue/compiler-sfc')

  const p = path.join(__dirname, url)

  const ret = compilerSFC.parse(fs.readFileSync(p, 'utf8'))

  console.log(ret);
```

descriptor.script.content  组件配置对象--->改写成js常量--->render()修改来源于descriptor.template.contents

```
  import { createApp, h } from "vue";

  createApp({
      render() {
          return h('div', 'hello vite!') // 模板，常量
      }
  }).mount('#app')
```



```
{
  descriptor: {
    filename: 'anonymous.vue',
    source: '<template>\r\n' +
      '  <div>\r\n' +
      '    {{ title }}\r\n' +
      '  </div>\r\n' +
      '</template>\r\n' +
      '\r\n' +
      '<script>\r\n' +
      'import { reactive, toRefs } from "vue";\r\n' +
      '\r\n' +
      'export default {\r\n' +
      '  setup() {\r\n' +
      '    const state = reactive({\r\n' +
      '      title: "hello vue3",\r\n' +
      '    });\r\n' +
      '\r\n' +
      '    return {\r\n' +
      '      ...toRefs(state),\r\n' +
      '    };\r\n' +
      '  },\r\n' +
      '};\r\n' +
      '</script>\r\n' +
      '\r\n' +
      '<style lang="scss" scoped>\r\n' +
      '</style>',
    template: {
      type: 'template',
      content: '\r\n  <div>\r\n    {{ title }}\r\n  </div>\r\n',
      loc: [Object],
      attrs: {},
      ast: [Object],
      map: [Object]
    },
    script: {
      type: 'script',
      content: '\r\n' +
        'import { reactive, toRefs } from "vue";\r\n' +
        '\r\n' +
        'export default {\r\n' +
        '  setup() {\r\n' +
        '    const state = reactive({\r\n' +
        '      title: "hello vue3",\r\n' +
        '    });\r\n' +
        '\r\n' +
        '    return {\r\n' +
        '      ...toRefs(state),\r\n' +
        '    };\r\n' +
        '  },\r\n' +
        '};\r\n',
      loc: [Object],
      attrs: {},
      map: [Object]
    },
    scriptSetup: null,
    styles: [],
    customBlocks: [],
    cssVars: [],
    slotted: false
  },
  errors: []
}
```

