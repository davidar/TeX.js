function loadCSS (path) {
  var link = document.createElement('link')
  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.href = path
  document.getElementsByTagName('head')[0].appendChild(link)
}

function escapeHtml (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function hasClass (e, cls) {
  if (e.classList === undefined) {
    return false
  }
  return e.classList.contains(cls)
}

function mapTextNodes (parent, cb) { // http://stackoverflow.com/a/10730777/78204
  var tag = parent.nodeName.toLowerCase()
  if (tag === 'script' || tag === 'pre' || tag === 'code' || tag === 'math' ||
      hasClass(parent, 'donthyphenate')) {
    return
  }
  var html = ''
  for (var node = parent.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === 3) {
      html += cb(escapeHtml(node.data))
    } else {
      mapTextNodes(node, cb)
      html += node.outerHTML
    }
  }
  parent.innerHTML = html
}

function TeXify () {
  var i

  // http://stackoverflow.com/a/1577863
  var page = document.getElementsByTagName('main')[0]
  if (page === undefined) {
    page = document.createElement('main')
    while (document.body.children.length > 0) {
      var child = document.body.firstChild
      page.appendChild(child)
    }
  }
  var footer = document.createElement('footer')
  footer.innerHTML = '<p><a href="//texify.davidar.io/">T<span class="T_e_X">e</span>X<em>ify</em></a></p>'
  page.appendChild(footer)
  page.setAttribute(
    'class', 'main' // + ' grid'
  )
  document.body.appendChild(page)

  var nav = document.createElement('nav')
  var title = document.getElementsByTagName('h1')[0].innerHTML
  var subtitle = document.querySelector('header>p')
  if (subtitle) {
    title += ':&ensp;<em>' + subtitle.innerHTML + '</em>'
  }
  nav.setAttribute('id', 'toc')
  nav.innerHTML = '<p>' + title + '</p>'
  document.body.appendChild(nav)

  var refNodes = document.getElementsByClassName('ltx_bibblock')
  var xhr = new XMLHttpRequest()
  xhr.open('POST', 'https://search.crossref.org/links', true)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.onload = function () {
    var results = JSON.parse(this.responseText).results
    for (var i = 0; i < results.length; i++) {
      var result = results[i]
      var refNode = refNodes[i]
      var url
      if (result.match) {
        var doi = result.doi.replace('http://dx.doi.org/', '')
        url = 'http://doai.io/' + doi
      } else {
        var query = encodeURIComponent(refNode.textContent.trim())
        url = 'https://searx.me/?categories=science&q=' + query
      }
      var refEntry = document.createElement('p')
      refEntry.setAttribute('class', 'elide')
      refEntry.innerHTML = refNode.innerHTML =
        '<a href="' + url + '">' + refNode.innerHTML + '</a>'
      document.getElementById('toc').appendChild(refEntry)
    }
  }
  var refTexts = []
  for (i = 0; i < refNodes.length; i++) {
    refTexts.push(refNodes[i].textContent)
  }
  if (refTexts.length > 0) {
    xhr.send(JSON.stringify(refTexts))
  }

  var mathImages = document.querySelectorAll('img.tex, img.latex')
  for (i = 0; i < mathImages.length; i++) {
    var math = mathImages[i].getAttribute('alt')
    mathImages[i].outerHTML = '\\(' + math + '\\)'
  }

  mapTextNodes(document.body, function (text) {
    return text
      .replace(/(\\\((?:(?!\\\))[\s\S])+\\\))/g,
        '<span class="math donthyphenate">$1</span>')
      .replace(/(\\\[(?:(?!\\\])[\s\S])+\\\])/g,
        '<div  class="math donthyphenate">$1</div>')
  })

  mapTextNodes(document.body, function (text) {
    return text.replace(/\b([A-Z][^a-z&]{9,})\b/g,
                        '<span class="caps">$1</span>')
  })

  require(['typogr/typogr'], function (typogr) {
    mapTextNodes(document.body, function (text) {
      return typogr.typogrify(text)
        .replace(/\b([A-Z][A-Z0-9]{2,})(s?)\b/g, '<abbr>$1</abbr>$2')
        .replace(/\b([0-9]+) ([a-zA-Z]{2,})\b/g, '$1&nbsp;$2')
        .replace(/ffi/g, '&#xFB03;').replace(/ffl/g, '&#xFB04;')
        .replace(/ff/g, '&#xFB00;').replace(/fi/g, '&#xFB01;').replace(/fl/g, '&#xFB02;')
        .replace(/ae/g, '&aelig;').replace(/A[Ee]/g, '&AElig;')
    })
  })

  var lineHeight = document.querySelector('main>footer').offsetHeight
  require(['baseline/baseline'], function () {
    baseline('img,table', lineHeight)
  })

  require(['Hyphenator/Hyphenator'], function () {
    Hyphenator.config({
      classname: 'main',
      urlclassname: 'url',
      defaultlanguage: 'en',
      intermediatestate: 'visible',
      storagetype: 'none'
    })
    Hyphenator.run()
  })

  var mathjaxConfig = document.createElement('script')
  mathjaxConfig.type = 'text/x-mathjax-config'
  mathjaxConfig[(window.opera ? 'innerHTML' : 'text')] =
    'MathJax.Hub.Config({"HTML-CSS": {' +
      'availableFonts: [], preferredFont: null, imageFont: null' +
      '}});'
  document.head.appendChild(mathjaxConfig)

  require(['KaTeX/dist/katex.min',
           '//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_HTMLorMML',
           'baseline/baseline'], function (katex) {
    var maths = document.getElementsByClassName('math')
    for (i = 0; i < maths.length; i++) {
      var isBlock = maths[i].nodeName.toLowerCase() === 'div'
      var latex = maths[i].textContent.slice(2, -2)
      try {
        var html = katex.renderToString(latex,
            { displayMode: isBlock, throwOnError: true })
        maths[i].innerHTML = html
      } catch (e) {}
    }
    baseline('.katex-display', lineHeight)

    MathJax.Hub.Register.StartupHook('End', function () {
      setTimeout(function () {
        baseline('.MathJax_SVG_Display', lineHeight)
        window.dispatchEvent(new Event('resize'))
      }, 1000)
    })
  })

  require(['//hypothes.is/embed.js'])

  require(['scrollProgress/dist/scrollProgress'], function (scrollProgress) {
    scrollProgress.set({ color: '#84141e' })
  })

  require(['string.js/lib/string', 'contents/dist/browser/contents'], function (S) {
    var contents = new gajus.Contents({
      articles: document.querySelectorAll('h2,h3,h4,h5,h6'),
      articleId: function (articleName, element) {
        return element.id || S(articleName).slugify().s
      }
    })
    document.getElementById('toc').appendChild(contents.list())

    var openTOC = document.createElement('div')
    openTOC.setAttribute('id', 'open-toc')
    openTOC.innerHTML = '<a href="#toc" class="open-menu"><i class="fa fa-navicon"></i></a>'
    document.body.appendChild(openTOC)
  })

  require(['highlight/build/highlight.min', 'baseline/baseline'], function (hljs) {
    var codes = document.querySelectorAll('pre code')
    for (var i = 0; i < codes.length; i++) {
      hljs.highlightBlock(codes[i])
    }
    baseline('pre code', lineHeight)
  })

  require(['dropcap/dropcap'], function () {
    Dropcap.layout(document.querySelectorAll('span.dropcap'), 3)
  })
}

require(['domReady', 'readability/Readability'], function (domReady) {
  domReady(function () {
    if (window.readability) {
      var location = document.location
      var uri = {
        spec: location.href,
        host: location.host,
        prePath: location.protocol + '//' + location.host,
        scheme: location.protocol.substr(0, location.protocol.indexOf(':')),
        pathBase: location.protocol + '//' + location.host + location.pathname.substr(0, location.pathname.lastIndexOf('/') + 1)
      }
      var article = new Readability(uri, document).parse()
      console.log(article)
      document.head.innerHTML = '<title>' + article.title + '</title>'
      var html = '<header><h1>' + article.title.replace(/ (-|\|) .*/, '') + '</h1>'
      if (article.byline) {
        html += '<address>' + article.byline + '</address>'
      }
      html += '</header><main>' + article.content + '</main>'
      document.body.innerHTML = html
      loadCSS('https://texify.davidar.io/main.css')
    }
    TeXify()
  })
})
