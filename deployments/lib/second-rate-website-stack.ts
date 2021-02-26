import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import { CloudFrontTarget, ApiGatewayDomain } from '@aws-cdk/aws-route53-targets';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import { HitCounter } from './hitcounter';

import {
  Bucket,
  BlockPublicAccess,
} from '@aws-cdk/aws-s3';

import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
} from '@aws-cdk/aws-cloudfront';

export class SecondRateWebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domain = new cdk.CfnParameter(this, 'DomainName', {
      type: 'String',
      description: 'Domain name',
    })

    const zoneId = new cdk.CfnParameter(this, 'HostedZoneId', {
      type: 'String',
      description: 'Hosted Zone Id'
    })

    const domainName = domain.valueAsString
    const hostedZoneId = zoneId.valueAsString

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId,
      zoneName: domainName
    })

    const subjectAlternativeNames = [`*.${domainName}`];
    const cert = new acm.DnsValidatedCertificate(this, 'AwsManagedCertificate', {
      domainName,
      hostedZone,
      subjectAlternativeNames,
    });

    const bucket = new Bucket(this, 'StaticSiteBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity', {
      comment: `OAI for ${domainName} website`
    });

    bucket.grantRead(originAccessIdentity);

    const distribution = new CloudFrontWebDistribution(this, 'WebDistribution', {
      errorConfigurations: [{
        errorCode: 404,
        responseCode: 200,
        responsePagePath: '/index.html'
      }],
      viewerCertificate: {
        aliases: [domainName],
        props: {
          acmCertificateArn: cert.certificateArn,
          sslSupportMethod: 'sni-only',
        },
      },
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity,
          },
          behaviors: [{isDefaultBehavior: true}]
        }
      ]
    });

    new route53.ARecord(this, 'WebAliasRecord', {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    new s3Deployment.BucketDeployment(this, 'WebDeployment', {
      sources: [s3Deployment.Source.asset('../website/build')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // API Gateway & Lambda function configuration
    const counter = new HitCounter(this, 'HitCounter', {
      origin: `https://${domainName}`,
      downstream: new lambda.Function(this, 'CountHandler', {
        runtime: lambda.Runtime.NODEJS_12_X,
        code: new lambda.AssetCode('./src'),
        handler: 'count.handler',
      }),
    });

    const hits = new apigw.LambdaRestApi(this, 'SecondRateAPI', {
      handler: counter.handler
    });

    // Configure hits API on subdomain
    const hitsDomain = `hits.${domainName}`;
    const hitsDomainName = hits.addDomainName('HitsAPIDomainName', {
      certificate: cert,
      domainName: hitsDomain,
      endpointType: apigw.EndpointType.EDGE,
    })

    new route53.ARecord(this, 'HitsAliasRecord', {
      zone: hostedZone,
      recordName: 'hits',
      target: route53.RecordTarget.fromAlias(new ApiGatewayDomain(hitsDomainName))
    });
  }
}
