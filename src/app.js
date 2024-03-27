import  express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.get('/set-cookie', (req, res) => {
    // Set a cookie with a specific domain and path
    res.cookie('myCookie', 'cookieValue', {
      domain: 'localhost:8001', // Set the domain attribute to your domain
      path: '/', // Set the path attribute to '/' to make the cookie available across the entire website
      httpOnly: true, // Set httpOnly to true for better security
      // Other cookie attributes can be set here (e.g., maxAge, secure)
    });
  
    res.send('Cookie set successfully');
  });
//routes import
import userRouter from './routes/user.routes.js'
//routes declaration
app.use("/api/v1/users", userRouter)

export {app}