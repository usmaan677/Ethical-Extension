const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();

app.use(cors());

app.get("/", (req, res) =>{
    res.send("Welcome to the Good On You Scraper API! Use /brand/:name to get brand ratings.");
})

app.get("/brand/:name", async(req, res) =>{
    const requestedName = req.params.name.toLowerCase();
    const searchUrl = `https://directory.goodonyou.eco/search/${requestedName}`;
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();

    try{
        //console.log("Step 1: Visiting search page...");
        await page.goto(searchUrl, { waitUntil: "networkidle2" });

        //console.log("Waiting for brand result to appear...");
        await page.waitForSelector("div[class*='BrandCard'] a[href^='/brand/']", { timeout: 10000 });

        // await page.setViewport({ width: 1200, height: 800 });
        // await page.screenshot({ path: "search_bug.png", fullPage: true });
        //console.log("📸 Screenshot taken after waiting for results");

        //console.log("Step 2: Extracting brandSlug...");
        const brandSlug = await page.$$eval("div[class*='BrandCard'] a[href^='/brand/']", links => {
            const match = links[0];
            return match ? match.getAttribute("href").split("/brand/")[1] : null;
          });

        const brandUrl = `https://directory.goodonyou.eco/brand/${brandSlug}`;
        //console.log("Step 3: Visiting brand page...", brandUrl);
        await page.goto(brandUrl, { waitUntil: "domcontentloaded" });

        //console.log("Step 4: Scraping rating...");
        await page.waitForSelector("#brand-rating", { timeout: 5000 });
        const rating = await page.$eval("#brand-rating", el => el.innerText.trim());

        //console.log("Step 5: Scraping summary...");
        await page.waitForSelector("#rating-summary-text", { timeout: 5000 });
        const summary = await page.$eval("#rating-summary-text", el => el.innerText.trim());

        await browser.close();

        res.json({
            brand: brandSlug,
            rating: rating,
            summary: summary,
            link: brandUrl
        });
    }catch (error){
        await browser.close();
        res.status(404).json({
            error:"Brand not found or an error occured.",
            link: searchUrl
        });
    }
});

const PORT = 3000;
app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});