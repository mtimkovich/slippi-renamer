#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
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

function stageName(settings) {
  if (settings.stageId in STAGE_IDS) {
    return STAGE_IDS[settings.stageId];
  }

  return 'Illegal Stage';
}

const DIR = '2019-05-30 MTV Melee 119/Drive #2';

fs.readdir(DIR, (err, files) => {
  for (const file of files) {
    const filepath = path.join(DIR, file);
    const game = new SlippiGame(filepath);

    // Get game settings – stage, characters, etc
    const settings = game.getSettings();

    console.log('File: ' + filepath);
    console.log('Stage: ' + stageName(settings));

    for (const player of settings.players) {
      if (player.nametag) {
        console.log('Tag: ' + player.nametag);
      }
      console.log('Character: ' + CHARACTER_IDS[player.characterId]);
    }

    console.log();
  }
});
