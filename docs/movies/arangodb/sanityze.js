var fs = require('fs');


const actors = JSON.parse(fs.readFileSync("../mongodb/actors.json", "utf8"));
const movies = JSON.parse(fs.readFileSync("../mongodb/movies.json", "utf8"));

const actorMovieLinkResult = [];
const actorsResult = [];
const movieResult = [];

actors.forEach(c => {
    actorsResult.push({
        _key: c._id,
        name: c.name,
        lastName: c.lastName
    });
});
movies.forEach(c => {
    movieResult.push({
        _key: c._id,
        name: c.name,
        rating: c.rating,
        votes: parseInt(c.votes['$numberLong']),
        suspended: c.suspended,
        genres: c.genres,
    });
    (c.roles || []).forEach(r => {
        actorMovieLinkResult.push({
            _from: `actors/${r.actor._id}`,
            _to: `movies/${c._id}`,
            role: r.role,
        })
    });
});

fs.writeFileSync('./movies_arango.json', JSON.stringify(movieResult, null, 3), 'utf8');
fs.writeFileSync('./actors_arango.json', JSON.stringify(actorsResult,null, 3), 'utf8');
fs.writeFileSync('./act_in_arango.json', JSON.stringify(actorMovieLinkResult,null, 3), 'utf8');
