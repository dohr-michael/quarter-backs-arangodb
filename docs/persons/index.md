# Persons Relations
## Persons
* Luke
* Joda
* Obi
* Qui-Gon
* Windu
* Chuwi

## Relations
* Luke knows
    * Joda
    * Obi
* Joda knows
    * Obi
    * Qui-Gon
    * Windu
* Obi knows
    * Qui-Gon
    * Chuwi


## Import data
* MongoDB : `mongo sfeir_nosql_presentation mongodb.js`
* ArangoDB : 
    * `arangosh --server.username sfeir --server.password sfeir --server.database sfeir_nosql_presentation`
    * `require("internal").load("/Users/michael/devs/sfeir-nosql-presentation/docs/persons/arangodb.js")`

## Find friends
* MongoDB : 
```
db.social_network.aggregate([
    { $sort: { _id: 1 }},
    { $unwind: "$knows" },
    { $lookup: { from: 'social_network', localField: 'knows._id', foreignField: '_id', as: 'knows' } },
    { $unwind: "$knows" },
    { $group: { _id: '$_id', name: { $first: '$name' }, knows: { $push: '$knows.name' } } }
])
```
* ArangoDB (document) :    
```
FOR person IN social_network_persons
    FILTER COUNT(person.knows) > 0
    SORT person._key ASC
    let knows =  (
        FOR f IN person.knows
        RETURN DOCUMENT("social_network_persons", f._key).name
    )
    RETURN MERGE(
        person,
        {
            knows: knows
        }
    )
```
* ArangoDB (graph) : 
```
FOR person IN social_network_persons // Items of the social network
    SORT person._key ASC
    let knows = (
        FOR know // identifier
            IN 1 // depth
            OUTBOUND person //direction + startVertex
            social_network_links // edge collection
            OPTIONS {} // options
            RETURN know.name
    )
    FILTER LENGTH(knows) > 0
    return {
        _id: person._id,
        _key: person._key,
        name: person.name,
        knows: knows
    }
```

## Find friends of my friends
* ArangoDB (graph) :
```
FOR person IN social_network_persons // Items of the social network
    SORT person._key ASC
    let friendsOfMyFriends = (
        FOR know // identifier
            IN 2 // depth
            OUTBOUND person //direction + startVertex
            social_network_links // edge collection
            OPTIONS {} // options
            RETURN DISTINCT know.name
    )
    FILTER LENGTH(friendsOfMyFriends) > 0
    return {
        _id: person._id,
        _key: person._key,
        name: person.name,
        friendsOfMyFriends: friendsOfMyFriends
    }
```

## Find unknown friends of my friends
* ArangoDB (graph) :
```
FOR person IN social_network_persons // Items of the social network
    SORT person._key ASC
    let friendsOfMyFriends = (
        FOR know // identifier
            IN 2 // depth
            OUTBOUND person //direction + startVertex
            social_network_links // edge collection
            OPTIONS {
                bfs: true, 
                uniqueVertices: 'global' // it is guaranteed that each vertex is visited at most once during the traversal, no matter how many paths lead from the start vertex to this one.
            } // options
            RETURN know.name
    )
    FILTER LENGTH(friendsOfMyFriends) > 0
    return {
        _id: person._id,
        _key: person._key,
        name: person.name,
        friendsOfMyFriends: friendsOfMyFriends
    }
```
