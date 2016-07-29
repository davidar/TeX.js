function loadCSS(path) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = path;
    document.getElementsByTagName("head")[0].appendChild(link);
}

function currentDate() {
    var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    var date = new Date();
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}

function TeXify(baseURL) {
    // http://stackoverflow.com/a/1577863
    var page = document.getElementsByTagName("main")[0];
    if(page === undefined) {
        page = document.createElement("main");
        while(document.body.children.length > 0) {
            var child = document.body.firstChild;
            page.appendChild(child);
        }
    }
    var footer = document.createElement("footer");
    footer.innerHTML = '<p><a href="' + baseURL + '">T<span class="T_e_X">e</span>X.js</a></p>';
    page.appendChild(footer);
    page.setAttribute(
        "class", "main" // + " grid"
    );
    document.body.appendChild(page);

    var date = document.getElementById("date");
    if(date && date.classList.contains("today"))
        date.innerHTML = currentDate();

    var refNodes = document.getElementsByClassName("ltx_bibblock");
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://search.crossref.org/links", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
        var results = JSON.parse(this.responseText).results;
        for(var i = 0; i < results.length; i++) {
            var result = results[i];
            var refNode = refNodes[i];
            if(result.match) {
                var doi = result.doi.replace("http://dx.doi.org/", "");
                var html = refNode.innerHTML;
                refNode.innerHTML = '<a href="http://doai.io/' + doi + '">' + html + '</a>';
            }
        }
    }
    var refTexts = [];
    for(var i = 0; i < refNodes.length; i++)
        refTexts.push(refNodes[i].textContent);
    xhr.send(JSON.stringify(refTexts));

    var html = document.body.innerHTML;
    document.body.innerHTML = html.replace(
        /\b([A-Z][A-Z0-9]{2,})(s?)\b/g, '<abbr>$1</abbr>$2');

    var lineHeight = document.getElementsByTagName("footer")[0].offsetHeight;

    require(["Hyphenator/Hyphenator"], function() {
        Hyphenator.config({
            classname:'main',
            donthyphenateclassname:'math',
            urlclassname:'url',
            defaultlanguage:'en',
            intermediatestate:'visible',
            storagetype:'none'});
        Hyphenator.run();
    });

    var mathjaxConfig = document.createElement("script");
    mathjaxConfig.type = "text/x-mathjax-config";
    mathjaxConfig[(window.opera ? "innerHTML" : "text")] =
        'MathJax.Hub.Config({ SVG: { linebreaks: { automatic: true, width: "75%" } } });';
    document.head.appendChild(mathjaxConfig);

    require(["baseline/baseline"], function() { baseline("img", lineHeight) });

    require([ "//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_SVG"
            , "baseline/baseline"
            ], function() {
        MathJax.Hub.Register.StartupHook("End", function () {
            setTimeout(function() {
                baseline(".MathJax_SVG_Display", lineHeight);
                window.onresize();
            }, 1000);
        });
    });

    require(["//hypothes.is/embed.js"]);
    
    require(["scrollProgress/dist/scrollProgress"], function(scrollProgress) {
        scrollProgress.set({ color: '#84141e' });
    });

    require(["contents/dist/browser/contents"], function() {
        var nav = document.createElement("nav");
        nav.setAttribute("id", "toc");
        document.body.appendChild(nav);

        var contents = new gajus.Contents();
        nav.appendChild(contents.list());

        var openTOC = document.createElement("div");
        openTOC.setAttribute("id", "open-toc");
        openTOC.innerHTML = '<a href="#toc" class="open-menu">&#x2630;</a>';
        document.body.appendChild(openTOC);
    });

    require([ "//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/highlight.min.js"
            , "baseline/baseline"
    ], function(hljs) {
        var codes = document.querySelectorAll("pre code");
        for(var i = 0; i < codes.length; i++)
            hljs.highlightBlock(codes[i]);
        baseline("pre code", lineHeight);
    });
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
                loadCSS(baseURL + "main.css");
                TeXify(baseURL);
            });
        } else {
            TeXify(baseURL);
        }
    });
});
