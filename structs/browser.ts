import { Browser, chromium, Page } from "playwright";
import { setTimeout as wait } from "timers/promises";
import { log } from "../helper/utils";
class Container {
  //@ts-ignore
  browser: Browser;
  //@ts-ignore
  page: Page;
  constructor() {}
  async launch() {
    this.browser = await chromium.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--disable-web-security",
      ],
    });
    log(`Launched browser...`.yellow);
  }
  async getPage() {
    this.page = await this.browser.newPage();
    log(`Launched new page...`.yellow);
    this.page.on('console', (msg) => {
      console.log(`[BrowserConsole] ${msg.type().toUpperCase()}`, msg);
    });    
  }
  async playEpisode(url: string) {
    this.page.on("framenavigated", (frame) => {
      if (frame.url().includes("/home")) {
        log("[❌] Unable to pull episode! make sure to include _debug=ok in the url".red);
      }
    });
    
    await this.page.goto(url+"&_debug=ok");
    log(`Navigated to ${url}`.green);
    await wait(10000);
  }
}

const container = new Container();
container.launch().then(async () => {
  await container.getPage();
  await container.playEpisode(
    `https://hianime.to/watch/jujutsu-kaisen-2nd-season-18413?ep=103634`
  );
  await container.page.screenshot({ path: "screenshot.png" });
  log(`Finished!`.green);
  await container.page.close();
});
