// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  frontendUrl: 'http://localhost:4200',
  socketUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  uploadUrl: 'http://localhost:3000',
  version: '1.2.1',
  vapidPublicKey: 'BEW1FYAEJq1lZ-gCeEyzAZwLHkkutFBHqUzWRBVK-1DjWjJiTDi-gJRaxKadIPVP7xjxQ1pZg43ioxXZC-bddFY'
};
