#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const slp = require('slp-parser-js');
const { default: SlippiGame } = require('slp-parser-js');
const argv = require('yargs')
      .usage('Usage $0 [options] <files>')
      .demandCommand(1, 'You must provide files to rename.')
      .boolean('n')
      .describe('n', 'perform a trial run without renaming')
      .help('h')
      .argv

/** Returns character with their tag or color in parentheses (if they have either). */
function playerName(player) {
  const character = slp.characters.getCharacterName(player.characterId);
  const color = slp.characters.getCharacterColorName(player.characterId, player.characterColor);

  if (player.nametag) {
    return `${character} (${player.nametag})`;
  } else if (color !== 'Default') {
    return `${character} (${color})`;
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

    // Something's wrong with this teams game.
    if (teams.length !== 2) {
      return null;
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

  const pretty = prettyPrint(settings);
  if (!pretty) {
    return null;
  }

  return `${dateRegex[1]} - ${pretty}.slp`
}

const files = argv._;

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
  if (!newName) {
    console.log(`Error parsing '${file}'`);
    continue;
  }

  const newPath = path.join(dir, newName);
  console.log(`${filePath} -> ${newPath}`);

  if (!argv.n) {
    fs.rename(filePath, newPath, err => {
      if (err) {
        console.log(`Error renaming ${filePath}: ${err}`);
      }
    });
  }
}
