const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/gamepasses/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.roblox.com/users/${userId}/creations`);

    // Espera la carga de gamepasses
    await page.waitForSelector('.game-pass-item');

    const gamepasses = await page.evaluate(() => {
      const elements = document.querySelectorAll('.game-pass-item');
      const passes = [];

      elements.forEach((el) => {
        const name = el.querySelector('.text-label')?.innerText;
        const link = el.querySelector('a')?.href;
        const id = link?.split('/').pop();
        passes.push({ name, id });
      });

      return passes;
    });

    await browser.close();
    res.json({ success: true, gamepasses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error scraping gamepasses' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en http://localhost:${PORT}`));
