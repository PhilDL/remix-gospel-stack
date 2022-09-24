# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

This Remix app lives inside a Monorepo powered by turborepo, the scripts should be launched
from the root of your Monorepo.

## Development

Start the Remix development asset server and the Express server by running:

```sh
pnpm run dev
```

This starts your app in development mode, which will purge the server require cache when Remix rebuilds assets so you don't need a process manager restarting the express server.

## Deployment

Buil thi App for production:

```sh
pnpm run build --filter=remix-app...
```

Then run the app in production mode:

```sh
pnpm run start --filter=remix-app
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying express applications you should be right at home just make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Using a Template

When you ran `npx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
npx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```
