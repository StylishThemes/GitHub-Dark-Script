lint:
	eslint --color --quiet *.js

npm-patch:
	npm version patch

npm-minor:
	npm version minor

npm-major:
	npm version major

patch: lint npm-patch
minor: lint npm-minor
major: lint npm-major

.PHONY: lint patch minor major npm-patch npm-minor npm-major
