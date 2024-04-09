# MTAA Backend

## Description

This is the backend of the MTAA project. It is a REST API that provides data for the frontend.

### Technologies

- Node.js
- Express.js
- PostgreSQL
- PrismaORM
- Docker
- Docker Compose

## Installation

1. Clone the repository
2. Run `npm install` or `pnpm install`
3. Clone the `.env.example` file and rename it to `.env`
4. Fill in the `.env` file with your database credentials and/or insert postgres setup credentials for local testing

### Setup database

1. Run `docker-compose up -d` to start the database
2. Run `npx prisma migrate deploy` to run all the migrations
3. Run `npx prisma db seed` to seed the database with some data

### Run

- Run `npm run dev` to start the server in development mode
- Run `npm run start` to start the server in production mode

or

- Run `docker-compose up` to start the server in a docker container
