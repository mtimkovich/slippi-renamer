#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const process = require('process');
const slp = require('slp-parser-js');
const { default: SlippiGame } = require('slp-parser-js');

// Return character with their tag in quotes (if they have one).
function playerName(player) {
  const character = slp.characters.getCharacterInfo(player.characterId).name;
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

  return `${player1} vs ${player2} - ${slp.stages.getStageName(settings.stageId)}`;
}

function parsedFilename(settings, file) {
  const dateRegex = file.match('_([^\.]+)');

  if (!dateRegex) {
    return null;
  }

  return `${dateRegex[1]} - ${prettyPrint(settings)}.slp`
}

const files = process.argv.splice(2);

if (!files) {
  console.log('Usage: parse.js DIRECTORY');
  process.exit();
}

for (const filePath of files) {
  const dir = path.dirname(filePath);
  const file = path.basename(filePath);

  if (!file.match('\.slp$')) {
    console.log(`'${file}' skipped.`);
    continue;
  }

  const game = new SlippiGame(filePath);
  const settings = game.getSettings();

  const newName = parsedFilename(settings, file);
  const newPath = path.join(dir, newName);
  if (!newName) {
    console.log(`Invalid input filename '${file}'`);
    continue;
  }
  console.log(`${filePath} -> ${newPath}`);
  fs.rename(filePath, newPath, (err) => {
    if (err) {
      console.log(`Error renaming ${filePath}: ${err}`);
    }
  });
}
