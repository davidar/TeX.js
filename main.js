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

function wrapBodyWithDiv(className) { // http://stackoverflow.com/a/1577863
    var div = document.createElement("div");
    div.setAttribute("class", className);
    while(document.body.children.length > 1) {
        var child = document.body.firstChild;
        if(child.id === "loading") {
            loading = child;
        } else {
            div.appendChild(child);
        }
    }
    document.body.appendChild(div);
}

function currentDate() {
    var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    var date = new Date();
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}


//loadCSS("main.css");

require(['domReady'], function(domReady) {
    domReady(function() {
        //wrapBodyWithDiv("TeXpage");
        var date = document.getElementById("date");
        if(date && date.classList.contains("today"))
            date.innerHTML = currentDate();
    });
});

require(["Hyphenator/Hyphenator"], function() {
    Hyphenator.config({
        classname:'TeXpage',
        donthyphenateclassname:'math',
        urlclassname:'url',
        defaultlanguage:'en',
        intermediatestate:'visible',
        storagetype:'none'});
    Hyphenator.run();
});

require([dirname($0) + "/MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML"], function() {
    MathJax.Hub.Register.StartupHook("End", function () {
        document.getElementById("loading").className = "done";
        setTimeout(function() {
            document.getElementById("loading").style.display = "none";
        }, 1000);
    });
});

require(["//hypothes.is/embed.js"]);

(function(loading) {
    loading.setAttribute("id", "loading");
    loading.innerHTML = '<div id="loading-icon"><object type="image/svg+xml" data="' + dirname($0) + '/animated-logo.svg"></object></div>';
    document.body.appendChild(loading);
    document.getElementById("TeXpage").style.display = "block";
})(document.createElement("div"));
