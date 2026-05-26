const db = require("../config/db");

async function seedOnStartup() {

  try {

    const [vehicles] = await db.query(
      "SELECT * FROM vehicles LIMIT 1"
    );

    if (vehicles.length === 0) {

      await db.query(`
        INSERT INTO vehicles
        (name, brand, price_per_day, image, availability)
        VALUES
        ('Toyota Vios', 'Toyota', 2500, '/images/vios.jpg', true),
        ('Honda Civic', 'Honda', 3500, '/images/civic.jpg', true),
        ('Ford Ranger', 'Ford', 5000, '/images/ranger.jpg', true)
      `);

      console.log("[SEED] Default vehicles inserted");

    }

  } catch (error) {

    console.error("[SEED ERROR]", error.message);

  }
}

module.exports = seedOnStartup;