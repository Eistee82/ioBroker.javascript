![Logo](admin/javascript.png)
# Javascript Script Engine

![Number of Installations](http://iobroker.live/badges/javascript-installed.svg)
![Number of Installations](http://iobroker.live/badges/javascript-stable.svg)
[![NPM version](http://img.shields.io/npm/v/iobroker.javascript.svg)](https://www.npmjs.com/package/iobroker.javascript)

![Test and Release](https://github.com/ioBroker/ioBroker.javascript/workflows/Test%20and%20Release/badge.svg)
[![Translation status](https://weblate.iobroker.net/widgets/adapters/-/javascript/svg-badge.svg)](https://weblate.iobroker.net/engage/adapters/?utm_source=widget)
[![Downloads](https://img.shields.io/npm/dm/iobroker.javascript.svg)](https://www.npmjs.com/package/iobroker.javascript)
**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.** For more details and for information how to disable the error reporting see [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Sentry reporting is used starting with js-controller 3.0.

Executes Javascript, Typescript Scripts.

## Documentation

- 🇺🇸 [Function documentation](docs/en/javascript.md)
- 🇺🇸 [Upgrade guide](docs/en/upgrade-guide.md)
- 🇩🇪 [Benutzung](docs/de/usage.md)
- Blockly
  - 🇺🇸 Here you can find the description of [blockly](docs/en/blockly.md). 
  - 🇩🇪 Hier kann man die Beschreibung von [Blockly](docs/de/blockly.md) finden. 
  - 🇷🇺 Описание по [blockly](docs/ru/blockly.md) можно найти [здесь](docs/ru/blockly.md).

## Changelog
<!--
    ### **WORK IN PROGRESS**
-->
### WORK IN PROGRESS
* (@Eistee82) AI Chat: Full Blockly integration – AI button, chat panel with split layout, live workspace resize
* (@Eistee82) AI Chat: Visual Blockly block preview in chat (dynamic height, same renderer as workspace)
* (@Eistee82) AI Chat: Blockly diff view with block-level comparison (unchanged=faded, modified=visible, new=bordered)
* (@Eistee82) AI Chat: Code mode generates Blockly XML with dedicated system prompt and block templates
* (@Eistee82) AI Chat: Insert AI-generated blocks directly into the Blockly workspace with Accept/Reject
* (@Eistee82) AI Chat: Dual context for Blockly – AI receives both generated JS (logic) and workspace XML (modifications)
* (@Eistee82) AI Chat: Single system message for all providers (fixes Gemini context issues)
* (@Eistee82) Per-provider test buttons in adapter config (OpenAI, Anthropic, Gemini, DeepSeek, Custom API)
* (@Eistee82) Optional API key field for custom base URL providers (e.g. Ollama without auth)
* (@Eistee82) Provider icons on test buttons and in model dropdown
* (@Eistee82) Human-readable HTTP error messages with API response details
* (@Eistee82) Disable reasoning/thinking for local models (reasoning_effort: none)
* (@Eistee82) Node 25 compatibility: replaced deprecated rmdirSync with rmSync in build tasks
* (@Eistee82) Removed old AI code generator (replaced by AI Chat)
* (@Eistee82) AI Chat: Added tools for scripts (search, read, list) and object info with hierarchy
* (@Eistee82) AI Chat: Markdown rendering with tables, headings, and lists
* (@Eistee82) AI Chat: Redesigned input area with Chat/Agent mode selector and pill-style toolbar
* (@Eistee82) AI Chat: Persist chat messages and input history in localStorage
* (@Eistee82) AI Chat: Dark theme and color contrast improvements using MUI theme tokens
* (@Eistee82) AI Chat: Code blocks survive theme switch (colorize instead of colorizeElement)
* (@Eistee82) AI Chat: Detect tool calls in JSON text from models without native tool support
* (@Eistee82) AI Chat: Show hint when model ignores tools in Agent mode
* (@Eistee82) AI Chat: Inline completions enabled by default
* (@Eistee82) AI Chat: Complete i18n translations for all 11 languages
* (@Eistee82) AI Chat: Cleaned up dead code, removed debug output
* (@GermanBluefox) Added support for plain import/export
* (@GermanBluefox) Correcting error in configuration
* (@GermanBluefox) disallow writing into node_modules folder by scripts
* (@GermanBluefox) Correcting start of the script more than one time if restart is triggered
* (@GermanBluefox) All delayed writings are stopped by the script stop
* (@GermanBluefox) Added check if a script has been modified by another user/window
* (@GermanBluefox) Make the instance number more prominent

### 9.1.1 (2026-03-19)
* (GermanBluefox) Small GUI optimizations
* Added support for custom OpenAI-compatible API endpoints (e.g. Ollama, LM Studio, Google Gemini, DeepSeek, OpenRouter)
* Added configurable base URL in adapter settings
* Models are now fetched dynamically from the configured API endpoint
* Added the "Test API connection" button in adapter settings
* Added error handling with user-friendly messages for unreachable providers
* Added retry functionality for failed model loading
* All API calls (models + chat) are proxied server-side to avoid CORS issues with local providers
* Strip LLM thinking artifacts from responses (for local models like Ollama)

### 9.0.18 (2026-01-11)
* (@GermanBluefox) Corrected an error message with `lastSync`
* (@klein0r) Corrected JavaScript filter

### 9.0.17 (2025-12-14)
* (@GermanBluefox) Added possibility to encrypt scripts with password (only for vendors)

### 9.0.11 (2025-07-29)
* (@GermanBluefox) Corrected the rule editor if the condition is empty
* (@GermanBluefox) Corrected types for TypeScript

### 9.0.10 (2025-07-27)
* (@klein0r) Added Blockly block to format a numeric value
* (@GermanBluefox) Fixing some blocks in blockly: cron, time
* (@GermanBluefox) Added a new block: "unconditional return"
* (@GermanBluefox) Type definitions for TypeScript were updated
* (@GermanBluefox) Corrected bug with deleting of sub-folders

## License
The MIT License (MIT)

Copyright (c) 2014-2026 bluefox <dogafox@gmail.com>,

Copyright (c) 2014      hobbyquaker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
