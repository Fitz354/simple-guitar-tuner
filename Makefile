test:
	npm test

watch:
	npm test -- --watch

start:
	npm start

build:
	npm run build

start-prod:
	rm -rf dist
	npm run build
	npm run server
