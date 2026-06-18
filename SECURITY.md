# Security Policy

## Reporting a vulnerability

CertPath AI is a fully client-side application. There is no backend, and no user
data ever leaves the user's device except their own API key, which is sent only
to the AI provider's endpoint they configured.

If you discover a security issue (for example: a way the stored API key could be
exfiltrated, an XSS vector, or a supply-chain concern), please **do not open a
public issue**. Instead, report it privately via GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
on this repository, or contact a maintainer directly.

We will acknowledge your report, investigate, and coordinate a fix and
disclosure timeline with you.

## Scope & notes

- The user's API key is stored in the browser's IndexedDB and is used only to
  call the configured provider's API directly from the browser. Treat any change
  that could leak or misroute the key as high severity.
- The app intentionally has no telemetry or analytics calls.
- Generated study content is informational and not a guarantee of exam accuracy
  — see the content disclaimer in the README.
