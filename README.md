# Slippi Renamer

Rename Slippi (.slp) game files to include characters, tags, colors, and stage.

Given a folder of `*.slp` files as input, it will rename the files from:

**Singles:**
```
Game_20190530T222709.slp -> 20190530T222709 - Marth (BRY) vs Fox - Battlefield.slp
```

**Doubles:**
```
Game_20190521T212659.slp -> 20190521T212659 - Falco & Marth vs Fox (DJ) & Fox (SWRV) - Yoshi's Story.slp
```

## Installation

```
npm install
```

## Usage

FOLDER is a directory full of `*.slp` files.

```
node slp_rename.js FOLDER
```


## Changelog

### 1.2.0
- Handle non-standard teams.
- Better error handling.

### 1.1.1
- Takes directories as arguments instead of files to better work on Windows.

### 1.1.0
- Show character colors for players without tags.
- Don't rename files that we have trouble parsing.
- Better command line parsing
  - `-n` flag to run the script without performing any renaming.

## Authors

Max "DJSwerve" Timkovich
