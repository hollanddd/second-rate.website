cleannode:
	rm -rf node_modules package-lock.json

killcache:
	npm cache clean -f

install:
	npm install

build:
	npm run build

diff:
	cdk diff --profile muh-cloud

deploy: build
	cdk deploy --profile muh-cloud

fixnpm: cleannode killcache install

synth: build
	cdk synth --profile muh-cloud
