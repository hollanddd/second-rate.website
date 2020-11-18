#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SecondRateWebsiteStack } from '../lib/second-rate-website-stack';

const app = new cdk.App();
new SecondRateWebsiteStack(app, 'SecondRateWebsiteStack');
