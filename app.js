const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken")
const bodyParser = require('body-parser');
const redis = require('redis');
const Order = require('./models/Order');

mongoose.connect("mongodb://localhost:27017/backend", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Database Connected");
}).catch((e) => {
    console.log(e);
});

const app = express();
app.set("view engine", "ejs");

// Serve static files from the "jk" directory
app.use(express.static(path.join(__dirname, "jk")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password:String,
    
});

const client = redis.createClient();
client.on('connect', () => {
  console.log('Connected to Redis');
});

const routes = require('./routes');
app.use('/api', routes);

const User = mongoose.model("User",userSchema);
const isAuthenticated = async(req,res,next) =>{
    const{token} = req.cookies;
    if(token){
        const jwtdecode =jwt.verify(token,"jkop")
        console.log(jwtdecode)
        req.user = await User.findById(jwtdecode._id)  // user info 
        next()
    }
    else{
        res.render("login")
    }
}
app.get("/", isAuthenticated,(req, res) => {
  
        res.render("logout",{name:req.user.name});  
});
app.post("/register", async(req, res) => {
    const {name,email,password} =req.body
    // console.log(req.body)
   
    let user = await User.findOne({email})
   if(user){
    
     res.redirect("/login")
   }
   user =  await User.create({ name,email,password})
    const token = jwt.sign({ _id : user._id},"jkop")
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
});
app.post("/login", async(req, res) => {
    const {name,email,password} =req.body
    // console.log(req.body)
   
    let user = await User.findOne({email})
   if(!user){
    
     res.redirect("/register")
   }
   user =  await User.create({ name,email,password})
   const token = jwt.sign({ _id : user._id},"jkop")
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/register",(req,res)=>{
    res.render("register")
})

app.get("/logout", (req, res) => {
    //res.clearCookie("token");
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.redirect("/");
});


app.post('/addorder', async (req, res) => {
    try {
      // Create a new order using the provided data
      const newOrder = new Order({
        userId: 'jkthunder2779',
        type: 'sell',
        token: 'BTC',
        price: 50000,
        quantity: 1,
      });
  
      // Save the order to the database
      await newOrder.save();
  
      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Could not create order' });
    }
  });

app.get('/addorder',async(req,res)=>{
    try {
      const orders = await Order.find();
      console.log('Current List of Orders:');
      console.log(orders);
    } catch (error) {
      console.error('Error retrieving orders:', error);
    }
})  


function matchOrders(orders) {
    const matchedOrders = [];
    const buyOrders = orders.filter((order) => order.type === 'buy');
    const sellOrders = orders.filter((order) => order.type === 'sell');
  
   
    buyOrders.sort((a, b) => a.price - b.price);
    sellOrders.sort((a, b) => a.price - b.price);
  
    
    for (const buyOrder of buyOrders) {
      for (const sellOrder of sellOrders) {
        if (buyOrder.token === sellOrder.token && buyOrder.price >= sellOrder.price) {
          
          const tradeQuantity = Math.min(buyOrder.quantity, sellOrder.quantity);
  
          
          const trade = {
            buyer: buyOrder.userId,
            seller: sellOrder.userId,
            token: buyOrder.token,
            price: sellOrder.price, 
            quantity: tradeQuantity,
          };
  
          matchedOrders.push(trade);
  
         
          buyOrder.quantity -= tradeQuantity;
          sellOrder.quantity -= tradeQuantity;
  
          
          if (buyOrder.quantity === 0) {
            
            buyOrders.splice(buyOrders.indexOf(buyOrder), 1);
          }
  
          if (sellOrder.quantity === 0) {
            
            sellOrders.splice(sellOrders.indexOf(sellOrder), 1);
          }
  
          break;
        }
      }
    }
  
    return matchedOrders;
}
  

app.get("/match-orders", async (req, res) => {
    try {
      
      const orders = await Order.find();
  
      
      const matchedOrders = matchOrders(orders);
      res.status(200).json(matchedOrders);
    } catch (error) {
      console.error("Error matching orders:", error);
      res.status(500).json({ error: "Could not match orders" });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
