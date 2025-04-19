import { chromium } from "playwright-extra";
import { Browser, BrowserContext, Page } from "playwright";
import os from "node:os";
import { setTimeout as wait } from "timers/promises";
import { log } from "../helper/utils";
import path from "path";
import stealth from "puppeteer-extra-plugin-stealth";
import config from "../config";
chromium.use(stealth());

export class Container {
  //@ts-ignore
  browser: BrowserContext;
  //@ts-ignore
  page: Page;
  //@ts-ignore
  discord?: DiscordManager;
  constructor() {}
  async launch() {
    const chromePath =
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const extensionPath = path.resolve(
      __dirname,
      "../extensions/ublock/uBlock0.chromium"
    );
    this.browser = await chromium.launchPersistentContext(``, {
      headless: false,
      args: [
        "--disable-blink-features=AutomationControlled",
        `--start-maximized`,
        `--no-sandbox`,
        "--disable-infobars",
        `--disable-extensions-except=${extensionPath}`,
        //`--load-extension=${extensionPath}`,
        "--enable-usermedia-screen-capturing",
        "--disable-gpu",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
        "--allow-http-screen-capture", // allows from insecure origins if needed
        "--auto-select-desktop-capture-source=AniCordStream",
      ],
      executablePath:
        os.platform() == `linux` ? `/usr/bin/google-chrome` : chromePath,
      viewport: {
        width: 1280,
        height: 720,
      },
    });
    log(`Launched browser!`.yellow);
  }
  async getPage() {
    const episodeTab = await this.browser.newPage();
    this.page = episodeTab;
    await this.page.route("**/*", (route) => {
      const url = route.request().url();
      if (
        url.includes("ads") ||
        url.includes("tracker") ||
        url.includes(`font`) ||
        url.includes(`thumb`) ||
        url.includes(`.ico`) ||
        url.includes(`.webp`) ||
        url.includes(`.css`)
      ) {
        route.abort();
      } else {
        console.log(url);
        route.continue();
      }
    });

    await this.page.addInitScript({
      content: `Object.defineProperty(navigator, 'webdriver', { get: () => false });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
  window.devtoolsDetector = {
  addListener: () => {},
  launch: () => {}
};
  Object.defineProperty(window, 'console', {
  value: new Proxy(window.console, {
    get: (target, prop) => {
      if (typeof target[prop] === 'function') return () => {};
      return target[prop];
    },
  }),
});`,
    });
    log(`Launched new page...`.yellow);
  }
  async playEpisode(url: string) {
    await this.page.goto(url + "&_debug=ok", {
      timeout: 1_00_000,
    });
    await this.page.evaluate(() => {
      document.title = "AniCordStream";
    });

    log(`Navigated to ${url}`.green);
    await wait(5000);
    await this.focusPlayer();
  }
  async focusPlayer() {
    const iframeHandle = await this.page.$("#iframe-embed");
    const frame = await iframeHandle?.contentFrame();

    if (frame) {
      await this.page.waitForSelector(`#iframe-embed`);
      log(`Detected video...`.magenta);
      await this.page.waitForSelector(`.player-frame`);
      log(`Focusing video frame...`.yellow);
      await this.page.screenshot({ path: `prefocus.png` });
      await this.page.evaluate(() => {
        const header = document.querySelector("#header");
        if (header) header.remove();
      });
      await this.page.evaluate(() => {
        const ticks = document.querySelectorAll(".tick.tick-rate");
        ticks.forEach((el) => {
          if (el.textContent?.trim() === "18+") {
            el.remove();
          }
        });
      });
      await this.page.evaluate(() => {
        const playerFrame = document.querySelector(".player-frame");
      
        if (playerFrame) {
          //@ts-ignore
          Object.assign(playerFrame.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            zIndex: "9999",
            margin: "0",
            padding: "0",
            backgroundColor: "black",
            overflow: "hidden", // Ensure content doesn't spill out
            display: "flex",     // Allow flexible children
            justifyContent: "center",
            alignItems: "center"
          });
      
          // Resize ALL children inside playerFrame
          const children = playerFrame.querySelectorAll("*");
          children.forEach((child) => {
            const el = child as HTMLElement;
            el.style.width = "100%";
            el.style.height = "100%";
            el.style.objectFit = "cover"; // especially for videos/images/iframes
          });
        } else {
          console.warn("Could not find .player-frame element");
        }
      
        // Hide scrollbars
        document.documentElement.style.scrollbarWidth = "none";
        document.body.style.overflow = "hidden";
        document.body.style.scrollbarWidth = "none";
        const style = document.createElement("style");
        style.innerHTML = `::-webkit-scrollbar { display: none; }`;
        document.head.appendChild(style);
      });
      
      /*await this.page.evaluate(() => {
        const playerFrame = document.querySelector(".player-frame");
        if (playerFrame) {
          //@ts-ignore lazy to edit types
          playerFrame.style.position = "fixed";
          //@ts-ignore
          playerFrame.style.top = "0";
          //@ts-ignore
          playerFrame.style.left = "0";
          //@ts-ignore
          playerFrame.style.width = "100vw";
          //@ts-ignore
          playerFrame.style.height = "100vh";
          //@ts-ignore
          playerFrame.style.zIndex = "9999";
          //@ts-ignore
          playerFrame.style.margin = "0";
          //@ts-ignore
          playerFrame.style.padding = "0";
          //@ts-ignore
          playerFrame.style.backgroundColor = "black";
        } else {
          console.warn("Could not find .player-frame element");
        }
        document.documentElement.style.scrollbarWidth = "none";
        document.body.style.overflow = "scroll";
        document.body.style.scrollbarWidth = "none";
        document.body.style.overflow = "hidden";
        const style = document.createElement("style");
        style.innerHTML = `::-webkit-scrollbar { display: none; }`;
        document.head.appendChild(style);
      });*/
    }
  }
  async loadExtension() {
    const [chromeExtenstionsTab] =
      this.browser.pages() || (await this.browser.newPage());
    await chromeExtenstionsTab?.goto("chrome://extensions");
    await wait(500);
    const devModeToggle = await chromeExtenstionsTab?.evaluateHandle(
      'document.querySelector("body > extensions-manager").shadowRoot.querySelector("extensions-toolbar").shadowRoot.querySelector("#devMode")'
    );
    //@ts-ignore
    await devModeToggle?.click();
    await wait(10_000);
    return chromeExtenstionsTab;
  }
}

