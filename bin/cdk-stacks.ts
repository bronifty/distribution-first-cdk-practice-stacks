#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DistroFirstStack } from "../lib/distro-first-stack";

const app = new cdk.App();

const distroFirstStack = new DistroFirstStack(app, "DistroFirstStack", {
  // ... existing props ...
});
