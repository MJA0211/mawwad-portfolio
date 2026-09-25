# Publish mawwad.dev

The portfolio uses GoDaddy for domain registration and Cloudflare Workers Static Assets for hosting. Its public address is [mawwad.dev](https://mawwad.dev), with [mawwad-portfolio.muhammedawwad12.workers.dev](https://mawwad-portfolio.muhammedawwad12.workers.dev) also available. `portfolio.config.ts` uses the public address for canonical and social metadata.

The domain was purchased through GoDaddy on September 24, 2026. DNS lookups return `daniella.ns.cloudflare.com` and `tate.ns.cloudflare.com`. Both `mawwad.dev` and `www.mawwad.dev` now serve the portfolio with HTTP 200 and trusted HTTPS certificates. Worker version `7d4c1620-0e39-4dee-819b-d502e61c16bf` includes the video-seeking fix. All three recordings play and seek successfully on the public site; the `www` host also returns correct HTTP 206 responses for requested video portions.

## Domain registration

Domain registration is complete. Domain renewal stays with GoDaddy. Cloudflare will host the portfolio and manage its DNS and HTTPS certificate. GoDaddy hosting, Website Builder, and a paid SSL certificate are unnecessary for this setup.

The DNS review, nameserver change, portfolio upload, and both custom-domain connections are complete. The connection steps below document the setup. [Workers static asset requests and storage are free](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).

The imported root A records pointing to `13.248.243.5` and `76.223.105.230` blocked the Worker Custom Domain and were removed during setup. An MX record is not needed for the portfolio's existing Outlook contact address.

`.dev` requires HTTPS. Cloudflare issues and renews a free certificate once the domain is connected and validated. Sources: [Google Registry's .dev policy](https://www.registry.google/policies/registration/dev/) and [Cloudflare Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/).

## Deployment files

The user uploaded the prepared site to the Worker named `mawwad-portfolio`. Only `dist` is published. Source repositories and local development files are outside that directory. The prepared `.local/mawwad-dev-deploy.zip` contains the build with `index.html` at its root and all three demo videos. The site's largest file is the EICC recording, about 12.9 MiB.

## Connect mawwad.dev

1. Open Cloudflare > Workers & Pages > `mawwad-portfolio`.
2. Go to Settings > Domains & Routes > Add > Custom Domain.
3. Enter `mawwad.dev` and select Add Custom Domain. If Cloudflare asks to replace the two imported root A records listed above, allow that replacement. If it reports a DNS conflict instead, remove those two root A records in the zone's DNS screen, then retry adding the custom domain.
4. To connect `www.mawwad.dev`, remove the existing `www` CNAME pointing to `mawwad.dev` from the zone's DNS screen, then add `www.mawwad.dev` as a second Custom Domain on the same Worker. Cloudflare does not allow creating a Worker Custom Domain on a hostname with an existing CNAME.
5. Wait for both custom domains to become active, then verify their HTTPS pages, video playback and seeking, descriptions, text walkthroughs, and contact links.

Cloudflare creates the DNS records and manages certificates for Worker Custom Domains. Use the Custom Domain control to connect the site. See [Cloudflare's Worker custom-domain guide](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## Certificate warning during activation

Cloudflare can show "This hostname is not covered by a certificate" while a new domain's certificate is being issued. Its free Universal SSL certificate covers `mawwad.dev`, `www.mawwad.dev`, and `pay.mawwad.dev`. These names do not require the deeper-subdomain coverage mentioned in the warning.

The user confirmed that the Universal certificate shows Active under SSL/TLS > Edge Certificates. For future troubleshooting, Cloudflare documents an issuance window of 15 minutes to 24 hours after domain activation. An active certificate with a persistent warning needs further investigation. Sources: [certificate warning guidance](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/error-messages/) and [Universal SSL activation](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/enable-universal-ssl/).

## Publish later changes

Run `npm run deploy` from the portfolio directory after signing in with `npx wrangler login`. This builds the site and publishes both `dist` and the video-serving code to the existing `mawwad-portfolio` Worker. The local configuration omits domain routes so dashboard-managed domain connections are retained. Verify the deployed page and all three recordings after each deployment.

`cloudflare/worker.mjs` handles byte-range requests for the three recordings. The asset binding does not supply a Content-Length header internally, so the build generates `cloudflare/media-sizes.json` from the actual output files. Requested portions are streamed without buffering a whole recording in the Worker. Other assets use normal static serving. The prepared static ZIP contains only website assets; use `npm run deploy` to publish the video-serving code as well.

The recording requests invoke the Worker and use the Workers Free request allowance. Other matching static asset requests remain free and unlimited. See [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).
