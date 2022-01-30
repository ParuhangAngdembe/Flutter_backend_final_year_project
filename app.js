require("dotenv").config();
const cors = require("cors");

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const errorHandlerware = require("./middleware/error");

const connectDB = require("./db/connect");
const productRouter = require("./routes/productRoute");
const userRouter = require("./routes/userRoute");
const orderRouter = require("./routes/orderRoute");

/*    
NOTE----------------------
 -> We need express.json() for POST and PUT requests, because in both these requests you are sending data (in the form of some data object) to the server and you are asking the server to accept or store that data (object), which is enclosed in the body (i.e. req.body) of that (POST or PUT) Request
 -> It is a method inbuilt in express to recognize the incoming Request Object as a JSON Object. This method is called as a middleware 
 */
app.use(express.json());
app.use(cookieParser());
app.use(cors());
//app.use(bodyParser.json());

//ROUTES
app.get("/", (req, res) => {
  res.send("this is the home page");
});

app.use("/api/v1/products", productRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/order", orderRouter);

//Middleware: Error Handler
app.use(errorHandlerware);

// Run Server only when connection with DB is Established
const port = 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`server listening ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();

/* 
Unhandled Promise Rejection------

process.on("unhandledRejection", (err)=>{
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to unhandled promise rejection);

  server.close(()=>{
    process.exit(1);
  })
})
*/
