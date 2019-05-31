#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const process = require('process');
const { default: SlippiGame } = require('slp-parser-js');

const CHARACTER_IDS = {
  0: 'Captain Falcon',
  1: 'Donkey Kong',
  2: 'Fox',
  3: 'Game & Watch',
  4: 'Kirby',
  5: 'Bowser',
  6: 'Link',
  7: 'Luigi',
  8: 'Mario',
  9: 'Marth',
  10: 'Mewtwo',
  11: 'Ness',
  12: 'Peach',
  13: 'Pikachu',
  14: 'Ice Climbers',
  15: 'Jigglypuff',
  16: 'Samus',
  17: 'Yoshi',
  18: 'Zelda',
  19: 'Sheik',
  20: 'Falco',
  21: 'Young Link',
  22: 'Dr. Mario',
  23: 'Roy',
  24: 'Pichu',
  25: 'Ganondorf',
  26: 'Master Hand',
};

const STAGE_IDS = {
  2: 'Fountain of Dreams',
  3: 'Pokemon Stadium',
  8: "Yoshi's Story",
  23: 'Pokefloats',
  28: 'Dream Land',
  31: 'Battlefield',
  32: 'Final Destination',
};

// Convert stageId into its name.
function stageName(settings) {
  if (settings.stageId in STAGE_IDS) {
    return STAGE_IDS[settings.stageId];
  }

  return 'Illegal Stage';
}

// Return character with their tag in quotes (if they have one).
function playerName(player) {
  const character = CHARACTER_IDS[player.characterId];
  if (player.nametag) {
    return `${character} (${player.nametag})`;
  }

  return character;
}

function prettyPrint(settings) {
  let player1;
  let player2;

  if (settings.isTeams) {
    let teams = {};
    for (const player of settings.players) {
      if (!(player.teamId in teams)) {
        teams[player.teamId] = [];
      }
      teams[player.teamId].push(playerName(player));
    }

    player1 = teams[0].join(' & ');
    player2 = teams[1].join(' & ');
  } else {
    player1 = playerName(settings.players[0]);
    player2 = playerName(settings.players[1]);
  }

  return `${player1} vs ${player2} - ${stageName(settings)}`;
}

function parsedFilename(settings, file) {
  const date = file.match('_([^\.]+)')[1];

  return `${date} - ${prettyPrint(settings)}.slp`
}

const args = process.argv.splice(2);

if (!args) {
  console.log('Usage: parse.js DIRECTORY');
  process.exit();
}

for (const dir of args) {
  if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
    console.log(`Directory '${dir}' does not exist.`);
    continue;
  }

  fs.readdir(dir, (err, files) => {
    if (err) {
      console.log(`Error reading ${dir}: ${err}`);
      return;
    }

    for (const file of files) {
      if (!file.match('\.slp$')) {
        continue;
      }

      const game = new SlippiGame(path.join(dir, file));

      // Get game settings – stage, characters, etc
      const settings = game.getSettings();

      const newName = parsedFilename(settings, file);
      console.log(`${file} -> ${newName}`);
      fs.rename(path.join(dir, file), path.join(dir, newName), (err) => {
        if (err) {
          console.log(`Error renaming ${file}: ${err}`);
        }
      });
    }
  });
}
