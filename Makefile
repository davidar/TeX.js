ASSETS := \
	public/main.css \
	public/LaTeXML/ltx-article.css \
	public/LaTeXML/ltx-book.css \
	public/load.js

all: $(ASSETS)

clean:
	rm -f $(ASSETS)

public/%.css: %.css main.css
	cleancss $< > $@

public/load.js: main.js
	standard $<
	r.js -o baseUrl=. paths.requirejs=node_modules/requirejs/require \
		generateSourceMaps=true preserveLicenseComments=false \
		name=main include=requirejs out=$@
