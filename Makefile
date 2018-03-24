test:
	npm test

lint:
	npm run eslint

watch:
	npm test -- --watch

start:
	npm start

build:
	npm run build

start-prod:
	npm run build
	npm run server

deploy:
	git push heroku master
	heroku ps:scale web=1
	heroku open