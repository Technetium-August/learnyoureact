var express = require('express');
var app = express();

var React = require('react');
var ReactDOMServer = require('react-dom/server');
// var DOM = React.DOM;
var element = React.createElement;

var browserify = require('browserify');
var babelify = require("babelify");

app.set('port', (process.argv[2] || 3000));
app.set('view engine', 'jsx');
app.set('views', __dirname + '/views');
app.engine('jsx', require('express-react-views').createEngine({ transformViews: false }));

require('babel/register')({
    ignore: false
});

var TodoBox = require('./views/index.jsx');

var data = [
    {title: "Shopping", detail: process.argv[3]},
    {title: "Hair cut", detail: process.argv[4]}
];

app.use('/bundle.js',function(req,res){
    res.setHeader('content-type', 'application/javascript');
    
    browserify({ debug: true })
        .transform(babelify.configure({
            presets: ["react", "es2015"],
            compact: false
        }))
        .require("./app.js", { entry: true })
        .bundle()
        .pipe(res);
});

app.use('/', function(req, res) {
    var initialData = JSON.stringify(data);
    var markup = ReactDOMServer.renderToStaticMarkup(React.createElement(TodoBox, {data: data}));

    res.setHeader('Content-Type', 'text/html');

    var html = ReactDOMServer.renderToStaticMarkup(element('body',null,
            element('div',{id: 'app', dangerouslySetInnerHTML: {__html: markup}}),
            element('script',{
        id: 'initial-data',
        type: 'text/plain',
        'data-json': initialData}),
            element('script',{src: '/bundle.js'}))
    );

    res.end(html);
});

app.listen(app.get('port'), function() {});
