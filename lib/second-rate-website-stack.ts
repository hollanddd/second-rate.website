import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';

import {
  Bucket,
  BlockPublicAccess,
} from '@aws-cdk/aws-s3';

import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  ViewerCertificate,
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

    const cert = new acm.DnsValidatedCertificate(this, 'AwsManagedCertificate', {
      domainName,
      hostedZone
    })

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
      sources: [s3Deployment.Source.asset('./website/dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });
  }
}
