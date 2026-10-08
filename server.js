const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================
   MIDDLEWARE
========================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));


/* =========================================
   SUPABASE
========================================= */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
} else {
  console.log("Supabase environment variables detected.");
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);


/* =========================================
   PLAYER GAME PAGE
========================================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


/* =========================================
   ADMIN PAGE
========================================= */

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});


/* =========================================
   HEALTH CHECK
========================================= */

app.get("/api/health", (req, res) => {

  res.json({
    success: true,
    application: "Abuja Life",
    server: "online",
    time: new Date().toISOString()
  });

});


/* =========================================
   TEST SUPABASE CONNECTION
========================================= */

app.get("/api/database-test", async (req, res) => {

  try {

    /*
      We intentionally don't modify
      anything in the database here.

      This endpoint only checks whether
      the server can communicate with Supabase.
    */

    const { data, error } = await supabase
      .from("game_settings")
      .select("*")
      .limit(1);

    if (error) {

      return res.status(500).json({
        success: false,
        message: "Supabase connection reached, but the table/query failed.",
        error: error.message
      });

    }

    res.json({
      success: true,
      message: "Server successfully connected to Supabase.",
      data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Database test failed.",
      error: error.message
    });

  }

});


/* =========================================
   GAME SETTINGS
========================================= */

app.get("/api/settings", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("game_settings")
      .select("*");

    if (error) {

      return res.status(500).json({
        success: false,
        error: error.message
      });

    }

    res.json({
      success: true,
      settings: data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});


/* =========================================
   ADMIN — PLAYERS
========================================= */

app.get("/api/admin/players", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("player_profiles")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {

      return res.status(500).json({
        success: false,
        error: error.message
      });

    }

    res.json({
      success: true,
      players: data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});


/* =========================================
   ADMIN — TRANSACTIONS
========================================= */

app.get("/api/admin/transactions", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", {
        ascending: false
      })
      .limit(100);

    if (error) {

      return res.status(500).json({
        success: false,
        error: error.message
      });

    }

    res.json({
      success: true,
      transactions: data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});


/* =========================================
   ADMIN — LOCATIONS
========================================= */

app.get("/api/locations", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) {

      return res.status(500).json({
        success: false,
        error: error.message
      });

    }

    res.json({
      success: true,
      locations: data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});


/* =========================================
   404
========================================= */

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Abuja Life route not found."
  });

});


/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {

  console.log(
    `Abuja Life server running on port ${PORT}`
  );

});
