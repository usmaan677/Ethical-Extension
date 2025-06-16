const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();

app.use(cors());

app.get("/", (req, res) =>{
    res.send("Welcome to the Good On You Scraper API! Use /brand/:name to get brand ratings.");
})

app.get("/brand/:name", async(req, res) =>{
    const brandName = req.params.name.toLowerCase();
    const url = `https://directory.goodonyou.eco/brand/${brandName}`;
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();

    try{
        await page.goto(url, {waitUntil: "domcontentloaded"});

        await page.waitForSelector("#brand-rating", {timeout: 5000});

        const rating = await page.$eval(
            "#brand-rating",
            (el) => el.innerText.trim()

        );

        await page.waitForSelector("#rating-summary-text", {timeout: 5000});

        const summary = await page.$eval(
            "#rating-summary-text",
            (el) => el.innerText.trim()
        );

        await browser.close();

        res.json({
            brand: brandName,
            rating: rating,
            summary: summary,
            link: url
        });
    }catch (error){
        await browser.close();
        res.status(404).json({
            error:"Brand not found or an error occured.",
            link: url
        });
    }
});

const PORT = 3000;
app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});