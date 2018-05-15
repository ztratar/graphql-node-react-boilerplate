PATH := node_modules/.bin:$(PATH)
SHELL := /bin/bash

UNAME_S := $(shell uname -s)

ifeq ($(UNAME_S),Linux)
    OS_TYPE := linux
endif
ifeq ($(UNAME_S),Darwin)
    OS_TYPE := osx
endif

.FORCE:

all: clean .FORCE
	concurrently \
		"make -C services/client" \
		"make -C services/graphql"

development: clean .FORCE
	concurrently \
		"make -C services/client development" \
		"make -C services/graphql development"

lint: .FORCE
	concurrently \
		"make -C services/client lint" \
		"make -C services/graphql lint" \
		"eslint common"

clean:
	concurrently \
		"make -C services/client clean" \
		"make -C services/graphql clean" \
		"rimraf npm-debug.log"

clean-dependencies:
	concurrently \
		"make -C services/client clean-dependencies" \
		"make -C services/graphql clean-dependencies" \
		"rimraf node_modules"

bump-patch:
	npm version patch
	( cd services/client && npm version patch )
	( cd services/graphql && npm version patch)

bump-minor:
	npm version minor
	( cd services/client && npm version minor )
	( cd services/graphql && npm version minor )

bump-major:
	npm version minor
	( cd services/client && npm version minor )
	( cd services/graphql && npm version minor )

reindex:
	concurrently \
		"make -C services/client reindex" \
		"make -C services/graphql reindex"

osx-syspackages: .FORCE
	brew update
	brew install direnv yarn https://raw.githubusercontent.com/winebarrel/homebrew-docker-credential-ecr-login/master/docker-credential-ecr-login.rb
	brew link --overwrite direnv
	curl -sL https://sentry.io/get-cli/ | bash
	sentry-cli login

linux-syspackages: .FORCE
	sudo apt-key adv --keyserver pgp.mit.edu --recv D101F7899D41F3C3
	echo "deb http://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
	sudo apt-get -y update
	sudo apt-get install yarn direnv
	sudo pip install docker-cloud
	curl -sL https://sentry.io/get-cli/ | bash
	sentry-cli login

environment: .FORCE
	@if [ "${OS_TYPE}" = "osx" ]; then \
		make osx-syspackages; \
	else \
		make linux-syspackages; \
	fi
	make dependencies
	concurrently \
		"yarn global add node-static" \
		"make -C services/client environment" \
		"make -C services/graphql environment"

configure: .FORCE
	concurrently \
		"make -C services/client configure" \
		"make -C services/graphql configure" \
		"direnv allow"

dependencies: .FORCE
	yarn
	concurrently \
		"make -C services/client dependencies" \
		"make -C services/graphql dependencies"

containers-up: .FORCE
	docker-compose up -d --remove-orphans

containers-down: .FORCE
	docker-compose stop

containers-rm: .FORCE
	docker-compose rm -f

seed: .FORCE
	concurrently \
		"make -C services/graphql seed"

seed-development: .FORCE
	concurrently \
		"make -C services/graphql seed-development"

test: .FORCE
	make containers-down
	docker-compose -f docker-compose.test.yml up -d
	sleep 5
	concurrently \
		"make -C services/client test" \
		"make -C services/graphql test "
	docker-compose -f docker-compose.test.yml stop
	docker-compose -f docker-compose.test.yml rm -f

test-e2e: .FORCE
	docker-compose -f docker-compose.e2e.yml up -d
	sleep 10
	nightwatch -c config/nightwatch/config.js

package: .FORCE
	concurrently \
		"make -C services/client package" \
		"make -C services/graphql package"

watch: clean .FORCE
	concurrently \
		"make -C services/client watch" \
		"make -C services/graphql watch"

postgres: .FORCE
	docker run -it --rm --link stack-postgres:postgres postgres psql -h postgres -U ${POSTGRES_USER} -d ${POSTGRES_DB}

redis: .FORCE
	redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT}

static-assets-server: .FORCE
	static --gzip --port ${STATIC_PORT} -H '{"Access-Control-Allow-Origin": "*"}' services/client/dist

migrate: .FORCE
	concurrently \
		"make -C services/graphql migrate"

migrate-undo:
	concurrently \
		"make -C services/graphql migrate-undo"

migrate-development: .FORCE
	concurrently \
		"make -C services/graphql migrate-development"

migrate-undo-development: .FORCE
	concurrently \
		"make -C services/graphql migrate-undo-development"

migrate-production: .FORCE
	concurrently \
		"make -C services/graphql migrate-production"

migrate-undo-production: .FORCE
	concurrently \
		"make -C services/graphql migrate-undo-production"

deploy-production: all
	concurrently \
		"make -C services/graphql heroku-production" \
		"make -C services/client heroku-production"

deploy-development: development
	concurrently \
		"make -C services/graphql heroku-development" \
		"make -C services/client heroku-development"

test-dev:
	concurrently \
		"make -C services/graphql test-dev" \
		"make -C services/client test-dev"
