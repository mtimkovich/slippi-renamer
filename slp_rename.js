#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const slp = require('slp-parser-js');
const { default: SlippiGame } = require('slp-parser-js');
const argv = require('yargs')
      .usage('Usage $0 [options] <directories>')
      .demandCommand(1, 'You must provide directories to rename.')
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

function prettyPrintTeams(settings) {
  const stage = slp.stages.getStageName(settings.stageId);
  const teams = new Map();
  for (const player of settings.players) {
    if (!teams.has(player.teamId)) {
      teams.set(player.teamId, []);
    }
    teams.get(player.teamId).push(playerName(player));
  }

  const pretty = Array.from(teams.values())
                      .map(team => team.join(' & '))
                      .join(' vs ');
  return `${pretty} - ${stage}`;
}

function prettyPrintSingles(settings) {
  const player1 = playerName(settings.players[0]);
  const player2 = playerName(settings.players[1]);
  const stage = slp.stages.getStageName(settings.stageId);

  return `${player1} vs ${player2} - ${stage}`;
}

function parsedFilename(settings, file) {
  const dateRegex = file.match('_([^\.]+)');

  if (!dateRegex) {
    return null;
  }

  let pretty = null;

  if (settings.isTeams) {
    pretty = prettyPrintTeams(settings);
  } else {
    pretty = prettyPrintSingles(settings);
  }
  if (!pretty) {
    return null;
  }

  return `${dateRegex[1]} - ${pretty}.slp`
}

const directories = argv._;

for (const dir of directories) {
  const stats = fs.lstatSync(dir);
  if (!stats.isDirectory()) {
    console.log(`${dir} is not a directory, skipping.`);
    continue;
  }

  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);

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
}
