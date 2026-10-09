# Commons Personality Rights Helper

A Wikimedia Commons user script that shows whether a file page carries the
[`{{Personality rights}}`](https://commons.wikimedia.org/wiki/Template:Personality_rights)
template and adds it with **one click**, placed directly above the license header.

## Features

- **Colour-coded item in the Tools menu** (right sidebar), placed just below **What links here** on every `File:` page
  - 🟢 **✔ Personality rights**: template already present (redirects like `{{Personality}}` are detected too). Links to the template page.
  - 🔴 **✚ Add Personality rights**: template missing. Click it to add the template.
  - ⏳ **Grey**: checking or saving
  - ⚠ **Orange**: the check or the edit failed. Click it to retry.
- **One-click insert** puts the template just above `=={{int:license-header}}==`:

  ```wikitext
  {{Personality rights}}

  =={{int:license-header}}==
  ```
- **Fallback**: if the page has no license header, the script asks you, then inserts the template before the categories.
- **Safe editing**: uses `mw.Api#edit`, so the edit doesn't overwrite a newer revision. It never creates pages.
- **Notification** with **View diff** and **Reload** links after a successful save.

## Installation

1. Copy `PersonalityRightsHelper.js` to `User:<YourName>/PersonalityRightsHelper.js` on Commons,
   or load it from the existing copy.
2. Add this line to your [common.js](https://commons.wikimedia.org/wiki/Special:MyPage/common.js):

   ```js
   mw.loader.load( '//commons.wikimedia.org/w/index.php?title=User:Manojk/PersonalityRightsHelper.js&action=raw&ctype=text/javascript' );
   ```
3. Do a hard refresh (Ctrl+Shift+R) and open any file page.

## Usage

Open a file page on Commons and look at the **Tools** menu in the right sidebar.
If the item below **What links here** is red, click **✚ Add Personality rights**. That's all.

> **Vector 2022 users:** the Tools menu is in the right sidebar only when it's pinned.
> If it's a dropdown, open **Tools** and choose **move to sidebar**.

Default edit summary:

```
Adding {{Personality rights}} using PersonalityRightsHelper #PersonalityRightsMatter
```

## Tracking edits

Edits made with the script can be followed on the
[Hashtags tool](https://hashtags.wmcloud.org/?query=PersonalityRightsMatter&project=commons.wikimedia.org)
by searching for `PersonalityRightsMatter`.

## When to use this template

Add `{{Personality rights}}` to photos where **identifiable people** are the subject.
It warns re-users that the subject's personality, publicity or privacy rights may restrict some uses,
independently of copyright. See
[Commons:Photographs of identifiable people](https://commons.wikimedia.org/wiki/Commons:Photographs_of_identifiable_people).

## Requirements

- A Wikimedia Commons account (edits need a logged-in, non-blocked user)
- A modern browser

## Author

[User:Manojk](https://commons.wikimedia.org/wiki/User:Manojk), Coordinator of Wiki Conference Kerala
