all: main.css load.js

%.css: %.orig.css
	cleancss $< > $@

load.js: main.js
	standard $<
	r.js -o baseUrl=. paths.requirejs=node_modules/requirejs/require \
		name=main include=requirejs out=$@
