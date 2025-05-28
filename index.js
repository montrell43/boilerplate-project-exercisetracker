require('dotenv').config()

 const express = require('express')
const mongoose = require('mongoose');
 const cors = require('cors')
 const bodyParser = require('body-parser');
 const app = express()
 const User = require('./models/User')

const uri = process.env.MONGO_URI;
console.log('Mongo URI:', uri); 

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User({ username: req.body.username });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/users', async (req, res) => {
  const users = await User.find({}, 'username _id');
  res.json(users);
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const user = await User.findById(req.params._id);
  if (!user) return res.status(404).send("User not found");

  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  };

  user.log.push(exercise);
  await user.save();

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: user._id
  });
});


app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const user = await User.findById(req.params._id);
  if (!user) return res.status(404).send("User not found");

  let log = user.log;

  if (from) log = log.filter(e => new Date(e.date) >= new Date(from));
  if (to) log = log.filter(e => new Date(e.date) <= new Date(to));
  if (limit) log = log.slice(0, +limit);

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }))
  });
});


//const uri = 'MONGO_URI=mongodb+srv://tmerriweather%40perseverenow.org:LETSGETIT123@cluster0.jnvwutc.mongodb.net/exercise-tracker?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log("mongoose connected");
  }).catch((e) => {
    console.log(e);
  })

let personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  favoriteFoods: {
    type: [String]
  }
});




let Person = mongoose.model('Person', personSchema)

const createAndSavePerson = (done) => {
  const newPerson = new Person({
    name: 'John Doe',
    age: 30,
    favoriteFoods: ['Pizza', 'Burger', 'Pasta']
  });

  newPerson.save((err, data) => {
    if (err) return done(err);
    done(null, data);
  });
  
};

const arrayOfPeople = [
  {name:"randall", age:37, favoriteFoods:['pizza','burger']},
  {name:"randall", age:37, favoriteFoods:['pizza','burger']},
  {name:"randall", age:37, favoriteFoods:['pizza','burger']}
]

const createManyPeople = (arrayOfPeople, done) => {

  Person.create(arrayOfPeople, (err,people)=>{
    if(err){
      return done(err);
    }
    done(null,people);
  })
};

const findPeopleByName = (personName, done) => {
  Person.find({name:personName},function(err,people){
    if(err){
      return done(err);
    }
    done(null, people);
  })
};

const findOneByFood = (food, done) => {
  Person.findOne({favoriteFoods: food}, (err,food) =>{
    if(err){
      return done(err);
    }
    done(null, food);
  })
  
};

const findPersonById = (personId, done) => {
  Person.findById(personId, (err, data)=>{
    if(err){
      return done(err)
    }
    done(null, data);
  })
  
};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";
 Person.findById(personId,(err,person)=>{
  if(err){
    return done(err);
  }
  person.favoriteFoods.push(foodToAdd);
  person.save((err,updatedPerson)=>{
    if(err){
      return done(err);
    }
    done(null,updatedPerson);
  })
 })
};

const findAndUpdate = (personName, done) => {
  const ageToSet = 20;
  Person.findOneAndUpdate(
    { name: personName },  // Search criteria
    { age: ageToSet },           // Update operation
    { new: true },         // Return the updated document
    (err, updatedPerson) => {
      if (err){
        return done(err);
      }
      done(null, updatedPerson);
    }
  );
  
};

const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId, (err, removedPerson) => {
    if (err) {
        return done(err);
    }
    return done(null, removedPerson);
});
};

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  Person.remove({ name: nameToRemove }, (err, result) => {
    if (err) {
      return done(err);
    }
    done(null, result);
  });
};

const queryChain = (done) => {
  const foodToSearch = "burrito";
  
  // Build the query with chaining syntax
  Person.find({ favoriteFoods: foodToSearch })  // Find people who like the specified food
    .sort({ name: 1 })                          // Sort by name in ascending order
    .limit(2)                                   // Limit the results to 2 documents
    .select('-age')                             // Exclude the 'age' field
    .exec((err, docs) => {                      // Execute the query and pass the callback
      if (err) {
        console.error('Error occurred:', err); // Log the error
        return done(err);
      }
      console.log('Found documents:', docs);    // Log the results
      done(null, docs);                         // Pass the results to the done callback
    });
};

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
