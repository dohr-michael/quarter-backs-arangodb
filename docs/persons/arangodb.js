var data = [
    {
        "_id": "p1",
        "name": "Luke"
    },
    {
        "_id": "p2",
        "name": "Joda"
    },
    {
        "_id": "p3",
        "name": "Obi"
    },
    {
        "_id": "p4",
        "name": "Qui-Gon"
    },
    {
        "_id": "p5",
        "name": "Windu"
    },
    {
        "_id": "p6",
        "name": "Chuwi"
    }
];

var dataRelations = [
    {from: 'p1', to: 'p2'},
    {from: 'p1', to: 'p3'},
    {from: 'p2', to: 'p3'},
    {from: 'p2', to: 'p4'},
    {from: 'p2', to: 'p5'},
    {from: 'p3', to: 'p4'},
    {from: 'p3', to: 'p6'},
];

if (db._collection('social_network_links') !== null) {
    db.social_network_links.drop()
}
if (db._collection('social_network_persons') !== null) {
    db.social_network_persons.drop()
}

db._createDocumentCollection("social_network_persons");
db._createEdgeCollection("social_network_links");


data.forEach(function (person) {

    db.social_network_persons.insert({
        _key: person._id,
        name: person.name,
        knows: dataRelations.filter(function (c) {
            return c.from === person._id;
        }).map(function (c) {
            return {_key: c.to};
        })
    });
});
dataRelations.forEach(function (link) {
    db.social_network_links.insert({
        _from: `social_network_persons/${link.from}`,
        _to: `social_network_persons/${link.to}`
    })
});



