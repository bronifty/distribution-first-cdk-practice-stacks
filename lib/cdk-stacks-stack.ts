import * as cdk from "aws-cdk-lib";
import * as path from "node:path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../utils";
import { NotesApi } from "../apig/notes-api";

export class ReactCorsSpaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    // API Gateway
    const api = new apigateway.RestApi(this, "SimpleAPI", {
      description: "A simple CORS compliant API",
      endpointTypes: [apigateway.EndpointType.REGIONAL],
    });

    const helloResource = api.root.addResource("hello");
    helloResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(new NotesApi(this, "list").handler)
    );
    // helloResource.addMethod(
    //   "GET",
    //   new apigateway.MockIntegration({
    //     integrationResponses: [
    //       {
    //         statusCode: "200",
    //         responseParameters: {
    //           "method.response.header.Access-Control-Allow-Origin": "'*'",
    //         },
    //         responseTemplates: {
    //           "application/json": '{"message": "Hello World!"}',
    //         },
    //       },
    //     ],
    //     passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
    //     requestTemplates: {
    //       "application/json": '{"statusCode": 200}',
    //     },
    //   }),
    //   {
    //     methodResponses: [
    //       {
    //         statusCode: "200",
    //         responseParameters: {
    //           "method.response.header.Access-Control-Allow-Origin": true,
    //         },
    //       },
    //     ],
    //   }
    // );

    // S3 Buckets
    const loggingBucket = new s3.Bucket(this, "LoggingBucket", {
      bucketName: `react-cors-spa-${suffix}-logs`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
    });

    const appBucket = new s3.Bucket(this, "S3Bucket", {
      bucketName: `react-cors-spa-${suffix}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      serverAccessLogsBucket: loggingBucket,
      serverAccessLogsPrefix: "s3-access-logs",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const deployment = new cdk.aws_s3_deployment.BucketDeployment(
      this,
      "DeployWebsite",
      {
        sources: [
          cdk.aws_s3_deployment.Source.asset(
            path.join(__dirname, "../react-cors-spa/build")
          ),
        ],
        destinationBucket: appBucket,
      }
    );

    // new ConstructThatReadsFromTheBucket(this, 'Consumer', {
    //   // Use 'deployment.deployedBucket' instead of 'websiteBucket' here
    //   bucket: deployment.deployedBucket,
    // });

    // Adding an existing Lambda@Edge function created in a different stack
    // to a CloudFront distribution.

    // const functionVersion = cdk.aws_lambda.Version.fromVersionArn(
    //   this,
    //   "Version",
    //   "arn:aws:lambda:us-east-1:123456789012:function:functionName:1"
    // );

    // new cloudfront.Distribution(this, "distro", {
    //   defaultBehavior: {
    //     origin: new origins.S3Origin(appBucket),
    //     edgeLambdas: [
    //       {
    //         functionVersion,
    //         eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
    //       },
    //     ],
    //   },
    // });

    const distribution = new cloudfront.Distribution(this, "CFDistribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(appBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy:
          cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      },
      defaultRootObject: "index.html",
      enableLogging: true,
      logBucket: loggingBucket,
      logFilePrefix: "cloudfront-access-logs",
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
    });

    distribution.addBehavior("v1/hello", new origins.RestApiOrigin(api), {
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      originRequestPolicy:
        cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
    });

    // S3 Bucket Policy
    appBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject*"],
        resources: [appBucket.arnForObjects("*")],
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    // Outputs
    new cdk.CfnOutput(this, "APIEndpoint", {
      value: api.url + "hello",
    });

    new cdk.CfnOutput(this, "BucketName", {
      value: appBucket.bucketName,
    });

    new cdk.CfnOutput(this, "CFDistributionURL", {
      value: distribution.distributionDomainName,
    });
  }
}

// import * as cdk from "aws-cdk-lib";
// import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// export class CdkStacksStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//   }
// }
