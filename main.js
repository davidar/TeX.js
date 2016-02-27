function loadCSS(path) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = path;
    document.getElementsByTagName("head")[0].appendChild(link);
}

function wrapBodyWithDiv(className) { // http://stackoverflow.com/a/1577863
    var div = document.createElement("div");
    div.setAttribute("class", className);
    while(document.body.children.length > 0) {
        var child = document.body.firstChild;
        div.appendChild(child);
    }
    document.body.appendChild(div);
}

function currentDate() {
    var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    var date = new Date();
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}

function TeXify(baseURL) {
    loadCSS(baseURL + "main.css");
    wrapBodyWithDiv("TeXpage");
    var date = document.getElementById("date");
    if(date && date.classList.contains("today"))
        date.innerHTML = currentDate();

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

    require(["//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_SVG"], function() {
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
        loading.innerHTML = '<div id="loading-icon"><object type="image/svg+xml" data="' + baseURL + 'animated-logo.svg"></object></div>';
        document.body.appendChild(loading);
        document.body.style.display = "block";
    })(document.createElement("div"));
}

require(['domReady', 'require'], function(domReady, _require) {
    domReady(function() {
        var baseURL = _require.toUrl('./');
        if(window.readability) {
            require([_require.toUrl("./readability/Readability.js")], function() {
                var location = document.location;
                var uri = {
                    spec: location.href,
                    host: location.host,
                    prePath: location.protocol + "//" + location.host,
                    scheme: location.protocol.substr(0, location.protocol.indexOf(":")),
                    pathBase: location.protocol + "//" + location.host + location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)
                };
                var article = new Readability(uri, document).parse();
                document.head.innerHTML = '<title>' + article.title + '</title>';
                document.body.innerHTML = '<h1>' + article.title + '</h1>' + article.content;
                TeXify(baseURL);
            });
        } else {
            TeXify(baseURL);
        }
    });
});
