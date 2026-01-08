# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.12.0] - 2025-01-08

### Added
- Full TypeScript migration with complete type definitions
- Stack overflow protection with cycle detection using WeakSet
- Depth limits for tree traversal (`DEFAULT_MAX_DEPTH = 1000`)
- Iteration limits for searches (`MAX_SEARCH_ITERATIONS = 100000`)
- Sibling traversal limits (`MAX_SIBLINGS = 10000`)
- New type exports: `RESQNode`, `FiberNode`, `FilterOptions`
- Cycle detection tests for safety verification
- Declaration maps for better IDE support

### Changed
- Source code migrated from JavaScript to TypeScript
- Improved `byProps()` and `byState()` method types
- Better handling of circular references in React Fiber trees
- Updated build configuration (tsconfig.json, webpack, babel, jest)

### Fixed
- **Critical**: "Maximum call stack size exceeded" errors when traversing deep or circular component trees
- Circular parent references (`element.return`) no longer cause infinite recursion
- Circular sibling references are now properly detected and handled

## [1.11.0] - 2024-XX-XX

### Added
- Support for constructor name in element search

## [1.10.2] - 2024-XX-XX

### Fixed
- Bug fixes and improvements

## [1.10.0] - 2024-XX-XX

### Added
- Support for React 18
- `__reactContainer` key detection

## [1.9.0] - 2024-XX-XX

### Added
- Support for React 17
- `__reactFiber` key detection
- Improved displayName handling

## [1.8.0] - 2024-XX-XX

### Added
- Improved Higher-Order Component (HoC) handling
- `stripHoCFromName` utility function
