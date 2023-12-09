const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;
console.log(process.env.DB_USER)
// middleware
app.use(cors());
app.use(express.json());



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.58kalj5.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    // create database & collection
    const usersCollection = client.db('assetPro').collection('users');
    const myAssetCollection = client.db('assetPro').collection('myAsset');
    const requestAssetCollection = client.db('assetPro').collection('requestAsset');




    // Users database Start

    // Read all user data from database
    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    })
    // Read single user data from database
    app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.findOne(query);
      res.send(result);
    })

    // Post Add blogpost data in database
    app.post('/users', async (req, res) => {
      const user = req.body;
      // insert email if user doesnt exists: 
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await usersCollection.insertOne(user);

      res.send(result);
    });
      app.put('/users/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const users = req.body;
        const updateUser = {
          $set: {
            name: users.name,
            dateOfBirth: users.dateOfBirth,
          },
        };
        const result = await usersCollection.updateOne(filter, updateUser, options);
        res.send(result);
      });

      app.patch('/users/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const teem = req.body.teem;
        const updateUser = {
          $set: {
            teem: teem,
          },
        };
        const result = await usersCollection.updateOne(filter, updateUser, options);
        
        if (result.modifiedCount === 1) {
            res.status(200).send("User updated successfully");
        } else {
            res.status(500).send("Error updating user");
        }
    });


//Add asset API STARTING
app.get('/my-assets', async (req, res) => {
      const cursor = myAssetCollection.find();
      const myAsset = await cursor.toArray();
      res.send(myAsset);
    })

    app.get('/my-assets/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await myAssetCollection.findOne(query);
      res.send(result);
    })

      app.post('/my-assets', async (req, res) => {
      const newAddAsset = req.body;
      console.log(newAddAsset);
      const result = await myAssetCollection.insertOne(newAddAsset);
      res.send(result);
    });
    app.delete('/my-assets/:id', async (req, res) => {
      const id = req.params.id;
      console.log('please delete data', id);
      const query = { _id: new ObjectId(id) }
      const result = await myAssetCollection.deleteOne(query);
      res.send(result);
    });
      app.put('/my-assets/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const myAsset = req.body;
      console.log(id, myAsset);
      const updateMyAsset = {
        $set: {
          productName: myAsset.productName,
          productType: myAsset.productType,
          productQuantity: myAsset.productQuantity,
        }
      }
      const result = await myAssetCollection.updateOne(filter, updateMyAsset, options);
      res.send(result);
    })
//Add asset API END

//Add Request Asset API STARTING
app.get('/request-assets', async (req, res) => {
  const cursor = requestAssetCollection.find();
  const requestAsset = await cursor.toArray();
  res.send(requestAsset);
})

app.get('/request-assets/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await requestAssetCollection.findOne(query);
  res.send(result);
})

  app.post('/request-assets', async (req, res) => {
  const newAddRequestAsset = req.body;
  console.log(newAddRequestAsset);
  const result = await requestAssetCollection.insertOne(newAddRequestAsset);
  res.send(result);
});
app.delete('/request-assets/:id', async (req, res) => {
  const id = req.params.id;
  console.log('please delete data', id);
  const query = { _id: new ObjectId(id) }
  const result = await requestAssetCollection.deleteOne(query);
  res.send(result);
});
app.get('/search-assets', async (req, res) => {
  const searchTerm = req.query.searchTerm || ''; // Get search term from query params
  const requestStatusFilter = req.query.requestStatus || ''; // Get request status filter from query params
  const assetTypeFilter = req.query.assetType || ''; // Get asset type filter from query params

  const filter = {
    assetName: { $regex: new RegExp(searchTerm, 'i') },
    requestStatus: { $regex: new RegExp(requestStatusFilter, 'i') },
    assetType: { $regex: new RegExp(assetTypeFilter, 'i') },
  };

  const cursor = requestAssetCollection.find(filter);
  const filteredAssets = await cursor.toArray();
  res.send(filteredAssets);
});
  app.put('/request-assets/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const options = { upsert: true };
  const requestAsset = req.body;
  console.log(id, requestAsset);
  const updateRequestAsset = {
    $set: {
      // postTitle: post.postTitle,
      // postImage: post.postImage,
      // postCategory: post.postCategory,
    }
  }
  const result = await requestAssetCollection.updateOne(filter, updateRequestAsset, options);
  res.send(result);
})
//Add Request Asset API END


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// Port listening
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});