# PSQL with SSL connection POC

- https://github.com/bitnami/bitnami-docker-postgresql/issues/255
- https://github.com/brianc/node-postgres/issues/2424

## Create a Root Certificate Authority (CA)

- mkdir keys certs
- openssl req -new -x509 -days 365 -nodes -out certs/ca.crt -keyout keys/ca.key -subj "/CN=root-ca"

## Create a Server Certificate signed by the the CA (use CN=localhost since we're accessing PostgreSQL using that hostname)

- mkdir server
- cp certs/ca.crt server/ca.crt
- openssl genrsa -des3 -out server/server.key 2048
- openssl rsa -in server/server.key -out server/server.key
- openssl req -new -nodes -key server/server.key -out server.csr -subj "/CN=localhost"
- openssl x509 -req -in server.csr -days 365 -CA certs/ca.crt -CAkey keys/ca.key -CAcreateserial -out server/server.crt
- rm server.csr

## Create a Client Certificate signed by the CA (CN=my_user since it's the username we're using to connect to the database)

- mkdir client
- cp certs/ca.crt client/ca.crt
- openssl genrsa -des3 -out client/client.key 2048
- openssl rsa -in client/client.key -out client/client.key
- openssl req -new -nodes -key client/client.key -out client.csr -subj "/CN=my_user"
- openssl x509 -req -in client.csr -days 365 -CA certs/ca.crt -CAkey keys/ca.key -CAcreateserial -out client/client.crt
- rm client.csr
- mv client src

## Requirements

- `NodeJS`
- `Docker`

## Quickstart

- `$ npm install`
- `$ docker-compose up`
- `$ npm run start`

## Connect using the commandline

- `$ psql 'host=localhost port=5432 dbname=my_database user=my_user sslmode=verify-full sslrootcert=./certs/ca.crt sslkey=./src/client/client.key sslcert=./src/client/client.crt'`

## Note

Thanks to the proper `pg_hba.conf`:

- psql 'host=localhost port=5432 dbname=my_database user=my_user password=password123'

will result in:

```
psql: error: FATAL:  connection requires a valid client certificate
FATAL:  no pg_hba.conf entry for host "172.27.0.1", user "my_user", database "my_database", SSL off
```

as expected.
