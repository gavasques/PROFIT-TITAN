// Test environment variables loading
require('dotenv').config();

console.log('🔍 Environment Variables Check:');
console.log('================================');

const vars = [
  'DATABASE_URL',
  'PGHOST', 
  'PGPORT',
  'PGDATABASE',
  'PGUSER',
  'PGPASSWORD'
];

vars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive data
    if (varName.includes('PASSWORD') || varName.includes('URL')) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

// Test connection string building
if (!process.env.DATABASE_URL) {
  const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
  
  if (PGHOST && PGDATABASE && PGUSER && PGPASSWORD) {
    const port = PGPORT || '5432';
    const builtUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${port}/${PGDATABASE}?sslmode=require`;
    console.log(`\n🔗 Built connection string: postgresql://${PGUSER}:***@${PGHOST}:${port}/${PGDATABASE}`);
  } else {
    console.log('\n❌ Missing required PG variables to build connection string');
  }
} else {
  console.log('\n🔗 Using DATABASE_URL');
}