export class DiscordManager {
  discord: Page | undefined;
  browser: BrowserContext | undefined;
  inVC = false;
  isSharing = false;
  constructor(browser: Container) {
    this.browser = browser.browser;
    browser.discord = this;
  }
  async prepare() {
    const chromePath =
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    this.browser = await chromium.launchPersistentContext(``, {
      headless: false,
      args: [
        "--disable-blink-features=AutomationControlled",
        `--start-maximized`,
        `--no-sandbox`,
        "--disable-infobars",
        "--use-fake-ui-for-media-stream", // auto-accepts camera/mic/screenshare prompt
        "--enable-usermedia-screen-capturing",
        "--allow-http-screen-capture", // testing
        "--auto-select-desktop-capture-source=AniCordStream",
      ],
      executablePath: chromePath,
      viewport: null,
    });
  }
  async login() {
    if (!this.browser) return log(`Discord not loaded!`.red);
    this.discord = await this.browser.newPage();
    const token = config.self;

    await this.discord.goto(config.vc, {
      waitUntil: "networkidle",
    });

    await wait(5000);

    log(`Logging in...`.grey);

    await this.discord.evaluate((token) => {
      const iframe = document.createElement("iframe");
      document.body.appendChild(iframe);
      if (iframe.contentWindow)
        iframe?.contentWindow.localStorage.setItem("token", `"${token}"`);

      setTimeout(() => location.reload(), 1000);
    }, token);

    await log(`Waiting for discord to load...`.magenta);
    await this.discord.waitForSelector(
      `#app-mount > div.appAsidePanelWrapper_a3002d > div.notAppAsidePanel_a3002d > div.app_a3002d > div > div.layers__960e4.layers__160d8 > div > div > div > div.content_c48ade > div.sidebar_c48ade > div.sidebarList_c48ade.sidebarListRounded_c48ade > nav`
    );
    log(`Logged in!`.green);
  }
  async joinVoice() {
    if (this.inVC) return log(`Already in VC!`.red);
    this.inVC = true;
    log(`Joining voice...`.grey);
    if (!this.discord) return log(`Discord not loaded!`.red);
    const joinBtn = this.discord.getByText("Join Voice");
    await joinBtn
      .waitFor({ state: "visible", timeout: 150_00 })
      .catch((err) => {});

    await joinBtn.click().catch((err) => log("Join button click failed!".red));
    await wait(5000);

    log(`Joined voice...`.green);
  }

  async startScreenShare() {
    if (this.isSharing) return log(`Already sharing!`.red);
    this.isSharing = true;
    log(`Starting screenshare...`);
    if (!this.discord) return log(`Discord not loaded!`.red);
    const buttonLocator = this.discord
      .locator('[aria-label="Share Your Screen"]')
      .first();
    await buttonLocator.waitFor({ state: "visible" });
    await buttonLocator.click();
  }
}
