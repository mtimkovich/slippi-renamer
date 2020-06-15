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
function playerName(player, metadata) {
  const character = slp.characters.getCharacterName(player.characterId);
  const color = slp.characters.getCharacterColorName(player.characterId, player.characterColor);
  let playerIds = [];

  if (player.nametag) {
    playerIds.push(player.nametag);
  } else if (color !== 'Default') {
    playerIds.push(color);
  }
  if (metadata && metadata.names.netplay !== 'Player' && metadata.names.netplay !== undefined) {
    playerIds.push(metadata.names.netplay);
  }

  if (playerIds.length > 0) {
    return `${character} (${playerIds.join(',')})`;
  } else {
    return character;
  }
}

function prettyPrintTeams(settings, metadata) {
  const stage = slp.stages.getStageName(settings.stageId);
  const teams = new Map();
  for (let i = 0; i < settings.players.length; i++) {
    let player = settings.players[i];
    if (!teams.has(player.teamId)) {
      teams.set(player.teamId, []);
    }
    if (metadata) {
      teams.get(player.teamId).push(playerName(player, metadata.players[i]));
    } else {
      teams.get(player.teamId).push(playerName(player));
    }
  }

  const pretty = Array.from(teams.values())
                      .map(team => team.join(' & '))
                      .join(' vs ');
  return `${pretty} - ${stage}`;
}

function prettyPrintSingles(settings, metadata) {
  // kind of annoying that some games don't have metadata
  let player1, player2;
  if (metadata) {
    player1 = playerName(settings.players[0], metadata.players[0]);
    player2 = playerName(settings.players[1], metadata.players[1]);
  } else {
    player1 = playerName(settings.players[0]);
    player2 = playerName(settings.players[1]);
  }
  const stage = slp.stages.getStageName(settings.stageId);

  return `${player1} vs ${player2} - ${stage}`;
}

function parsedFilename(settings, metadata, file) {
  const dateRegex = file.match('_([^\.]+)');

  if (!dateRegex) {
    return null;
  }

  let pretty = null;

  if (settings.isTeams) {
    pretty = prettyPrintTeams(settings, metadata);
  } else {
    pretty = prettyPrintSingles(settings, metadata);
  }
  if (!pretty) {
    return null;
  }

  return `${dateRegex[1]} - ${pretty}.slp`
}

const directories = argv._;

for (const dir of directories) {
  const stats = fs.lstat(dir, (err, stats) => {
    if (err || !stats.isDirectory()) {
      console.log(`${dir} is not a directory, skipping.`);
      return;
    }

    fs.readdir(dir, (err, files) => {
      if (err) {
        console.log(err);
        return;
      }

      for (const file of files) {
        const filePath = path.join(dir, file);

        if (!file.match('\.slp$')) {
          console.log(`'${file}' skipped.`);
          continue;
        }

        const game = new SlippiGame(filePath);
        const settings = game.getSettings();
        const metadata = game.getMetadata();

        const newName = parsedFilename(settings, metadata, file);
        if (!newName) {
          console.log(`Error parsing '${file}'`);
          continue;
        }

        const newPath = path.join(dir, newName);
        if (!argv.n) {
          fs.rename(filePath, newPath, err => {
            if (err) {
              console.log(`Error renaming ${filePath}: ${err}`);
            } else {
              console.log(`Renamed: ${filePath} -> ${newPath}`);
            }
          });
        } else {
          console.log(`${filePath} -> ${newPath}`);
        }
      }
    })
  });
}
