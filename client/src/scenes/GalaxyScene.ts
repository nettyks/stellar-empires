export class GalaxyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GalaxyScene' })
  }

  create() {
    this.createStarField()

    const { width, height } = this.scale
    this.add.text(width / 2, height / 2 - 60, '🌌 STELLAR EMPIRES', {
      fontSize: '42px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#4488ff',
      strokeThickness: 2
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2, 'Jeu en cours de construction...', {
      fontSize: '18px',
      color: '#aaaacc',
      fontFamily: 'monospace'
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 50, 'Stratégie · Économie · Gestion · Espace', {
      fontSize: '14px',
      color: '#556688',
      fontFamily: 'monospace'
    }).setOrigin(0.5)
  }

  private createStarField() {
    const { width, height } = this.scale
    const graphics = this.add.graphics()
    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const size = Math.random() < 0.9 ? 1 : 2
      const alpha = Phaser.Math.FloatBetween(0.3, 1)
      graphics.fillStyle(0xffffff, alpha)
      graphics.fillRect(x, y, size, size)
    }
  }
}
