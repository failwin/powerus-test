## Installation

```bash
$ yarn install
```

## Running the app

```bash
# prepare environment
$ docker-compose up

# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod

# explore REST API
http://localhost:3000/api
```

## Test

```bash
# unit tests
$ yarn test

# test coverage
$ yarn test:cov
```

## Domain model

* **FlightsService** service responsible for flights logic on top level
* **LoaderService** uses for loading flights from appropriate source and normalize it to common structure
* **LoaderFactoryService** helps in creating and configuring appropriate type of **LoaderService**

## Data flow

![Data flow](docs/data-flow.png 'Data flow')