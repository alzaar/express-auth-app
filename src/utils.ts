import mongoose from "mongoose";

const connectDB = async (dbname: string) => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGO_URI}/${dbname}`
    );
    console.log(
      `Connection to MongoDB successful: ${connection.connection.host}`
    );
  } catch (err) {
    console.error("Failed to connect to MongoDB, error details: ", err);
  }
};

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
  process.on(signal, async () => {
    try {
      await mongoose.connection.close();
      console.log(`MongoDB connection closed due to ${signal}`);
      process.exit(0);
    } catch (err) {
      console.error("Error during graceful shutdown:", err);
      process.exit(1);
    }
  });
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
  },
});

export default {
  connectDB,
  User: mongoose.model("User", userSchema),
};
