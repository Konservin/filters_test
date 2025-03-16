.PHONY: install update clean dev load assets optimize setup

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "reload		to make a Docker reload"

setup:
	#composer install
	#yarn install
	#bin/create_database.sh

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
