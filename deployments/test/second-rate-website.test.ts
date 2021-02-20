import '@aws-cdk/assert/jest';
import * as cdk from '@aws-cdk/core';
import * as SecondRateWebsite from '../lib/second-rate-website-stack';
import { CfnCloudFrontOriginAccessIdentity } from '@aws-cdk/aws-cloudfront'

test('Stack creates origin access identity', () => {
    const stack = createStack();
    expect(stack).toHaveResource('AWS::CloudFront::CloudFrontOriginAccessIdentity');
});

test('Stack creates distribution', () => {
  const stack = createStack();

  expect(stack).toHaveResourceLike('AWS::CloudFront::Distribution', {
    "DistributionConfig": {
      "Enabled": true,
    }
  })
})

test('Stack configures origin', () => {
  const stack = createStack();
  const origin = getOriginAccessIdentityFromStack(stack)

  expect(stack).toHaveResourceLike('AWS::CloudFront::Distribution', {
    "DistributionConfig": {
      "Origins": [{
        "S3OriginConfig": {
          "OriginAccessIdentity": {
            "Fn::Join": [
              "",
              [
                "origin-access-identity/cloudfront/",
                {"Ref": stack.getLogicalId(origin) },
              ],
            ]
          }
        }
      }]
    }
  })
})

test('Stack creates private website bucket', () => {
    const stack = createStack();
    expect(stack).toHaveResource('AWS::S3::Bucket', {
      "PublicAccessBlockConfiguration": {
        "BlockPublicAcls": true,
        "BlockPublicPolicy": true,
        "IgnorePublicAcls": true,
        "RestrictPublicBuckets": true,
      },
    });
});

//TODO: make better assertions around iam policy document
test('Website bucket policy allows access to origin access identity', () => {
  const stack = createStack();
  expect(stack).toHaveResource('AWS::S3::BucketPolicy', {
  });
})

// TEST HELPERS
const app : cdk.App = new cdk.App()
let stack : cdk.Stack

// createStack is a helper for creating a new stack for testing. This helper
// caches the results of the stack for subsequent tests. I'm not sure that's
// even worth doing
function createStack() : cdk.Stack {
  if (!stack) {
    stack = new SecondRateWebsite.SecondRateWebsiteStack(app, 'TestStack')
  }
  return stack
}

// getNodeFromStack returns a construct node with the provided name
function getNodeFromStack(stack: cdk.Stack, name: string): cdk.ConstructNode {
  return stack.node.findChild(name).node
}

// castNode is a generic helper for casting construct nodes to types
function castNode<T>(node: cdk.ConstructNode): T {
  return node.defaultChild as unknown as T
}

// getOriginAccessIdentityFromStack returns a stacks origin access identity as a
// cloud formation construct. This is used in tests to validate references to
// realated resources
function getOriginAccessIdentityFromStack(stack: cdk.Stack): CfnCloudFrontOriginAccessIdentity {
  let node = getNodeFromStack(stack, "OriginAccessIdentity")
  return castNode<CfnCloudFrontOriginAccessIdentity>(node)
}
