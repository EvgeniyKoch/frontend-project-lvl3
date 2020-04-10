develop:
	npx webpack-dev-server

install:
	yarn install

build:
	rm -rf dist
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .
