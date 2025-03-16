.PHONY: install update clean dev load assets optimize setup

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "setup		set up the original test project"
	@echo "reload		to make a Docker reload"

setup:
	mkdir public
	composer install
	yarn install
	npm run dev
	docker-compose build --no-cache && docker-compose up -d

reload:
	#npm run dev
	sudo chown -R 33:33 .
	docker restart symfony_php

edit:
	sudo chown -R ervin:ervin .

rebuild:
	sudo chown -R ervin:ervin .
	npm run dev
	sudo chown -R 33:33 .
	docker-compose down --volumes && docker-compose build --no-cache && docker-compose up -d
	sudo chown -R 33:33 .
