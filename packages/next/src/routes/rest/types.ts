import { Config } from "deesse";

export type Endpoint = (config: Config) => (request: Request) => Response;
