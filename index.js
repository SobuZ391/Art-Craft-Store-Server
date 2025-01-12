const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());
app.use(cors({
  origin:["http://localhost:5173/, http://hello.web.app,http://hello.firebaseapp.com"]
}))



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygeo5w7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    const itemCollection =client.db('artCraftCtore').collection('craftItems');
    
    app.get('/addCraftItem',async(req,res)=>{
        const cursor = itemCollection.find();
        const result =await cursor.toArray();
        res.send(result);
    })
    app.post("/addCraftItem",async(req,res)=>{
      console.log(req.body);
      const result =await itemCollection.insertOne(req.body);
      console.log(result);
      res.send(result)
  })
  //my craft items server
  app.get('/myCraftItem/:id',async(req,res)=>{
    const id =req.params.id;
    const query ={_id:new ObjectId(id)}
    const result =await itemCollection.findOne(query);
    res.send(result);
  })
  app.get('/myCraftItem',async(req,res)=>{
    const email=req.body.email;
    if(email){
      const query = {email:email};
      console.log(query);
      const cursor =itemCollection.findOneAndDelete(query);
      const result =await cursor.toArray();
      res.send(result);
    }else{
      const cursor = itemCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    }
  })
  app.put('/myCraftItem/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedCraftItem = req.body;
    const craftItem = {
      $set: {
        subcategory: updatedCraftItem.subcategory,
        image: updatedCraftItem.image,
        itemName: updatedCraftItem.itemName,
        shortDescription: updatedCraftItem.shortDescription,
        price: updatedCraftItem.price,
        rating: updatedCraftItem.rating,
        customization: updatedCraftItem.customization,
        stockStatus: updatedCraftItem.stockStatus
      }
    };
    const result = await itemCollection.updateOne(filter, craftItem, options);
    res.send(result)
  })  

  app.delete('/myCraftItem/:id',async(req,res)=>{
    const id =req.params.id;
    const query = {_id:new ObjectId(id)}
    const result =await itemCollection.deleteOne(query);
    res.send(result);
  })

  //all craft items
  app.get('/allCraftItems',async(req,res)=>{
    const cursor = itemCollection.find();
    const allCraftItems = await cursor.toArray();
    res.send(allCraftItems);
  })
  app.get('/allCraftItems/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const singleItem =await itemCollection.findOne(query)
    res.send(singleItem);
    })


const craftSubcategories = client.db('artCraftCtore').collection('craftSubcategories');

app.get('/craftSubcategories',async(req,res)=>{
  const cursor = craftSubcategories.find();
  const result =await cursor.toArray();
  res.send(result);
})




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
 
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('art & craft store server is running')
})

app.listen(port,()=>{
    console.log(`art & craft store server is running on port : ${port}`);
})