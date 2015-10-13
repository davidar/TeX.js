function loadCSS(path) {
    // http://feather.elektrum.org/book/src.html
    var scripts = document.getElementsByTagName('script');
    var $0 = scripts[scripts.length-1].src;
    var dir = ($0.indexOf('/') !== -1) ? $0.substring(0, $0.lastIndexOf('/')) : '.';
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = dir + '/' + path;
    document.getElementsByTagName("head")[0].appendChild(link);
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

require(["./MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML"]);

require(["//hypothes.is/embed.js"]);
