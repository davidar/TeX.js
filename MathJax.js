define({
    config: function(cfg) {
        // http://feather.elektrum.org/book/src.html
        var scripts = document.getElementsByTagName('script');
        var $0 = scripts[scripts.length-1].src;
        var dir = ($0.indexOf('/') !== -1) ? $0.substring(0, $0.lastIndexOf('/')) : '.';
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src  = dir + "/MathJax/MathJax.js?config=" + cfg;
        document.getElementsByTagName("head")[0].appendChild(script);
    }
});