#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ReactCorsSpaStack } from "../lib/cdk-stacks-stack";

const app = new cdk.App();

const reactCorsSpaStack = new ReactCorsSpaStack(app, "ReactCorsSpaStack", {
  // ... existing props ...
});
