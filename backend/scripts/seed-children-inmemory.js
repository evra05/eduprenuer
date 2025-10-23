const InMemoryChild = require('../src/models/InMemoryChild');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/children.json');

const seedChildren = async () => {
  try {
    console.log('🌱 Seeding children data...');
    
    // Check if data file exists
    if (!fs.existsSync(DATA_FILE)) {
      console.log('📁 No children data file found, skipping...');
      return;
    }

    // Read existing data
    const existingData = fs.readFileSync(DATA_FILE, 'utf8');
    const childrenData = JSON.parse(existingData);

    if (!Array.isArray(childrenData) || childrenData.length === 0) {
      console.log('📁 No children data to seed');
      return;
    }

    // Clear existing in-memory data
    InMemoryChild.saveChildren([]);
    console.log('🗑️ Cleared existing children data');

    // Load children into in-memory storage
    for (const childData of childrenData) {
      const child = new InMemoryChild(childData);
      await child.save();
    }

    console.log(`✅ Inserted ${childrenData.length} children`);
    console.log('🎉 Children seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding children:', error);
  }
};

module.exports = { seedChildren };

// Run if called directly
if (require.main === module) {
  seedChildren().then(() => {
    console.log('Children seeding completed');
    process.exit(0);
  }).catch(error => {
    console.error('Children seeding failed:', error);
    process.exit(1);
  });
}
