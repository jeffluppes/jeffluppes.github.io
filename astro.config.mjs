// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Deployed to GitHub Pages as a user site (jeffluppes.github.io) with the
// custom domain www.jeffluppes.nl -> base is root. The CNAME file in public/
// pins the custom domain through every build.
export default defineConfig({
  site: "https://www.jeffluppes.nl",
  base: "/",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  // Redirects from the old Pelican (TDS/GitHub Pages) URLs to the new routes,
  // so existing bookmarks and inbound links don't 404.
  redirects: {
    "/thoughts-on-the-state-of-machine-learning-engineering.html": "/blog/thoughts-on-ml",
    "/the-class-of-2015-an-analysis-in-what-jobs-the-people-i-graduated-with-ended-up.html": "/blog/class-of-2015",
    "/building-a-bird-detector-from-scratch-with-web-scraping-and-deep-learning-part-1.html": "/blog/building-a-bird-detector-from-scratch",
    "/google-cloud-platform-certified-data-engineer.html": "/blog/gcp-data-engineer",
    "/big-data-series.html": "/blog/big-data-series",
    "/big-data-series-give-me-a-spark.html": "/blog/give-me-a-spark",
    "/big-data-series-hadoop-and-hdfs.html": "/blog/hadoop-and-the-hdfs",
    "/big-data-series-surfsara-and-the-common-crawl.html": "/blog/surfsara-and-the-commoncrawl",
    "/salt-on-the-road-tracking-gritters-by-webscraping.html": "/blog/mapping-gritters",
    "/pages/about-me.html": "/about",
    "/pages/contact.html": "/about",
    "/archives.html": "/blog",
    "/categories.html": "/blog",
  },
  markdown: {
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },
});
