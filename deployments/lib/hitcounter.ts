import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as dynamo from '@aws-cdk/aws-dynamodb'

export interface HitCounterProps {
  downstream: lambda.IFunction;
}

export class HitCounter extends cdk.Construct {
  public readonly handler: lambda.IFunction;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamo.Table(this, 'HitsTable', {
      partitionKey: { name: 'path', type: dynamo.AttributeType.STRING },
      writeCapacity: 1,
      readCapacity: 1,
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: new lambda.AssetCode('./src'),
      handler: 'hitcounter.handler',
      environment: {
        HIT_TABLE: table.tableName,
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
      }
    })

    // grant read/write table to handler
    table.grantReadWriteData(this.handler);

    // grant invoke downstream lambda to handler
    props.downstream.grantInvoke(this.handler);
  }
}
