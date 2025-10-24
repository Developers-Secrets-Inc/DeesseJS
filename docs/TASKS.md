

- Add auth support 
- Complete Context type for db functions 
  - Add `ctx.db` as an alias for `payload({config})` 
- Look for `api` style support like `api.tasks.create({name: "Some task"})` 
- Add revalidate for mutations 
- Add native hooks for query and mutations like Convex for instant client revalidation 
- Add global events support 
- Add basic CLI features
  - Ask for project name, init payload key in .env
  - Ask if they want shadcn or not 
- Add basic plugin support 
  - Check if we need a registry