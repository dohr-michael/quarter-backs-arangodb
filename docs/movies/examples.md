## Find “Batman Forever”.

```
db.movies.find({name: "Batman Forever"})
```
```
FOR movie IN movies 
    FILTER movie.name == "Batman Forever"
    RETURN movie
```

## Find all “Batman” movies.

```
db.movies.find({name: /.*batman.*/i})
```
```
FOR movie IN movies 
    FILTER LOWER(movie.name) =~ ".*batman.*"
    RETURN movie
```

## Find “Kevin Spacey” best note.

```
db.actors.aggregate([
	{ $match: { name: "Kevin", lastName: "Spacey" } },
	{ $unwind: "$actIn" },
	{ $lookup: { from: 'movies', localField: 'actIn', foreignField: '_id', as: 'actIn' } },
	{ $unwind: "$actIn" },
	{ $sort: { "rating": -1, "votes": -1 } },
	{ $project: { _id: "$actIn._id", name: "$actIn.name", rating: "$actIn.rating" } },
	{ $limit: 1 }
])
```
```
FOR actor IN actors
    FILTER actor.name == "Kevin" AND actor.lastName == "Spacey"
    FOR movie IN 1 OUTBOUND actor act_in OPTIONS {}
        SORT movie.rating DESC, movie.votes DESC
        LIMIT 1
        RETURN movie
```

## Count movies by actor.
```
db.actors.aggregate([
	{ $unwind: "$actIn" },
	{ $group: { _id: "$_id", name: { $last: "$name" }, lastName: { $last: "$lastName" }, count: { $sum: 1 } } },
	{ $sort: { count: -1 } },
])
```
```
FOR link IN act_in
    COLLECT a = link._from WITH COUNT INTO movie_counter
    SORT movie_counter DESC
    LET actor = DOCUMENT(a)
    RETURN {name: actor.name, lastName: actor.lastName, count: movie_counter}
```

## Find movies category for the actor who played in the most movies.
```
db.actors.aggregate([
	{ $match: { name: "Alex", lastName: "Sanders" } },
	{ $unwind: "$actIn" },
	{ $lookup: { from: 'movies', localField: 'actIn', foreignField: '_id', as: 'actIn' } },
	{ $unwind: "$actIn" },
	{ $unwind: "$actIn.genres" },
	{ $group: { _id: "$actIn.genres", count: { $sum: 1 } } },
	{ $sort: { count: -1 } }
])
```
```
WITH actors, movies
FOR actor IN actors
    FILTER actor.name == "Alex" AND actor.lastName == "Sanders"
    FOR movie IN 1..1 OUTBOUND actor act_in OPTIONS {}
        FOR g IN movie.genres
        COLLECT genre = g WITH COUNT INTO genre_count
        SORT genre_count DESC
        RETURN {genre, count: genre_count}
```

## Find all actors of “Batman Forever”.
```
db.movies.aggregate([
	{ $match: { name: "Batman Forever" } },
	{ $unwind: "$roles" },
	{ $lookup: { from: 'actors', localField: 'roles.actor._id', foreignField: '_id', as: 'roles.actor' } },
	{ $unwind: "$roles.actor" },
	{ $project: { name: "$roles.actor.name", lastName: "$roles.actor.lastName"} },
])
db.movies.aggregate([
	{ $match: { name: "Batman Forever" } },
	{ $unwind: "$roles" },
	{ $project: { name: "$roles.actor.name", lastName: "$roles.actor.lastName"} },
])


```
```
WITH actors, movies
FOR movie IN movies
    FILTER movie.name == "Batman Forever"
    FOR actor IN 1..1 INBOUND movie act_in OPTIONS {}
        RETURN DISTINCT actor
```

