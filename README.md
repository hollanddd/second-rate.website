# Second Rate Website

A breakable toy for experimenting with React and AWS CDK

This isn't designed for use by others but could be deployed in several steps:

- build cloud resource
  - `cd deployments && npm install && npm run build`
  - this step might complain if you are missing `website/build`

- deploy with CloudFormation parameters
  - `cdk deploy StackName --parameters DomainName=something.com`

- provision certificate
  - this takes some time for AWS to perform DNS validation

- create `.env` in the website directory with API endpoint provided in the output

- build the website with `npm run build`

- run `cdk deploy` again to deploy the contents of the build directory

## TODO

- use actions for website deployments
- use [pipelines](https://github.com/aws/aws-cdk-rfcs/blob/master/text/0049-continuous-delivery.md) for deployments
