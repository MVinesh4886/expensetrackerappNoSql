const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected Successfully");
  } catch (error) {
    console.log(error);
    console.log("Couldn't establish connection");
  }
};

dbConnect();
