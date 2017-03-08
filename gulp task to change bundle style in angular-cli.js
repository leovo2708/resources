// change bundle style, ex: polyfills.45c62abcc3269ddf85d6.bundle.js -> polyfills.bundle.js?45c62abcc3269ddf85d6

// grab our gulp packages
let gulp = require('gulp'),
    gutil = require('gulp-util'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    ejs = require('ejs');

let encoding = 'utf8';

function transform() {
    changeFileNames();
    let options = readOptions();
    let template = fs.readFileSync('./src/index.ejs', encoding);
    let output = ejs.render(template, options);
    fs.writeFileSync('./dist/index.cshtml', output, encoding);
}

function changeFileNames() {
    let fileNames = fs.readdirSync('./dist');
    let files = {
        css: [],
        js: []
    };

    fileNames.forEach(fileName => {
        let isCss = fileName.endsWith('.css');
        let isJs = fileName.endsWith('.js');
        if (isCss || isJs) {
            let words = fileName.split('.');
            let bundle = words[1];
            let newFileName = fileName.replace('.' + bundle, '');
            let oldPath = './dist/' + fileName;
            let newPath = './dist/' + newFileName;
            fs.renameSync(oldPath, newPath);
        }
    });

    return files;
}

function readOptions() {
    let content = fs.readFileSync('./dist/index.html', encoding);
    let $ = cheerio.load(content);
    let files = {
        js: [],
        css: []
    };

    let styleElements = $('link');
    styleElements.map((index, element) => {
        let css = changeBundle($(element).attr('href'));
        files.css.push(css);
    });

    let scriptElements = $('script');
    scriptElements.map((index, element) => {
        let js = changeBundle($(element).attr('src'));
        files.js.push(js);
    });

    let title = $('title').text();

    let options = {
        title: title,
        files: files
    };
    return options;
}

function changeBundle(fileName) {
    let words = fileName.split('.');
    let bundle = words[1];
    let newFileName = fileName.replace('.' + bundle, '');
    let newBundleName = newFileName + '?' + bundle;
    return newBundleName;
}

// create a default task and just log a message
gulp.task('default', () => {
    gutil.log('Transform started');
    transform();
    gutil.log('Transform completed');
});
