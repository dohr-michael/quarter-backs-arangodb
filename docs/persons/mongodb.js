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

db.social_network.deleteMany({});

db.social_network.insertMany(
    data.map(function (c) {
        var rs = dataRelations.filter(function (item) {
            return item.from === c._id;
        });
        return Object.assign(c, {
            knows: rs.map(function (know) {
                return {_id: know.to}
            })
        });
    })
);