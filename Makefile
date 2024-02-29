path := alhs/feeds/all
grep := ug

server:
	npx wrangler dev

test:
	curl http://127.0.0.1:8787/rss/$(path) | $(grep) -oP "\s+<(title|subtitle|id|updated|name|link href=.https:|content type=.+?>)\K.{0,120}"

install:
	npm install wrangler --save-dev

update:
	npm install wrangler@latest

deploy:
	npx wrangler deploy
