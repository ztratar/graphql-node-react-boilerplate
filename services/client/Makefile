PATH := node_modules/.bin:../../node_modules/.bin:$(PATH)
SHELL := /bin/bash

DOCKER_REPO := client
RELEASE_SHA=$(shell git rev-parse HEAD)

.FORCE:

all: clean .FORCE

production: all

clean:
	concurrently \
		"rimraf dist" \
		"rimraf .git"

clean-dependencies:
	rimraf node_modules

test: .FORCE
	mocha

lint: .FORCE
	concurrently "eslint src" "eslint test" "eslint config"

dependencies: .FORCE
	yarn

start-server-after-compile: .FORCE
	just-wait --pattern 'dist/*.js' --timeout 180
	node dist/server

watch-server: .FORCE
	webpack --watch --verbose --colors --display-error-details --config config/webpack/server-dev.babel.js

watch-client: .FORCE
	webpack-dev-server --colors --bail --config config/webpack/client-dev.babel.js

watch: .FORCE
	concurrently --kill-others "make start-server-after-compile" "make watch-server" "make watch-client"

package: .FORCE
	docker build -t $(CLIENT_DOCKER_REPO):$(CIRCLE_SHA1) .

configure: .FORCE
	direnv allow

environment: .FORCE

seed: .FORCE
