
mongoimport --drop -d sfeir_nosql_presentation -c movies --jsonArray "./mongodb/movies.json"
mongoimport --drop -d sfeir_nosql_presentation -c actors --jsonArray "./mongodb/actors.json"


```
arangoimp --server.database sfeir_nosql_presentation --server.username sfeir --server.password sfeir --file "./arangodb/actors_arango.json" --type json --create-collection true --collection "actors" --batch-size 10485760
arangoimp --server.database sfeir_nosql_presentation --server.username sfeir --server.password sfeir --file "./arangodb/movies_arango.json" --type json --create-collection true --collection "movies" --batch-size 10485760
arangoimp --server.database sfeir_nosql_presentation --server.username sfeir --server.password sfeir --file "./arangodb/act_in_arango.json" --type json --create-collection true --create-collection-type edge --collection "act_in" --batch-size 20485760
```
