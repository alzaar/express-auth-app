# express-auth-app

Using bcrypt, jsonwebtoken with express to understand how authenticaion request and response cycle works.

To run:

```
bash
// Install dependencies
npm i 
// Start local server
npm run dev
```

A mongo db will also be required, which can be obtained by installing a local instance of mongo or even using docker.

For docker the following docker command can be used:

```
bash
docker run --name mongo-db-auth-app -p 127.0.0.1:27017:27017 -d mongo:8.0.10-noble
```

Then create a db called auth-app and a collection called users

```
bash
docker exec -it <container_id> mongosh // to access the db shell

use auth-app
db.createCollection('users')
```

Following endpoints can be accessed:

```
bash
POST - /signup
POST - /login

GET - /
```