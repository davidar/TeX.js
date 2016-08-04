function loadCSS (path) {
  var link = document.createElement('link')
  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.href = path
  document.getElementsByTagName('head')[0].appendChild(link)
}

function currentDate () {
  var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
  var date = new Date()
  return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear()
}

function escapeHtml (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function mapTextNodes (parent, cb) { // http://stackoverflow.com/a/10730777/78204
  var tag = parent.nodeName.toLowerCase()
  if (tag === 'script' || tag === 'pre' || tag === 'code') {
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
    'class', 'main' // + " grid"
  )
  document.body.appendChild(page)

  var date = document.getElementById('date')
  if (date && date.classList.contains('today')) {
    date.innerHTML = currentDate()
  }

  var refNodes = document.getElementsByClassName('ltx_bibblock')
  var xhr = new XMLHttpRequest()
  xhr.open('POST', 'https://search.crossref.org/links', true)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.onload = function () {
    var results = JSON.parse(this.responseText).results
    for (var i = 0; i < results.length; i++) {
      var result = results[i]
      var refNode = refNodes[i]
      if (result.match) {
        var doi = result.doi.replace('http://dx.doi.org/', '')
        var html = refNode.innerHTML
        refNode.innerHTML = '<a href="http://doai.io/' + doi + '">' + html + '</a>'
      }
    }
  }
  var refTexts = []
  for (var i = 0; i < refNodes.length; i++) {
    refTexts.push(refNodes[i].textContent)
  }
  if (refTexts.length > 0) {
    xhr.send(JSON.stringify(refTexts))
  }

  mapTextNodes(document.body, function (text) {
    return text
      .replace(/\b([A-Z][A-Z0-9]{2,})(s?)\b/g, '<abbr>$1</abbr>$2')
      .replace(/\b([0-9]+) ([a-zA-Z]{2,})\b/g, '$1&nbsp;$2')
      .replace(/(\\\((?:(?!\\\))[\s\S])+\\\))/g,
        '<span class="math donthyphenate">$1</span>')
      .replace(/(\\\[(?:(?!\\\])[\s\S])+\\\])/g,
        '<div  class="math donthyphenate">$1</div>')
      .replace(/ffi/g, '&#xFB03;').replace(/ffl/g, '&#xFB04;')
      .replace(/ff/g, '&#xFB00;').replace(/fi/g, '&#xFB01;').replace(/fl/g, '&#xFB02;')
      .replace(/ae/g, '&aelig;').replace(/A[Ee]/g, '&AElig;')
  })

  var lineHeight = document.getElementsByTagName('footer')[0].offsetHeight
  require(['baseline/baseline'], function () {
    baseline('img', lineHeight)
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
    'MathJax.Hub.Config({ SVG: { linebreaks: { automatic: true, width: "75%" } } });'
  document.head.appendChild(mathjaxConfig)

  require(['//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_SVG',
           'baseline/baseline'], function () {
    MathJax.Hub.Register.StartupHook('End', function () {
      setTimeout(function () {
        baseline('.MathJax_SVG_Display', lineHeight)
        window.onresize()
      }, 1000)
    })
  })

  require(['//hypothes.is/embed.js'])

  require(['scrollProgress/dist/scrollProgress'], function (scrollProgress) {
    scrollProgress.set({ color: '#84141e' })
  })

  require(['string.js/lib/string', 'contents/dist/browser/contents'], function (S) {
    var nav = document.createElement('nav')
    var title = document.getElementsByTagName('h1')[0].innerHTML
    var subtitle = document.querySelector('header>p')
    if (subtitle) {
      title += ':&#8194;<em>' + subtitle.innerHTML + '</em>'
    }
    nav.setAttribute('id', 'toc')
    nav.innerHTML = '<p>' + title + '</p>'
    document.body.appendChild(nav)

    var contents = new gajus.Contents({
      articles: document.querySelectorAll('h2,h3,h4,h5,h6'),
      articleId: function (articleName, element) {
        return element.id || S(articleName).slugify().s
      }
    })
    nav.appendChild(contents.list())

    var openTOC = document.createElement('div')
    openTOC.setAttribute('id', 'open-toc')
    openTOC.innerHTML = '<a href="#toc" class="open-menu">&#x2630;</a>'
    document.body.appendChild(openTOC)
  })

  require(['highlight.min', 'baseline/baseline'], function (hljs) {
    var codes = document.querySelectorAll('pre code')
    for (var i = 0; i < codes.length; i++) {
      hljs.highlightBlock(codes[i])
    }
    baseline('pre code', lineHeight)
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
      loadCSS('//texify.davidar.io/main.css')
    }
    TeXify()
  })
})
