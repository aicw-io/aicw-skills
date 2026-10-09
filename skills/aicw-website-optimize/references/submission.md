# Guided submission to the book’s search engines

Book basis: Chapter 7, pages 66-70. The book supplies the engine choices; the steps below are current implementation details, not a transcription of its interfaces. Official workflows checked on 2026-10-09. Recheck them before an actual submission.

## Prepare the website

Identify the public origin and the intended canonical URLs. Check the deployed sitemap and whether pages are intended for indexing. Make sure that private, staging, redirected, or duplicate URLs are not submitted accidentally. IndexNow also accepts notifications for deliberately deleted URLs.

If the website is only local, prepare files and instructions. External engines cannot index localhost. Do not publish the site as a side effect of preparing a submission.

Create a submission log with service, website property, URL or sitemap, preparation date, submission date, response, verification evidence, follow-up date, and status. Use prepared, submitted, pending, rejected, or confirmed indexed. Keep credentials out of the log.

## Google Search Console

1. Open [Search Console](https://search.google.com/search-console) and select the correct property. If needed, follow its domain or URL-prefix ownership verification instructions.
2. Publish the sitemap through the site's normal workflow. Make sure that its public URL returns a supported sitemap and is accessible without authentication.
3. In the property's Sitemaps report, enter that URL or the requested relative portion and submit it.
4. Inspect the result. Record processing success separately from discovered URLs and indexed pages. Resolve fetch or XML errors from the report.
5. For an important new or changed page, inspect the exact public canonical URL through URL Inspection. Use its live test and request indexing when eligible.
6. Return later to inspect indexing evidence. Repeated requests do not establish or guarantee indexing.

Use the [Sitemaps report instructions](https://support.google.com/webmasters/answer/7451001) and [recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl). Do not use a deprecated sitemap ping endpoint. The general Indexing API is restricted to eligible job postings and livestream events. It is not a bulk submission shortcut for normal pages.

## Bing Webmaster Tools

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters/) and select or verify the website. Follow its current verification or Search Console import flow.
2. Submit the public sitemap in the site's Sitemaps section and inspect processing results.
3. For changed URLs, use IndexNow as described below. Use the authenticated URL submission interface when appropriate and available.
4. Record notification results separately from crawl and indexing observations. Use Webmaster Tools to investigate blocked or excluded URLs.

Bing retired anonymous sitemap pinging. Use [its current sitemap and IndexNow guidance](https://blogs.bing.com/webmaster/2022/5/Spring-cleaning-Removed-Bing-anonymous-sitemap-submission/) and [URL submission documentation](https://www.bing.com/webmasters/help/URL-Submission-62f2860b).

## IndexNow notifications

Use `prepare-submission` from [tools](tools.md) to generate a key file, an `indexnow.json` payload, and a submission record. Reuse the existing site key when one is configured. The helper generates a new key only when one is not supplied.

Publish the key file at the exact public URL in `keyLocation`. Make sure that it returns the key as UTF-8 text. The helper uses a root key file. A key in a subdirectory has a narrower URL scope.

Review the host and URL list before any external request. Each request supports up to 10,000 URLs. Only send changes that actually occurred. Avoid duplicate notifications from both a CMS integration and a separate script.

When an actual notification is authorized, this command sends the prepared payload:

```sh
curl --fail-with-body --request POST --header "Content-Type: application/json; charset=utf-8" --data-binary "@/absolute/path/to/indexnow.json" https://api.indexnow.org/indexnow
```

In Windows PowerShell, use `curl.exe` to select the curl executable and replace the quoted file argument with a native path, for example `"@C:\Reports\indexnow.json"`.

Do not run this command merely because preparation was requested. A response of 200 means receipt. A response of 202 means receipt with key validation pending. Investigate 400, 403, and 422 responses. For 429, stop and follow the service's retry guidance. Do not repeatedly resubmit failed requests unchanged.

Participating engines share IndexNow notifications. Do not claim that IndexNow submits a website to Google. See the [IndexNow protocol](https://www.indexnow.org/documentation).

## Brave Search

Open [Brave's URL submission form](https://search.brave.com/submit-url) in a browser with JavaScript enabled. Enter the real public URL and follow the current form. Complete account or anti-abuse steps manually if required. Record only a result actually displayed by the service.

Do not promise a fixed crawl deadline. Do not claim that browsing with Web Discovery Project guarantees indexing. Check later through available Brave results and record the limits of that observation.

## Historical methods in the book

Page 70 also describes Brave Web Discovery Project and Perplexity Pages. They do not replace the verified submission workflows above. Consult [implementation notes](implementation-notes.md) before discussing their current availability. General directory campaigns are outside this book companion's scope.
