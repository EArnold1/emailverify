const mongoose = require('mongoose');

const db =
  'mongodb+srv://files:files@fileupload.md9nr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log('mongoDb Connected....');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
