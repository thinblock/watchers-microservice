# Watchers-Microservice

ThinBlock's Watchers MicroService is built on NodeJS. It depends on NodeJS server `v8.11.2` and tests are written with `chai` and runner is `mocha`. The database is Redis used for Queuing tasks. We use TypeScript langauge to write strongly typed code which has less chances of breaking and better intellisense support in VS Code.

## Installation
We use `yarn` to install the packages. Do
```
 yarn install
```
in the project's directory. After installing you need to set up environment variables. In Unix based systems you can do:
```
 export TB_WATCHERS_REDIS_DB_STRING="Redis connection string here"
```

> Contact the collaborators to get remote db string and node string.

## Starting Development Server
To start the development server do
```
 yarn start
```
To watch the typescript files you can use `nodemon`, if you don't have `nodemon` installed you can install it via
```
 yarn add nodemon -g
 // now start watching, do this in project's directory
 nodemon
```

## File Structure
```
 - app
	 - tickers
	 	- some_ticker (tickers go here, like eth_usd ticker)
		 	- index.ts (ticker function)
			- queue.ts (its respective queue and process function)
 - config (Config related stuff)
 - scripts (deployment/packaging related stuff)
 - types (When types for certain package doesn't exist, add that package here)
 - utils (Utilities and helpers
 server.ts
 package.json
```
## Adding New Package
When adding new libraries/packages, you should install its types too. If its types don't exist then you should add that package to `types/types.ts`
```
 yarn add some-package @types/some-package
```

## Testing
Every module should be battle tested so that we avoid any bugs. We have CI integrated, whenever introducing new feature. We'll run the tests before merging any stuff. You should make sure all tests pass.
You can run tests by doing
```
 yarn run test
```

It'll run all the tests, if you want to run your specific test. You can do this
```
 describe.only()
 or
 it.only()
```

