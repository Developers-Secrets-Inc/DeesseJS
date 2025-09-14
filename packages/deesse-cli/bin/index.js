#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("deesse-cli")
  .description("CLI for DeesseJS framework")
  .version("0.0.1");

program
  .command("add <name>")
  .description("Add a new name")
  .action((name) => {
    console.log(name);
  });

program.parse(process.argv);
