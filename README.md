### 安装
```
npm install -g fis-preprocessor-iconfont
```

=== 
### 背景

项目中使用iconfont时，需要先用工具将 SVG 转化成 font 字体文件，同时解决引入的问题，整个流程比较繁琐。

=== 
### 目标
在 html 标签上挂载和 svg 同名（或者有映射关系）的类名，构建解决：
+ SVG 转化 字体文件
+ css 的引入问题
通过上面的方式，可以使`iconfont 的使用对开发透明` 。

===
### 使用方式
fis-conf.js 配置
```
// modules
preprocessor : {
    css : 'iconfont'
}

// settings
preprocessor: {
    'iconfont': {
        svgPath: '../svg', // svg 存放路径
        cssOutPath: 'modules/common', // 字体相关css产出路径
        fontOutPath: 'fonts/iconfont', // 字体产出路径
    }
}
```

