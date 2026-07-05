const db = require("./database");

const tables = {
  projects: `
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectName TEXT NOT NULL,
      clientName TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      eventType TEXT,
      location TEXT,
      startDate TEXT,
      endDate TEXT,
      totalAmount REAL DEFAULT 0,
      advance REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      status TEXT DEFAULT 'Upcoming',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  payments: `
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      amount REAL NOT NULL,
      paymentDate TEXT NOT NULL,
      paymentMode TEXT,
      remarks TEXT,
      referenceNumber TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(projectId) REFERENCES projects(id)
    )
  `,
  clients: `
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      gst TEXT,
      totalProjects INTEGER DEFAULT 0,
      totalRevenue REAL DEFAULT 0,
      pendingAmount REAL DEFAULT 0,
      status TEXT DEFAULT 'Active',
      city TEXT,
      state TEXT,
      zipCode TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  events: `
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      eventName TEXT NOT NULL,
      eventType TEXT,
      eventDate TEXT NOT NULL,
      startTime TEXT,
      endTime TEXT,
      venue TEXT,
      mapsLink TEXT,
      status TEXT DEFAULT 'Scheduled',
      assignedTeam TEXT,
      equipmentRequired TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(projectId) REFERENCES projects(id)
    )
  `,
  employees: `
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      role TEXT,
      availability TEXT,
      skills TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  editing_tasks: `
    CREATE TABLE IF NOT EXISTS editing_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      taskType TEXT,
      status TEXT DEFAULT 'Pending',
      percentage INTEGER DEFAULT 0,
      deadline TEXT,
      assignedEditor TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(projectId) REFERENCES projects(id)
    )
  `,
  deliveries: `
    CREATE TABLE IF NOT EXISTS deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      albumDelivered BOOLEAN DEFAULT 0,
      videoDelivered BOOLEAN DEFAULT 0,
      rawDataDelivered BOOLEAN DEFAULT 0,
      googleDriveShared BOOLEAN DEFAULT 0,
      clientApproved BOOLEAN DEFAULT 0,
      finalPaymentReceived BOOLEAN DEFAULT 0,
      deliveryDate TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(projectId) REFERENCES projects(id)
    )
  `,
  notes: `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      noteText TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(projectId) REFERENCES projects(id)
    )
  `,
  timeline: `
    CREATE TABLE IF NOT EXISTS timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      action TEXT NOT NULL,
      description TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(projectId) REFERENCES projects(id)
    )
  `,
};

const columns = {
  projects: [
    ["updatedAt", "DATETIME"],
  ],
  payments: [
    ["referenceNumber", "TEXT"],
    ["updatedAt", "DATETIME"],
  ],
  clients: [
    ["phone", "TEXT"],
    ["email", "TEXT"],
    ["address", "TEXT"],
    ["gst", "TEXT"],
    ["totalProjects", "INTEGER DEFAULT 0"],
    ["totalRevenue", "REAL DEFAULT 0"],
    ["pendingAmount", "REAL DEFAULT 0"],
    ["status", "TEXT DEFAULT 'Active'"],
    ["city", "TEXT"],
    ["state", "TEXT"],
    ["zipCode", "TEXT"],
    ["notes", "TEXT"],
    ["updatedAt", "DATETIME"],
  ],
  events: [
    ["eventType", "TEXT"],
    ["startTime", "TEXT"],
    ["endTime", "TEXT"],
    ["venue", "TEXT"],
    ["mapsLink", "TEXT"],
    ["status", "TEXT DEFAULT 'Scheduled'"],
    ["assignedTeam", "TEXT"],
    ["equipmentRequired", "TEXT"],
    ["notes", "TEXT"],
    ["updatedAt", "DATETIME"],
  ],
};

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function addMissingColumns(table, definitions) {
  const tableInfo = await all(`PRAGMA table_info(${table})`);
  const existing = new Set(tableInfo.map((column) => column.name));

  for (const [name, definition] of definitions) {
    if (!existing.has(name)) {
      await run(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
      console.log(`Added ${table}.${name}`);
    }
  }
}

async function migrate() {
  for (const createTableSql of Object.values(tables)) {
    await run(createTableSql);
  }

  for (const [table, definitions] of Object.entries(columns)) {
    await addMissingColumns(table, definitions);
  }

  console.log("Database migration complete.");
}

migrate()
  .catch((err) => {
    console.error("Database migration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    db.close();
  });
