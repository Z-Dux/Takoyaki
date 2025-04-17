import { ANIME, StreamingServers } from '@consumet/extensions';
import Zoro from '@consumet/extensions/dist/providers/anime/zoro';
import { chromium } from 'playwright-extra';

(async () => {
    /*const zoro = new Zoro(`https://hianimez.to`)
    const id = await zoro.search('Date A Live V')
    if (!id || id.results.length == 0 || !id.results[0]?.id) return console.log(`No results found`, id)
    else console.log(id.results[0]?.id)
    //@ts-ignore
    const anime = await zoro.fetchAnimeInfo(id.results[0].id);
    if (!anime.episodes) return console.log(`No episodes found`)
    console.log(anime.episodes[0]?.id, anime.episodes.map(x => x.id))
    const a = await zoro.fetchEpisodeSources(`${anime.episodes[0]?.id}`, StreamingServers.VidStreaming);
    console.log(a)
    return;*/
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    const browser = await chromium.launch({
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            `--start-maximized`
        ],
        executablePath: chromePath
    });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        viewport: null
    });
    const page = await context.newPage();
    await page.addInitScript({
        content: `// Pretend we are a real browser
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
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
    await page.goto(`https://aniwatchtv.to/watch/my-hero-academia-vigilantes-19544?_debug=ok`)
    await page.waitForTimeout(5000); // Wait for the page to load

})();
