# Third-party software

## ts-fsrs 5.4.2

- Maintainer: open-spaced-repetition / ishiko.
- Repository: https://github.com/open-spaced-repetition/ts-fsrs
- Official npm tarball: https://registry.npmjs.org/ts-fsrs/-/ts-fsrs-5.4.2.tgz
- Model: FSRS-6. This is a deliberately pinned offline-compatible release, not the latest package version.
- Original UMD bundle: vendor/ts-fsrs-5.4.2.umd.js. Unmodified in vendor; the generated HTML removes the optional source-map URL and includes the full MIT license.
- License: MIT. Full license: vendor/LICENSE-ts-fsrs.txt.
- Tarball SHA256: f91a53b58c7269db5528ad420208217384be610a4146a137b85dcaa07e3301cb
- UMD SHA256: 59b7444121d0aae5bb969097ed95df38eff4a4f878e459703c63720f6b6a176b

No new third-party code was added in v0.4.1; `form-guard.js` is written for this project and uses only browser built-ins.

No LexiLoop production code, credentials or user data are included. No fonts or browser engines are redistributed; platform fonts are used by the app.


## WorkBuddy Cloud SDK

`vendor/workbuddy-cloud-sdk.js` is `lib/index.global.js` from the npm package
`@tencent-ai/workbuddy-cloud-sdk@0.1.4-dev.ca27990.202610161713` (MIT).
Full license: `vendor/LICENSE-workbuddy-cloud-sdk.txt`.
Registry tarball integrity (verified by npm pack):
`sha512-HyrXFiilbYFxDGF5pvl1MhBYvE9QnK39uJjiiefX07k7ppl2UPKfl6KWaN9yIzD1DtAGycl3fXaYOzHmvlIMpg==`.
The hosted application loads this fixed same-origin copy only when requested;
the file:// build uses the same exact package version on jsDelivr.

The keyboard-aware controls and offline-shell design were adapted from
`issac-js/lexiloop` at `655adacd937ce59b45168757c2d32856cb3f0957`.
This application retains its own data format and pinned ts-fsrs implementation.
