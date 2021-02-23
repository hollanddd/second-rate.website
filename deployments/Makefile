cleannode:
	rm -rf node_modules package-lock.json

killcache:
	npm cache clean -f

install:
	npm install
deploy:
	cdk deploy --profile muh-cloud

fixnpm: cleannode killcache install
