const express = require("express");
const app = express();
const urlRoute = require('./routes/url');
const { connectToMongoDB } = require('./connect');
const URL = require('./models/url');

const PORT = 8001;

connectToMongoDB('mongodb://localhost:27017/short-url')
    .then(() => console.log('mongoDB connected'));
app.use(express.json());

app.get("/", (req, res) => {
    return res.end("<h1>hi there test</h1>");
});

app.use("/url", urlRoute);

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

app.listen(PORT, () => console.log(`Server Started at PORT ${PORT}`));
