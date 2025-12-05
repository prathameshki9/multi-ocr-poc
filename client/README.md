# snap.MVP - v2

This MVP is generated using cursor AI. The idea is to make MVP more easy to update via prompts and so these MVP changes few libraries and makes structure easy to follow

MVP is based on React, TypeScript and Vite template.


### What changed in the MVP since v1:-

* Styled-components - Removed, They are not anymore recommended to use by Author
* Material UI - Removed, Quite heavy to use, hard to customize
* React Helmet - Removed, React 19 already supports everyhing which it does
* Redux - Removed, Verbose and old, still follows on legacy code

* Tailwindcss - Added, Utility based framework, which makes it easy to extend, AI friendly
* Shadcn UI - Added, A registry of Tailwind based components which gives handy components so do not have to start from scratch. Easy to change, update.
* Zustand - Added, FE state management, simple, light-weight, popular
* Vitest and V8-configuration -  Added for comprehensive testing and code coverage analysis.
* SonarQube- Added for continuous code quality monitoring, static code analysis, and maintaining code standards


### Future scopes:-

* Consider React Query instead of Axios
* Make one more flavour like either with Next js or just same MVP, but with less dependencies


### Extras:-

Seed project comes with simple authentication & multi-tenancy feature. If you wish to opt out of it, there are two choices go to seed generator and follow steps 1 to 8. Or follow below steps

1. Delete files from these folder (only files):- `src/components/layouts`, `src/components`, `src/pages`
2. Change `src/utils/stores`, to remove existing login store.
3. Remove routes from `src/App.tsx`.
4. Remove translations from `src/i18n/locales`.
5. Remove types from `src/utils/types.ts`.
6. Remove schemas from `src/utils/form.ts`


### MVP Generation:-

To generate a seed from scratch for partial seed follow below link https://docs.google.com/document/d/1S7YPcT39EW9NEZPlDwHTuuOKRB0IDi6qidtqLc8YUks/edit?usp=sharing

Please read first paragraph & fully understand. Let us understand that AI is assistant which will help you and not worker, which will do 100% work for you.

