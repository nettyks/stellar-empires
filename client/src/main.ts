import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GalaxyScene } from './scenes/GalaxyScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game',
  backgroundColor: '#050510',
  scene: [BootScene, GalaxyScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
}

new Phaser.Game(config)