## Find all co-actors of “Kevin Spacey”.
```
db.actors.aggregate([
	{ $match: { name: "Kevin", lastName: "Spacey" } },
	{ $unwind: "$actIn" },
    { $lookup: { from: 'movies', localField: 'actIn', foreignField: '_id', as: 'actIn' } },
  	{ $unwind: "$actIn" },
  	{ $unwind: "$actIn.roles" },
  	{ $group: { _id: { "name": "$actIn.roles.actor.name", "lastName": "$actIn.roles.actor.lastName" } } },
  	{ $match: { _id: { $ne: { name: "Kevin", lastName: "Spacey" } } } }
])
```
```
WITH actors, movies
FOR kevin IN actors
    FILTER kevin.name == "Kevin" AND kevin.lastName == "Spacey"
    FOR coWorker IN 2 ANY kevin act_in OPTIONS { uniqueVertices: "global", bfs: true }
        SORT coWorker.name ASC, coWorker.lastName ASC
        RETURN { name: coWorker.name, lastName: coWorker.lastName }
```
## Find all actors who did not play with “Kevin Bacon”.
```
// Resolved by code.
var coWorker = db.actors.aggregate([
	{ $match: { name: "Kevin", lastName: "Bacon" } },
	{ $unwind: "$actIn" },
    { $lookup: { from: 'movies', localField: 'actIn', foreignField: '_id', as: 'actIn' } },
  	{ $unwind: "$actIn" },
  	{ $unwind: "$actIn.roles" },
  	{ $group: { _id: "$actIn.roles.actor._id", name: { $last: "$actIn.roles.actor.name" }, lastName: { $last: "$actIn.roles.actor.lastName" } } },
    { $match: { $and: [ { name: { $ne: "Kevin" } }, { lastName: { $ne: "Bacon" } } ] } },
]);

db.actors.find({
	_id: { $nin: coWorker.map(function(e) { return e._id }) }
})
```
```
WITH actors, movies
LET kevinCoWorkers = (
    FOR kevin IN actors
        FILTER kevin.name == "Kevin" AND kevin.lastName == "Bacon"
        FOR coWorker IN 2 ANY kevin act_in OPTIONS { uniqueVertices: "global", bfs: true }
            SORT coWorker.name ASC, coWorker.lastName ASC
            RETURN coWorker
)
LET allActors = (
    FOR actor IN actors
        FILTER actor.name != "Kevin" AND actor.lastName != "Bacon"
        RETURN actor
)
FOR r IN OUTERSECTION(kevinCoWorkers, allActors) RETURN r
```

## Calculate rating average.
```
db.movies.aggregate([
	{ $match: { "rating": { $gt: 0} } },
	{ $group: {_id: '', avg: { $avg: "$rating" } } }
])
```
```
FOR movie IN movies
    FILTER movie.rating > 0
    COLLECT AGGREGATE avg = AVERAGE(movie.rating)
    RETURN avg
```

## Top 10 of best movies.
```
db.movies.find().sort({rating: -1}).limit(10)
```
```
FOR movie IN movies
    SORT movie.rating DESC
    LIMIT 10
    RETURN movie
```

## Top 10 of worst movies.
```
db.movies.find({votes: {$gt: 0}}).sort({rating: 1}).limit(10)
```
```
FOR movie IN movies
    FILTER movie.votes > 0
    SORT movie.rating ASC
    LIMIT 10
    RETURN movie
```

## Shortest path between Kevin Bacon and Kevin Spacey
```
LET acts = (
    FOR bacon IN actors
        FILTER bacon.name == "Kevin" AND bacon.lastName == "Bacon"
        FOR spacey IN actors
            FILTER spacey.name == "Kevin" AND spacey.lastName == "Spacey"
            RETURN [bacon, spacey]
)[0]    

FOR v IN ANY SHORTEST_PATH acts[0] TO acts[1] act_in RETURN v
```
```
LET acts = (
    FOR bacon IN actors
        FILTER bacon.name == "Kevin" AND bacon.lastName == "Bacon"
        FOR spacey IN actors
            FILTER spacey.name == "Kevin" AND spacey.lastName == "Spacey"
            RETURN [bacon, spacey]
)[0]    


FOR v, e, p IN 2..5 ANY acts[0] act_in
    FILTER v._id == acts[1]._id
    RETURN p.vertices
```

