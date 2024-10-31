const express = require("express");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/classify", upload.single("image"), async (req, res) => {
    try {
        if(!req.file){
            console.log(req);
            return res.status(400).send("No file uploaded") ;
        }
        const imageBuffer = req.file.buffer;
        const response = await axios.post(
            `https://${process.env.CUSTOM_VISION_ENDPOINT}/customvision/v3.0/Prediction/${process.env.PROJECT_ID}/classify/iterations/${process.env.PUBLISHED_ITERATION}/image`,
            imageBuffer,
            {
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Prediction-Key": process.env.PREDICTION_KEY,
                },
            }
        );

        let data = response.data.predictions ;
        const highestTag = data.reduce((max, item) => item.probability > max.probability ? item : max, data[0]);
        res.json(highestTag.tagName);
        
    } catch (error) {
        console.log(error) ;
        res.status(500).send("Error classifying image");
    }
});

app.get('/', (req,res) =>{
    res.json("Hello World") ;
})
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});