#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("deesse")
  .description("CLI for DeesseJS framework")
  .version("0.0.1");

program.parse(process.argv);
