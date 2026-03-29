export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    console.log('Chargement des ressources...')
  }

  create() {
    this.scene.start('GalaxyScene')
  }
}
