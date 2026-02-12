# [1.0.0](https://github.com/zhravan/justadrop.xyz/compare/v1.0.8...v1.0.0) (2026-02-12)



# [1.0.0](https://github.com/zhravan/justadrop.xyz/compare/v1.0.7...v1.0.0) (2026-02-12)



# [1.0.0](https://github.com/zhravan/justadrop.xyz/compare/v1.0.6...v1.0.0) (2026-02-12)



# [1.0.0](https://github.com/zhravan/justadrop.xyz/compare/v1.0.5...v1.0.0) (2025-12-29)


### Features

* authentication error handling ([4a6f87b](https://github.com/zhravan/justadrop.xyz/commit/4a6f87b43fd6110ab6bec321f758c23e075f802a))
* refresh token flow ([1ea6891](https://github.com/zhravan/justadrop.xyz/commit/1ea68911144d8e13a7afe974ceda93d122bc265b))
* trigger build ([8b70584](https://github.com/zhravan/justadrop.xyz/commit/8b70584e45f74d937cb04ddc68ff091e4d9dbda7))



# [1.0.0](https://github.com/zhravan/justadrop.xyz/compare/v1.0.4...v1.0.0) (2025-12-02)



# [1.0.0](https://github.com/zhravan/justadrop.xyz/compare/v1.0.3...v1.0.0) (2025-12-02)



# [1.0.0](https://github.com/zhravan/justadrop.xyz/compare/v1.0.2...v1.0.0) (2025-12-02)



# [1.0.0](https://github.com/zhravan/justadrop.xyz/compare/v1.0.1...v1.0.0) (2025-12-02)


### Features

* changelogs added ([e461588](https://github.com/zhravan/justadrop.xyz/commit/e461588555aa7ac9d1cd5ac63c0b9a86e55104d5))



# Changelog

## 1.0.0 (2025-12-02)

### Added
- Shared validation module for opportunity creation (`packages/types/src/validation.ts`)
- Real-time form validation with character counts and inline error messages
- Comprehensive validation for all opportunity fields (title, description, location, dates, contact)

### Changed
- Backend routes now use shared validation constants from `@justadrop/types`
- Opportunity service uses comprehensive validation functions
- Updated `.gitignore` with additional patterns for IDE, cache, and temp files

### Fixed
- Authentication issue in opportunity creation endpoint (manual JWT decoding workaround)

---

# 1.0.0 (2025-11-27)


### Bug Fixes

* add changelog.md file if doesnt exist ([c9ba5f2](https://github.com/zhravan/justadrop.xyz/commit/c9ba5f285ca672969484555d1b892e3ec733fe35))
* add changelog.md file if doesnt exist ([0cc4bfc](https://github.com/zhravan/justadrop.xyz/commit/0cc4bfc260367c5471df0e33ffd3fad427a23ba9))
* github workflow for generating changelogs ([c10ac99](https://github.com/zhravan/justadrop.xyz/commit/c10ac99302ae0b4bd86e38157f14baef6c64b832))
* tag release via changelog workflow ([9a0474a](https://github.com/zhravan/justadrop.xyz/commit/9a0474af251d2ae01e407b03ede4c180a5407236))


### Features

* boilerplate base setup ([#1](https://github.com/zhravan/justadrop.xyz/issues/1)) ([4ca23fe](https://github.com/zhravan/justadrop.xyz/commit/4ca23fe4d88bcf320185824a8551db92c6d14c20))
* header component change based on login state ([89d2a6a](https://github.com/zhravan/justadrop.xyz/commit/89d2a6a7ea7dc47f5f8f9202701103ee06bf710e))
* intg openapi plugin ([602e687](https://github.com/zhravan/justadrop.xyz/commit/602e6874423e70146265d3d3dfa614f711fa8346))
* modify scripts to manage mono repo ([d7b1b92](https://github.com/zhravan/justadrop.xyz/commit/d7b1b92d866a5c523a2b5ca9f3366e1d061509e4))
* ngo sign up workflow ([da81716](https://github.com/zhravan/justadrop.xyz/commit/da8171637bfcf2a3fd519e18d09956a485ea3d34))
* remove register/sign in page once already signed in ([3a45a35](https://github.com/zhravan/justadrop.xyz/commit/3a45a35cfae41c17effae79705b7074ed776e381))
* resend email intg ([#3](https://github.com/zhravan/justadrop.xyz/issues/3)) ([40be9c8](https://github.com/zhravan/justadrop.xyz/commit/40be9c87c1725d8a782f6713139bd0c60cefb406))
* rregister organization workflow ([c590a63](https://github.com/zhravan/justadrop.xyz/commit/c590a632a09412b7fbc63edcfb6e573ada729e8d))
* signin and signup for org/volunteers/admin seeding ([#2](https://github.com/zhravan/justadrop.xyz/issues/2)) ([ec83054](https://github.com/zhravan/justadrop.xyz/commit/ec8305499e0be186006d6a2e613a85eb6955bef2))
* **ui:** add about us screen for justadrop.xyz ([2fd38a3](https://github.com/zhravan/justadrop.xyz/commit/2fd38a376fb4896ea044b05f6ea4b2680fb913b7))
* **ui:** add modal component ([00256b5](https://github.com/zhravan/justadrop.xyz/commit/00256b552e1fab7f87f894d9799d602e624fa935))
* **ui:** cleanup logs ([389a5ba](https://github.com/zhravan/justadrop.xyz/commit/389a5baa6983862a1e44704a15889a0206cddeb4))
* **ui:** CTA section conditional on sign in ([c5344cd](https://github.com/zhravan/justadrop.xyz/commit/c5344cd9ba9d3d2050ca7630fa1e5391e5b13a97))
* **ui:** filter section mobile responsive ([2c4af9c](https://github.com/zhravan/justadrop.xyz/commit/2c4af9c36d2c4234481bc0e61a165171b6f43ea1))
* **ui:** improve ui card preview for opportunity listing ([be28d64](https://github.com/zhravan/justadrop.xyz/commit/be28d64fab87f60b9a92bb35ca3e6ec465df97f3))
* **ui:** intg sonner ui ([e198744](https://github.com/zhravan/justadrop.xyz/commit/e198744737f0f279d47537c0e19f0ecf7d75e632))
* **ui:** landing page with shadcn/ui and theme system ([#4](https://github.com/zhravan/justadrop.xyz/issues/4)) ([e0d8255](https://github.com/zhravan/justadrop.xyz/commit/e0d8255acfdfed80a5b6209a96207f3a8ed30b37))
* **ui:** mobile responsive on modal ui ([4694b85](https://github.com/zhravan/justadrop.xyz/commit/4694b855640ec68c21ede3a133904de66d0e9679))
* **ui:** preview opportunity listing & post opportunity ([b652e78](https://github.com/zhravan/justadrop.xyz/commit/b652e787417d693d5f27373a62c462ae43c8f988))
* **ui:** redesign ui similar to volunteer listing screen ([8be9321](https://github.com/zhravan/justadrop.xyz/commit/8be9321d435174c877302de017f5f3e4da6ae2ed))
* **ui:** show volunteer details on modal ([7addc03](https://github.com/zhravan/justadrop.xyz/commit/7addc03d4c03a3484769d3d1afb564b2523617e1))
* **ui:** xs breakpoint to the theme.extend.screens section ([9afb105](https://github.com/zhravan/justadrop.xyz/commit/9afb10515b6248213e209dff7c89e6ac89ec7fac))
* volunteer listing page ([9c814bf](https://github.com/zhravan/justadrop.xyz/commit/9c814bf6b6838f9cfbb5588feec6985dec69c07a))
* volunteer registration workflow integration with email verification ([5169ad3](https://github.com/zhravan/justadrop.xyz/commit/5169ad366bafb7c52083629e4ac431912e1d8318))
* volunteer sign in ([6c83a7e](https://github.com/zhravan/justadrop.xyz/commit/6c83a7ec0f5d14519aca8b051e91ef76b1b8d7c9))
* volunteers registration ([163768a](https://github.com/zhravan/justadrop.xyz/commit/163768a940768f81df4f307a6da635cbb82592a4))



