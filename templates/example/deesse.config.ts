import { buildConfig } from "deesse";
import { User } from "./collections/user";

export default buildConfig({
  admin: {},
  auth: {},
  collections: [User],
});
