PATH := node_modules/.bin:../../node_modules/.bin:$(PATH)
SHELL := /bin/bash

DOCKER_REPO := graphql
RELEASE_SHA=$(shell git rev-parse HEAD)

.FORCE:

all: clean .FORCE
	webpack --colors --display-error-details --config config/webpack/server.babel.js

development: all

production: all

clean:
	concurrently \
		"rimraf dist" \
		"rimraf .git"

clean-dependencies:
	rimraf node_modules

test: .FORCE
	DEBUG=graphql_test:* mocha

lint: .FORCE
	concurrently "eslint src" "eslint test" "eslint config"

dependencies: .FORCE
	yarn

start-server: .FORCE
	just-wait --pattern 'dist/*.js' --timeout 60
	node dist/index

watch: .FORCE
	concurrently \
		"webpack --watch --verbose --colors --display-error-details --config config/webpack/server-dev.babel.js" \
		"make start-server"

package: .FORCE
	docker build -t $(GRAPHQL_DOCKER_REPO):$(CIRCLE_SHA1) .

configure: .FORCE
	direnv allow

environment: .FORCE

reindex: .FORCE
	./scripts/reindexAll

migrate: .FORCE
	NODE_ENV=development sequelize db:migrate

migrate-undo: .FORCE
	NODE_ENV=development sequelize db:migrate:undo

migrate-development: .FORCE
	NODE_ENV=staging sequelize db:migrate

migrate-undo-development:
	NODE_ENV=staging sequelize db:migrate:undo

migrate-production: .FORCE
	NODE_ENV=production sequelize db:migrate

migrate-undo-production:
	NODE_ENV=production sequelize db:migrate:undo
