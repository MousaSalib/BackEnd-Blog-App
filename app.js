const express = require("express");
const connectToDB = require('./config/connectToDB.js');
const { errorHandler, notFound } = require("./middleWares/error.js");
require('dotenv').config();

connectToDB();
const app = express();

app.use(express.json());
app.use("/auth/api", require("./routes/authRoutes.js"));
app.use("/users/api", require("./routes/usersRoutes.js"));
app.use("/posts/api", require("./routes/postRoutes.js"));
app.use("/comments/api", require("./routes/commentsRoutes.js"));
app.use("/categories/api", require("./routes/categoriesRoutes.js"));
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

