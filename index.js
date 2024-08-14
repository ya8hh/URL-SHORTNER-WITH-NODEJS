
const express = require("express");
const StaticRoute = require("./routes/staticsRoutes")


const path = require ('path');
const app = express();
const urlRoute = require('./routes/url');
const { connectToMongoDB } = require('./connect');
const URL = require('./models/url');

const port = 3001;

app.set("view engine","ejs");
app.set("views",path.resolve('./views'))

connectToMongoDB('mongodb://localhost:27017/short-url')
    .then(() => console.log('mongoDB connected'));
app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.get("/test", async (req, res) => {
    const allURLs = await URL.find({}) ;
    return res.render("home",{
        urls: allURLs,
    });
});

app.use("/url", urlRoute);
app.use("/",StaticRoute);


// Handle redirection
app.get('/:shortId', async (req, res) => {
    try {
        const shortId = req.params.shortId;
        const entry = await URL.findOneAndUpdate(
            { shortId },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now(),
                    },
                },
            },
            { new: true } // Ensure the updated document is returned
        );

        if (!entry) {
            return res.status(404).send("Short URL not found");
        }

        res.redirect(entry.redirectUrl);
    } catch (error) {
        console.error('Error while handling redirection:', error);
        res.status(500).send("An error occurred while processing your request.");
    }
});

app.listen(port, () => console.log(`Server Started at PORT ${port}`));
