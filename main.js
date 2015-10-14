var $0 = (function(scripts) {
    // http://feather.elektrum.org/book/src.html
    return scripts[scripts.length-1].src;
})(document.getElementsByTagName('script'));

function dirname(name) {
    if(name.indexOf('/') === -1) return '.';
    return name.substring(0, name.lastIndexOf('/'));
}

function loadCSS(path) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = dirname($0) + '/' + path;
    document.getElementsByTagName("head")[0].appendChild(link);
}

function loadJS(path) {
    // requirejs chokes on querystrings...
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = dirname($0) + '/' + path;
    document.getElementsByTagName("head")[0].appendChild(script);
}

function wrapBodyWithDiv(className) { // http://stackoverflow.com/a/1577863
    var div = document.createElement("div");
    div.setAttribute("class", className);
    while(document.body.firstChild)
        div.appendChild(document.body.firstChild);
    document.body.appendChild(div);
}

function currentDate() {
    var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    var date = new Date();
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}


loadCSS("main.css");
loadJS("MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML");

require(['domReady'], function(domReady) {
    domReady(function() {
        wrapBodyWithDiv("TeXpage");
        var date = document.getElementById("date");
        if(date && date.classList.contains("today"))
            date.innerHTML = currentDate();
    });
});

require(["Hyphenator/Hyphenator"], function() {
    Hyphenator.config({
        classname:'TeXpage',
        donthyphenateclassname:'math',
        defaultlanguage:'en',
        intermediatestate:'visible',
        storagetype:'none'});
    Hyphenator.run();
});

require(["//hypothes.is/embed.js"]);
