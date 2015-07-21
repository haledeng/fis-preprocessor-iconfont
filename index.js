/*
 * fis
 * http://fis.baidu.com/
 */
'use strict';

var fs = require('fs'),
    path = require('path'),
    fontCarrier = require('font-carrier');


var svgCnt = 0;


/*
* generate font files
*/
function genarateFonts(files, output, svgPath){
    var font = fontCarrier.create();
    var svgsObj = {},
        iconNames = [],
        iconContents = [],
        iconContent;
    files.forEach(function(file, index){
        if(path.extname(file) == '.svg'){
            iconContent = generateIconContent(svgCnt++);
            iconNames.push(path.basename(file, '.svg'));
            iconContents.push(iconContent);
            svgsObj[iconContent] = fs.readFileSync(path.join(svgPath, file)).toString();
        }
    });

    font.setSvg(svgsObj);

    if(!fs.existsSync(path.dirname(output))){
        fs.mkdirSync(output);
    }
    // 导出字体
    var content = font.output({
        path: output
    });

    return {
        iconContents: iconContents,
        fontContent: content,
        iconNames: iconNames
    }
}


// 十进制 转 16进制
function decimal2Hex(n){
    var hex = n.toString(16);
    hex = '000'.substr(0, 3 - hex.length) + hex;
    return hex;
}

// 生成 icon 对应的 content
function generateIconContent(n){
    return '&#xf' + decimal2Hex(n);
}

// 生成 icon 样式
function generateCss(iconNames, iconContents, path){
    var content = [];
    // 字体的引用和每个css的引入路径有关系
    content.push('@font-face { ');
    // content.push('font-family: "platfont";src: url("./fonts/platfont.eot");');
    content.push('font-family: "platfont";')
    //content.push('src: url("./fonts/platfont.eot?#iefix") format("embedded-opentype"),');
    //content.push('url("./fonts/platfont.woff") format("woff"),');
    content.push('src: url("{{$path}}") format("truetype");}');
    //content.push('url("./fonts/platfont.svg#platfont") format("svg");}');
    content.push('.icon-font{font-family:"platfont";font-size:40px;font-style:normal;}');
    iconNames.forEach(function(iconName, index){
        iconContents[index] = iconContents[index].replace('&#xf', '\\f');
        // content.push('%i-' + iconName + '{\r\n\t&:after{\r\n\t\tcontent:"' + iconContents[index] + '";\r\n\t}\r\n}');
        content.push('.i-' + iconName + ':after{content: "' + iconContents[index] + '";}');
    });
    // fs.writeFileSync(path.css, content.join('\r\n'));

    return content.join('\r\n');
}

// 生成 demo 页面
function generateDemo(){
    var content = [];
    content.push('<!DOCTYPE html>\r\n<html lang="en">\r\n<head>\r\n<meta charset="UTF-8">\r\n<title>iconfont demo</title>');
    content.push('<link href="platfont.css" rel="stylesheet" type="text/css" /> ');
    content.push('</head>\r\n<body>')

    iconNames.forEach(function(iconName, index){
        content.push('<i class="icon-font i-' + iconName + '"></i>');
    });
    content.push('</body>\r\n</html>')

    fs.writeFileSync('demo.html', content.join('\r\n'));

}


/*
*   1. 暂时先用粗暴的方式，读取svg 目录先所有的 svg 文件，生成 font 和css 
*   2. 在 common css中引入 iconfont 对于那个的 css， 每个文件加载了所有的 icon
*   =============================== 终极方案 ===================================
*   1. 分析 html 和 tpl 中对应的 icon，生成 font 和 css，
*   2. 解决字体的引入和 css 引入的问题，按需引入
*   3. 记录依赖关系，postPackager再处理
*/
module.exports = function(content, file, settings){
/*    console.log(settings);
    console.log(file.toString())*/
    var projectPath = fis.project.getProjectPath(),
        svgPath = path.join(projectPath, settings.svgPath),
        fontOutPath = path.join(projectPath, settings.fontOutPath),
        files = fs.readdirSync(svgPath);

    // 产出字体
    var result = genarateFonts(files, fontOutPath, svgPath);
    // 产出css
    var css = generateCss(result.iconNames, result.iconContents, {
            svg: fontOutPath,
            css: path.join(projectPath, settings.cssOutPath)
        });

    var cssPath = file.toString();
    // path.relative 
    content += css.replace('{{$path}}', path.relative(path.dirname(cssPath), fontOutPath + '.ttf').replace(/\\/g, '\/'))
    return content;
};