import { chromium } from "playwright-extra";
import { Browser, BrowserContext, Page } from "playwright";

import { setTimeout as wait } from "timers/promises";
import { log } from "../helper/utils";
import path from "path";
import stealth from "puppeteer-extra-plugin-stealth";
import config from "../config";
chromium.use(stealth());

class Container {
  //@ts-ignore
  browser: BrowserContext;
  //@ts-ignore
  page: Page;
  //@ts-ignore
  constructor() { }
  async launch() {
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const extensionPath = path.resolve(__dirname, '../extensions/ublock/uBlock0.chromium');
    this.browser = await chromium.launchPersistentContext(``, {
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        `--start-maximized`,
        `--no-sandbox`,
        '--disable-infobars',
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--enable-usermedia-screen-capturing',
        '--allow-http-screen-capture', // allows from insecure origins if needed
        '--auto-select-desktop-capture-source=AniCordStream',
      ],
      executablePath: chromePath,
      viewport: null
    });
    log(`Launched browser!`.yellow);
  }
  async getPage() {
    const episodeTab = await this.browser.newPage();
this.page = episodeTab
// Get the underlying CDP session
const cdpSession = await this.browser.newCDPSession(episodeTab);

// Detach tab into new window
await cdpSession.send('Browser.setWindowBounds', {
  windowId: (await cdpSession.send('Browser.getWindowForTarget')).windowId,
  bounds: { windowState: 'normal' }
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
});`
    })
    log(`Launched new page...`.yellow);
  }
  async playEpisode(url: string) {
    await this.page.goto(url + "&_debug=ok", {
      timeout: 1_00_000
    });

    await this.page.evaluate(() => {
      document.title = "AniCordStream";
    });

    log(`Navigated to ${url}`.green);
    await wait(5000);
  }
  async focusPlayer() {
    const iframeHandle = await this.page.$('#iframe-embed');
    const frame = await iframeHandle?.contentFrame();

    if (frame) {
      await this.page.waitForSelector(`#iframe-embed`);
      log(`Detected video...`.magenta);
      await frame.evaluate(
        `const video = document.querySelector('video');
        if (video) {
          const requestFullscreen =
            video.requestFullscreen ||
            video.webkitRequestFullscreen ||
            video.mozRequestFullScreen ||
            video.msRequestFullscreen;

          if (requestFullscreen) {
            requestFullscreen.call(video);
          } else {
            console.warn('Fullscreen API not supported on video.');
          }
        } else {
          console.warn('No <video> element found in iframe.');
        }`
      );
    }
  }
  async loadExtension() {
    const [chromeExtenstionsTab] = this.browser.pages() || await this.browser.newPage();
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

class DiscordManager {
  discord: Page | undefined;
  browser: BrowserContext | undefined;
  constructor(browser: BrowserContext) {
    this.browser = browser;

  }
  async prepare() {
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    
    this.browser = await chromium.launchPersistentContext(``, {
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        `--start-maximized`,
        `--no-sandbox`,
        '--disable-infobars',
        '--use-fake-ui-for-media-stream', // auto-accepts camera/mic/screenshare prompt
        '--enable-usermedia-screen-capturing',
        '--allow-http-screen-capture', // allows from insecure origins if needed
        '--auto-select-desktop-capture-source=AniCordStream',
      ],
      executablePath: chromePath,
      viewport: null
    })
  }
  async login() {
    if(!this.browser) return log(`Discord not loaded!`.red)
    this.discord = await this.browser.newPage();
    const token = config.self;

    await this.discord.goto(config.vc, {
      waitUntil: "networkidle",
    });

    await wait(5000);

    log(`Logging in...`.grey);

    await this.discord.evaluate((token) => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      if(iframe.contentWindow)
      iframe?.contentWindow.localStorage.setItem('token', `"${token}"`);
    
      setTimeout(() => location.reload(), 1000);
    }, token);

    await log(`Waiting for discord to load...`.magenta)
    await this.discord.waitForSelector(`#app-mount > div.appAsidePanelWrapper_a3002d > div.notAppAsidePanel_a3002d > div.app_a3002d > div > div.layers__960e4.layers__160d8 > div > div > div > div.content_c48ade > div.sidebar_c48ade > div.sidebarList_c48ade.sidebarListRounded_c48ade > nav`)
    log(`Logged in!`.green)
  }
  async joinVoice() {
    log(`Joining voice...`.grey);
    if(!this.discord) return log(`Discord not loaded!`.red)
    const joinBtn = this.discord.getByText("Join Voice");
    await joinBtn.waitFor({ state: "visible", timeout: 150_000 });
  
    await joinBtn.click().catch(err => log("Join button click failed!".red));
    await wait(5000);
  
    log(`Joined voice...`.green);
  }
  
  async startScreenShare() {
    log(`Starting screenshare...`);
    if(!this.discord) return log(`Discord not loaded!`.red)
    const buttonLocator = this.discord.locator('[aria-label="Share Your Screen"]').first();
await buttonLocator.waitFor({ state: 'visible' });
await buttonLocator.click();

  
  }
}

const container = new Container();
container.launch().then(async () => {
  //return;
  const extTab = await container.loadExtension();
  await container.getPage();
  await extTab?.close();
  await container.playEpisode(
    `https://hianime.to/watch/jujutsu-kaisen-2nd-season-18413?ep=103634`
  );
  await container.focusPlayer();
  const discorder = new DiscordManager(container.browser);
  //await discorder.prepare();
  await discorder.login();
  await discorder.joinVoice();
  await discorder.startScreenShare();
  log(`Finished!`.green);
});



