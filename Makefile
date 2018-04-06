ASSETS := \
	public/MathJax \
	public/main.css \
	public/LaTeXML/ltx-article.css \
	public/LaTeXML/ltx-book.css \
	public/load.js

all: $(ASSETS)

clean:
	rm -rf $(ASSETS)

fonts.min.css: fonts.css
	cleancss --inline remote --format 'breaks:afterRuleEnds=on' $< | sed 's/https://g' > $@

public/MathJax:
	rsync -av --include-from=MathJax.include --exclude-from=MathJax.exclude MathJax/ $@

public/%.css: %.css main.css
	cleancss --source-map --source-map-inline-sources $< -o $@

public/load.js: main.js
	standard $<
	r.js -o baseUrl=. paths.requirejs=node_modules/requirejs/require \
		generateSourceMaps=true preserveLicenseComments=false \
		name=main include=requirejs out=$@
