const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
import { email, password } from "./secret";
import { Browser } from "puppeteer";

puppeteer.use(StealthPlugin());

const url = "https://robertsspaceindustries.com/";
const org = "THECODE";
const orgUrl = `https://robertsspaceindustries.com/orgs/${org}/admin/members`;

interface Card {
  href: string;
  name: string;
  nickname: string;
}

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(url);

  function delay(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  console.log("Waiting for discover modal...");
  await delay(3000);

  console.log("Closing modal...");
  await page.locator("#overlay_close").click();

  await delay(2000);
  console.log("Opening account menu...");

  await page
    .locator(
      "#platform-bar > section > div > nav > ul.c-platform-list.c-platform-list--rsi.c-platform-navigation-list > li:nth-child(3) > a"
    )
    .click();

  await delay(1000);

  console.log("Enter credentials...");
  await page.locator("#email").click();
  await page.type("#email", email);
  await page.locator("#password").click();
  await page.type("#password", password);
  console.log("Signing in...");
  await page
    .locator(
      "#enlist-root > div > div > div.c-formLegacyEnlist__wrapper > form > div > button"
    )
    .click();

  console.log("Waiting 20 seconds for manual 2FA input...");
  await delay(20000);

  console.log("Navigating to members page...");
  await page.goto(`${orgUrl}`);

  await delay(2000);

  const membersContainer = await page.$("#members-data");
  const totalMembersElement = await page.$(".totalrows.js-totalrows");
  const totalMembers = parseInt(
    await totalMembersElement.evaluate((el) => el.textContent.trim()),
    10
  );
  const elementSelector = ".c-platform-copyright.c-platform-copyright--rsi";
  const cardData = [];

  async function scrollElementIntoView(
    page: {
      $: (arg0: any) => any;
      viewport: () => { (): any; new (): any; height: number };
    },
    elementSelector: string
  ) {
    try {
      const element = await page.$(elementSelector);

      if (element) {
        const rect = await element.boundingBox();
        if (rect.top >= 0 && rect.bottom <= page.viewport().height) {
          return;
        }

        await element.scrollIntoView({ block: "start", behavior: "smooth" });
      } else {
        console.warn(`Element with selector "${elementSelector}" not found.`);
      }
    } catch (error) {
      console.error("Error scrolling element into view:", error.message);
    }
  }

  async function scrapeNewCards() {
    const newCards = await membersContainer.$$(".member-item");
    console.log("Card Data Length: ", cardData.length);
    console.log("Scraped Members: ", scrapedMembers.size);
    for (const cardElement of newCards) {
      try {
        const href = await cardElement.$eval("a", (el) => el.href);
        if (!scrapedMembers.has(href) && href) {
          // Check if already scraped
          scrapedMembers.add(href); // Add href to set for future checks

          const nameAndNickname = await cardElement.$eval(
            ".name-wrap",
            (el) => ({
              name: el.querySelector(".name").textContent,
              nickname: el.querySelector(".nick").textContent,
            })
          );

          const card: Card = {
            href,
            name: nameAndNickname.name,
            nickname: nameAndNickname.nickname,
          };

          cardData.push(card);
        }
      } catch (error) {
        console.error(`Error scraping card: ${error.message}`);
      }
    }
  }

  async function writeDataToCSV(data: any[], filename: string) {
    const headers = Object.keys(data[0]);
    const csvRows = data.map((row) => {
      return headers.map((header) => row[header] || "").join(",");
    });
    const csvContent = [headers.join(",")].concat(csvRows).join("\n");
    fs.writeFileSync(filename, csvContent, "utf-8");
  }

  const scrapedMembers = new Set();

  let pageLoads = totalMembers / 32;
  console.log("scraping member page...");
  for (let i = 0; i < pageLoads; i++) {
    await scrollElementIntoView(page, elementSelector);
    await delay(1000);
    const loader =
      (await page.$('.traj-loader.trans-02s[style="opacity: 0;"]')) !== null;
    if (loader) {
      console.log("Loader is present but inactive, likely all cards loaded");
    }
    await scrapeNewCards();
  }

  console.log("Scraped card data:", cardData);
  console.log("Total members:", totalMembers);
  console.log("Scraped card data length:", cardData.length);

  async function scrapeCitizenInfo(href, cardData) {
    try {
      await page.goto(href);

      const mainOrg = await page.$eval(".info > p > a", (el) =>
        el.textContent.trim()
      );
      const altOrg = `${href}/organizations`;

      const regionParts = await page.$$eval(
        ".left-col > div > :nth-child(2) > strong",
        (els) => els.map((el) => el.textContent.trim().replace(/\s+/g, ""))
      );
      const region = regionParts.join(", ");

      const fluency = await page.$eval(
        ".left-col > div > :nth-child(3) > strong",
        (el) => el.textContent.trim()
      );

      cardData.mainOrg = mainOrg;
      cardData.altOrg = altOrg;
      cardData.region = region;
      cardData.fluency = fluency;
    } catch (error) {
      console.error(`Error scraping data for ${href}:`, error);
    }
  }

  console.log("scraping citizen pages...");
  for (const citizen of cardData) {
    await scrapeCitizenInfo(citizen.href, citizen);
  }

  console.log("Updated cardData:", cardData);

  if (cardData.length > 0) {
    await writeDataToCSV(cardData, "scraped_members.csv");
  }

  console.log("Scraped card data written to scraped_members.csv");

  await browser.close();
};

main();
