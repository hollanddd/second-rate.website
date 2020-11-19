#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SecondRateWebsiteStack } from '../lib/second-rate-website-stack';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}

const app = new cdk.App();
new SecondRateWebsiteStack(app, 'SecondRateWebsiteStack', { env })

