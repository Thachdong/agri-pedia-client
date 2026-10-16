# Plan — disease-articles

Feature: article | Pages: /benh-cay-trong, /benh-cay-trong/[crop], /benh-cay-trong/[crop]/[slug] (ISR, public) + /diseases/[code] → 308
Spec: specs/disease-articles-plan.md (no mockup — layout from spec §4)
API: GET /knowledge/articles/crops, GET /knowledge/articles, GET /knowledge/articles/{cropSlug}/{slug}, GET /knowledge/articles/sitemap, GET /knowledge/diseases/{code} (+ `article`)

- [x] 1. [data-wrapper]       `npm run gen:api`; http `next` option (revalidate/tags) → fetch; `publicServerHttp` (server-only, no cookie); env `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL` (+ .env.example)
- [x] 2. [design-token]       `@tailwindcss/typography` plugin + `prose` colors mapped to shadcn tokens
- [x] 3. [feature-scaffold]   feature `article` — layers: types, constants, services, hooks, utils, components
- [x] 4. [feature-api]        GET /knowledge/articles/crops → TArticleCrop, listArticleCrops (server fetch, tag `articles`)
- [x] 5. [feature-api]        GET /knowledge/articles → TArticleListItem, listArticles; useArticleList (infinite, client BFF); key articles.list(crop, category)
- [x] 6. [feature-api]        GET /knowledge/articles/{cropSlug}/{slug} → TArticleDetail, getArticle (tag `article:<crop>:<slug>`)
- [x] 7. [feature-api]        GET /knowledge/articles/sitemap → TArticleSitemap, getArticleSitemap
- [x] 8. [feature-api]        GET /knowledge/diseases/{code}: TDisease gets `article`; getDiseaseArticlePath (public, tag `article-disease:<CODE>`)
- [x] 9. [shared-unit]        util remarkArticleDirectives (warning/tip/disease-card/cta-diagnosis, others dropped) — install react-markdown, remark-gfm, remark-directive, unist-util-visit
- [x] 10. [shared-unit]       util remarkHeadingIds + extractArticleToc (h2/h3, Vietnamese de-accent slug, github-slugger)
- [x] 11. [shared-unit]       util articleJsonLd (Article + BreadcrumbList, escape `<`)
- [x] 12. [atomic-component]  molecule  ImageLightbox      (move diagnosis → shared)
- [x] 13. [atomic-component]  molecule  Breadcrumb        (new, shared)
- [x] 14. [atomic-component]  molecule  CategoryPlaceholder (new, feature — icon block per DISEASE/PEST/DISORDER, used when no cover)
- [x] 15. [atomic-component]  molecule  ArticleMeta       (new, feature — updatedAt, reviewedBy/AI, verification badge)
- [x] 16. [atomic-component]  molecule  DraftBanner       (new, feature — Callout)
- [x] 17. [atomic-component]  molecule  ArticleFigure     (new, feature — next/image + caption/credit + lightbox; next.config images.remotePatterns moved here from 34)
- [x] 18. [atomic-component]  molecule  DiseaseCard       (new, feature — related disease, path null → no link)
- [x] 18b. [bff-auth]         GET /api/auth/session → { signedIn } (cookie only, no NestJS) + sessionQuery/useSession (features/auth) — public pages must not hit /users/me (SESSION_EXPIRED → redirect /login)
- [x] 19. [atomic-component]  molecule  ArticleCtaButton  (new, feature, client — diagnosisEnabled; guest → LoginRequiredDialog)
- [x] 20. [atomic-component]  molecule  ArticleCard       (new, feature — cover/placeholder, title, scientific name, summary 2 lines, DRAFT badge)
- [x] 21. [atomic-component]  molecule  ArticleCropCard   (new, feature — name, article count)
- [x] 22. [atomic-component]  organism  ArticleDiseaseInfo (new, feature — scientific name, category, affected parts, aliases)
- [x] 23. [atomic-component]  organism  ArticleToc        (new, feature — h2 list; mobile collapsed)
- [x] 24. [atomic-component]  organism  ArticleSources    (new, feature — sources + image credits)
- [x] 25. [atomic-component]  organism  RelatedDiseaseList (new, feature)
- [x] 26. [atomic-component]  organism  ArticleMarkdown   (new, feature, server — prose + component map)
- [x] 27. [atomic-component]  organism  ArticleList       (new, feature, client — category tabs + "Xem thêm")
- [x] 28. [atomic-component]  organism  SessionHeaderActions (new, feature auth, client — useSession; slots signedIn/guest to avoid user↔chat import cycle; same-size skeleton)
- [x] 29. [page]              root layout SEO: `lang="vi"`, metadataBase/title template/description, Geist subset `vietnamese`
- [x] 30. [page]              /benh-cay-trong/[crop]/[slug] — ISR, generateMetadata (canonical, OG, noindex DRAFT), JSON-LD, not-found, error; + layout /benh-cay-trong (SessionHeaderActions), organism ArticleDetail; home moved to (home) group so its loading.tsx no longer streams every route (real 404)
- [x] 31. [page]              /benh-cay-trong/[crop] — ISR, first page server + ArticleList, not-found
- [x] 32. [page]              /benh-cay-trong — ISR, crop cards; link "Bệnh cây trồng" in home / header
- [x] 33. [page]              /diseases/[code] → permanentRedirect(article.path) / notFound(); drop loading/error; "Đọc bài viết đầy đủ" in disease-report-dialog
- [ ] 34. [page]              /api/revalidate (secret timingSafeEqual, tag regex, revalidateTag(tag, "max")), sitemap.ts, robots.ts
- [ ] 35. [arch-review]       + build check: 3 routes ISR (not ƒ)

Components (in order):
  [molecule]  Callout              reuse  shared
  [atom]      Badge / Button       reuse  shared
  [molecule]  LoginRequiredDialog  reuse  shared
  [molecule]  ImageLightbox        move   shared
  [molecule]  Breadcrumb           new    shared
  [molecule]  CategoryPlaceholder  new    feature
  [molecule]  ArticleMeta          new    feature
  [molecule]  DraftBanner          new    feature
  [molecule]  ArticleFigure        new    feature
  [molecule]  DiseaseCard          new    feature
  [molecule]  ArticleCtaButton     new    feature
  [molecule]  ArticleCard          new    feature
  [molecule]  ArticleCropCard      new    feature
  [organism]  ArticleDiseaseInfo   new    feature
  [organism]  ArticleToc           new    feature
  [organism]  ArticleSources       new    feature
  [organism]  RelatedDiseaseList   new    feature
  [organism]  ArticleMarkdown      new    feature
  [organism]  ArticleList          new    feature
  [organism]  SessionHeaderActions new    feature (user)
  [organism]  SiteHeader           reuse  shared
  [template]  ContentLayout        reuse  shared
  [page]      ArticlePage / ArticleCropPage / ArticleCropsPage / diseases redirect

Open questions:
- Placeholder ảnh theo category: CategoryPlaceholder (icon lucide + token bg, 16:9), không dùng file webp (đã chốt — cách A).
- Scope bước 34: giữ trong feature này (đã chốt).
