# Second Rate Website

A breakable toy for experimenting with React and AWS CDK

## Directory Structure

`deployments`   - AWS CDK TypeScript project resources
`website/build` - default build directory for CDK S3 deployment

## Runtime

- `node12` & `npm`

### Deployments

- `@aws-cdk` - Infrastructure
- `@aws-sdk` - Hit counter update command & Lambda Invoke

### Website

The deployment is designed to sync the contents of `website/build` and expects
to find an index.html that acts as the root of the website. A slightly modified
`create-react-app` is included for displaying the hit count.

## Set Up

_The guide assumes that you have an AWS account and have properly configured
permissions for deploying resources using the AWS CDK._

Install deployment dependencies and build Lambda functions:

`cd deployments && npm install && npm run build`

Install website dependencies and build React application:

`cd websites && npm isntall && npm run build`

## Deploy AWS Resources

```bash
cdk deploy MyStack                      \\
  --parameters DomainName=something.com \\
  --parameters HostedZoneId=somezone    \\
```

Certificate provisioning will take some time to complete. If provisioning fails
the deployment will clean itself up thanks to AWS CDK.

## TODO

- use actions for website deployments
- use [pipelines](https://github.com/aws/aws-cdk-rfcs/blob/master/text/0049-continuous-delivery.md) for deployments
